#include <Arduino.h>
#include <BLE2902.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#include "mcard_v1_profile.h"
#include "mcard_v1_protocol.h"

namespace mcard_v1 {
namespace {

BLECharacteristic* notifyCharacteristic = nullptr;
bool connected = false;

void printHex(const char* prefix, const uint8_t* bytes, size_t length) {
  Serial.print(prefix);
  for (size_t i = 0; i < length; ++i) {
    if (i > 0) Serial.print(' ');
    if (bytes[i] < 0x10) Serial.print('0');
    Serial.print(bytes[i], HEX);
  }
  Serial.println();
}

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*) override {
    connected = true;
    Serial.println("BLE connected");
  }

  void onDisconnect(BLEServer*) override {
    connected = false;
    Serial.println("BLE disconnected; advertising restarted");
    BLEDevice::startAdvertising();
  }
};

class WriteCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) override {
    const auto value = characteristic->getValue();
    const size_t length = value.length();
    if (length == 0) {
      Serial.println("WARN empty write");
      return;
    }

    const auto* bytes =
        reinterpret_cast<const uint8_t*>(value.c_str());
    printHex("RX ", bytes, length);

    FrameView frame;
    const ParseStatus status = parseFrame(bytes, length, frame);
    if (status != ParseStatus::OK) {
      Serial.printf("WARN %s\n", parseStatusName(status));
      return;
    }

    uint8_t response[profile::MAX_RESPONSE_BYTES] = {};
    const size_t responseLength = buildDeterministicResponse(
        frame,
        response,
        sizeof(response));
    if (responseLength == 0) {
      Serial.printf(
          "WARN unknown command %u for category 0x%02x\n",
          frame.command,
          frame.category);
      return;
    }
    if (!connected || notifyCharacteristic == nullptr) {
      Serial.println("WARN response ready without a connected central");
      return;
    }

    notifyCharacteristic->setValue(response, responseLength);
    notifyCharacteristic->notify();
    printHex("TX ", response, responseLength);
  }
};

}  // namespace

void initBle() {
  BLEDevice::init(profile::ADVERTISED_NAME);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  BLEService* service = server->createService(profile::SERVICE_UUID);
  BLECharacteristic* writeCharacteristic = service->createCharacteristic(
      profile::WRITE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_WRITE_NR);
  writeCharacteristic->setCallbacks(new WriteCallbacks());

  notifyCharacteristic = service->createCharacteristic(
      profile::NOTIFY_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_NOTIFY);
  notifyCharacteristic->addDescriptor(new BLE2902());

  service->start();
  BLEAdvertising* advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(profile::SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.printf("Advertising as %s\n", profile::ADVERTISED_NAME);
}

}  // namespace mcard_v1

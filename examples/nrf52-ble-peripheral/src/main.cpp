#include <Arduino.h>
#include <bluefruit.h>

#include <cstring>

#include "mcard_profile.h"

namespace {

constexpr size_t MAX_RESPONSE_BYTES = 64;
BLEService sampleService(mcard_profile::SERVICE_UUID);
BLECharacteristic writeCharacteristic(mcard_profile::WRITE_CHARACTERISTIC_UUID);
BLECharacteristic notifyCharacteristic(mcard_profile::NOTIFY_CHARACTERISTIC_UUID);

uint16_t readU16Le(const uint8_t* bytes) {
  return static_cast<uint16_t>(bytes[0]) |
         (static_cast<uint16_t>(bytes[1]) << 8);
}

uint32_t readU32Le(const uint8_t* bytes) {
  return static_cast<uint32_t>(bytes[0]) |
         (static_cast<uint32_t>(bytes[1]) << 8) |
         (static_cast<uint32_t>(bytes[2]) << 16) |
         (static_cast<uint32_t>(bytes[3]) << 24);
}

void appendU16Le(uint8_t* out, size_t& offset, uint16_t value) {
  out[offset++] = static_cast<uint8_t>(value & 0xff);
  out[offset++] = static_cast<uint8_t>((value >> 8) & 0xff);
}

void appendU32Le(uint8_t* out, size_t& offset, uint32_t value) {
  out[offset++] = static_cast<uint8_t>(value & 0xff);
  out[offset++] = static_cast<uint8_t>((value >> 8) & 0xff);
  out[offset++] = static_cast<uint8_t>((value >> 16) & 0xff);
  out[offset++] = static_cast<uint8_t>((value >> 24) & 0xff);
}

void printHex(const char* prefix, const uint8_t* bytes, size_t length) {
  Serial.print(prefix);
  for (size_t i = 0; i < length; ++i) {
    if (i > 0) {
      Serial.print(' ');
    }
    if (bytes[i] < 0x10) {
      Serial.print('0');
    }
    Serial.print(bytes[i], HEX);
  }
  Serial.println();
}

size_t makeControlResponse(
    uint16_t command,
    const uint8_t* data,
    size_t dataLength,
    uint8_t* out) {
  const size_t payloadLength = 2 + dataLength;
  if (4 + payloadLength > MAX_RESPONSE_BYTES) {
    return 0;
  }

  size_t offset = 0;
  out[offset++] = mcard_profile::CATEGORY_CONTROL;
  out[offset++] = mcard_profile::FRAGMENT_COMPLETE;
  appendU16Le(out, offset, static_cast<uint16_t>(payloadLength));
  appendU16Le(out, offset, command);
  memcpy(out + offset, data, dataLength);
  return offset + dataLength;
}

size_t makeLengthPrefixedAck(
    uint8_t category,
    uint16_t responseCommand,
    uint32_t packetIndex,
    uint8_t* out) {
  size_t offset = 0;
  out[offset++] = category;
  out[offset++] = mcard_profile::FRAGMENT_COMPLETE;
  appendU16Le(out, offset, 10);
  appendU16Le(out, offset, responseCommand);
  appendU16Le(out, offset, 6);
  appendU16Le(out, offset, mcard_profile::STATUS_OK);
  appendU32Le(out, offset, packetIndex);
  return offset;
}

uint16_t mapFileResponse(uint16_t command) {
  switch (command) {
    case mcard_profile::FILE_START_REQUEST:
      return mcard_profile::FILE_START_RESPONSE;
    case mcard_profile::FILE_SEND_START_REQUEST:
      return mcard_profile::FILE_SEND_START_RESPONSE;
    case mcard_profile::FILE_SEND_END_REQUEST:
      return mcard_profile::FILE_SEND_END_RESPONSE;
    case mcard_profile::FILE_SEND_DATA_REQUEST:
      return mcard_profile::FILE_SEND_DATA_RESPONSE;
    case mcard_profile::FILE_LOSE_CHECK_REQUEST:
      return mcard_profile::FILE_LOSE_CHECK_RESPONSE;
    case mcard_profile::FILE_INFO_REQUEST:
      return mcard_profile::FILE_INFO_RESPONSE;
    default:
      return 0;
  }
}

uint16_t mapOtaResponse(uint16_t command) {
  switch (command) {
    case mcard_profile::OTA_START_REQUEST:
      return mcard_profile::OTA_START_RESPONSE;
    case mcard_profile::OTA_DATA_REQUEST:
      return mcard_profile::OTA_DATA_RESPONSE;
    case mcard_profile::OTA_END_REQUEST:
      return mcard_profile::OTA_END_RESPONSE;
    default:
      return 0;
  }
}

size_t makeControlNotify(uint16_t command, uint8_t* out) {
  uint8_t data[24] = {};
  size_t dataLength = 0;
  uint16_t responseCommand = 0;

  switch (command) {
    case mcard_profile::CONTROL_GET_SERIAL_NUMBER:
      responseCommand = mcard_profile::CONTROL_SERIAL_NUMBER_RESPONSE;
      dataLength = strlen(mcard_profile::SAMPLE_SERIAL_NUMBER);
      memcpy(data, mcard_profile::SAMPLE_SERIAL_NUMBER, dataLength);
      break;
    case mcard_profile::CONTROL_GET_VERSION:
      responseCommand = mcard_profile::CONTROL_VERSION_RESPONSE;
      dataLength = strlen(mcard_profile::SAMPLE_VERSION);
      memcpy(data, mcard_profile::SAMPLE_VERSION, dataLength);
      break;
    case mcard_profile::CONTROL_GET_BATTERY:
      responseCommand = mcard_profile::CONTROL_BATTERY_RESPONSE;
      appendU16Le(data, dataLength, mcard_profile::SAMPLE_BATTERY_PERCENT);
      break;
    case mcard_profile::CONTROL_GET_STORAGE_INFO:
      responseCommand = mcard_profile::CONTROL_STORAGE_INFO_RESPONSE;
      appendU32Le(data, dataLength, 4096);
      appendU32Le(data, dataLength, 2048);
      appendU32Le(data, dataLength, 1024);
      break;
    case mcard_profile::CONTROL_GET_CONTROL_INFO:
      responseCommand = mcard_profile::CONTROL_CONTROL_INFO_RESPONSE;
      {
        const uint8_t flags[] = {1, 1, 1, 0, 0, 1, 0, 0};
        dataLength = sizeof(flags);
        memcpy(data, flags, dataLength);
      }
      break;
    case mcard_profile::CONTROL_GET_CAROUSEL:
      responseCommand = mcard_profile::CONTROL_CAROUSEL_RESPONSE;
      appendU16Le(data, dataLength, 5);
      break;
    default:
      return 0;
  }

  return makeControlResponse(responseCommand, data, dataLength, out);
}

size_t buildResponse(const uint8_t* request, size_t length, uint8_t* out) {
  if (length < 6) {
    Serial.println("WARN frame too short");
    return 0;
  }

  const uint8_t category = request[0];
  const uint8_t fragmentState = request[1];
  const uint16_t payloadLength = readU16Le(request + 2);
  if (payloadLength != length - 4) {
    Serial.println("WARN payload length mismatch");
    return 0;
  }
  if (fragmentState > mcard_profile::FRAGMENT_LAST) {
    Serial.println("WARN invalid fragment state");
    return 0;
  }

  const uint16_t command = readU16Le(request + 4);
  if (category == mcard_profile::CATEGORY_CONTROL) {
    const size_t responseLength = makeControlNotify(command, out);
    if (responseLength == 0) {
      Serial.printf("WARN unknown CONTROL command: %u\n", command);
    }
    return responseLength;
  }

  if (category != mcard_profile::CATEGORY_FILE &&
      category != mcard_profile::CATEGORY_OTA) {
    Serial.printf("WARN unknown category: 0x%02x\n", category);
    return 0;
  }

  if (payloadLength < 4) {
    Serial.println("WARN FILE/OTA payload missing data length");
    return 0;
  }
  const uint16_t dataLength = readU16Le(request + 6);
  if (payloadLength != static_cast<uint16_t>(4 + dataLength)) {
    Serial.println("WARN FILE/OTA data length mismatch");
    return 0;
  }

  const uint16_t responseCommand = category == mcard_profile::CATEGORY_FILE
      ? mapFileResponse(command)
      : mapOtaResponse(command);
  if (responseCommand == 0) {
    Serial.printf("WARN unknown command %u for category 0x%02x\n", command, category);
    return 0;
  }

  const uint32_t packetIndex = dataLength >= 4
      ? readU32Le(request + 8)
      : mcard_profile::DEFAULT_PACKET_INDEX;
  return makeLengthPrefixedAck(category, responseCommand, packetIndex, out);
}

void writeCallback(
    uint16_t connectionHandle,
    BLECharacteristic*,
    uint8_t* data,
    uint16_t length) {
  printHex("RX ", data, length);

  uint8_t response[MAX_RESPONSE_BYTES] = {};
  const size_t responseLength = buildResponse(data, length, response);
  if (responseLength == 0) {
    return;
  }

  if (!notifyCharacteristic.notify(connectionHandle, response, responseLength)) {
    Serial.println("WARN notify failed or notifications are not enabled");
    return;
  }
  printHex("TX ", response, responseLength);
}

void connectCallback(uint16_t) {
#ifdef LED_BUILTIN
  digitalWrite(LED_BUILTIN, HIGH);
#endif
  Serial.println("BLE connected");
}

void disconnectCallback(uint16_t, uint8_t) {
#ifdef LED_BUILTIN
  digitalWrite(LED_BUILTIN, LOW);
#endif
  Serial.println("BLE disconnected; advertising continues");
}

void initBle() {
  Bluefruit.begin();
  Bluefruit.setName(mcard_profile::ADVERTISED_NAME);
  Bluefruit.Periph.setConnectCallback(connectCallback);
  Bluefruit.Periph.setDisconnectCallback(disconnectCallback);

  sampleService.begin();

  writeCharacteristic.setProperties(CHR_PROPS_WRITE | CHR_PROPS_WRITE_WO_RESP);
  writeCharacteristic.setPermission(SECMODE_OPEN, SECMODE_OPEN);
  writeCharacteristic.setMaxLen(512);
  writeCharacteristic.setWriteCallback(writeCallback);
  writeCharacteristic.begin();

  notifyCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  notifyCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  notifyCharacteristic.setMaxLen(MAX_RESPONSE_BYTES);
  notifyCharacteristic.begin();

  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addService(sampleService);
  Bluefruit.ScanResponse.addName();
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);
  Bluefruit.Advertising.setFastTimeout(30);
  Bluefruit.Advertising.start(0);
}

}  // namespace

void setup() {
#ifdef LED_BUILTIN
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
#endif
  Serial.begin(115200);
  delay(250);

  Serial.println("MCard-StarterKit public-safe BLE emulator");
  initBle();
  Serial.printf("Advertising as %s\n", mcard_profile::ADVERTISED_NAME);
}

void loop() {
  delay(250);
}

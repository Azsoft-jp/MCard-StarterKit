#pragma once

#include <Arduino.h>

namespace mcard_profile {

constexpr char ADVERTISED_NAME[] = "MCardKit-Emu";
constexpr char SERVICE_UUID[] = "7a2f0000-2b3c-4d5e-8f90-000000000000";
constexpr char WRITE_CHARACTERISTIC_UUID[] = "7a2f0002-2b3c-4d5e-8f90-000000000000";
constexpr char NOTIFY_CHARACTERISTIC_UUID[] = "7a2f0003-2b3c-4d5e-8f90-000000000000";

constexpr uint8_t CATEGORY_OTA = 0x01;
constexpr uint8_t CATEGORY_FILE = 0x04;
constexpr uint8_t CATEGORY_CONTROL = 0x1f;

constexpr uint8_t FRAGMENT_COMPLETE = 0;
constexpr uint8_t FRAGMENT_LAST = 3;

constexpr uint16_t CONTROL_GET_SERIAL_NUMBER = 18;
constexpr uint16_t CONTROL_SERIAL_NUMBER_RESPONSE = 19;
constexpr uint16_t CONTROL_GET_VERSION = 20;
constexpr uint16_t CONTROL_VERSION_RESPONSE = 21;
constexpr uint16_t CONTROL_GET_BATTERY = 22;
constexpr uint16_t CONTROL_BATTERY_RESPONSE = 23;
constexpr uint16_t CONTROL_GET_STORAGE_INFO = 32;
constexpr uint16_t CONTROL_STORAGE_INFO_RESPONSE = 33;
constexpr uint16_t CONTROL_GET_CONTROL_INFO = 40;
constexpr uint16_t CONTROL_CONTROL_INFO_RESPONSE = 41;
constexpr uint16_t CONTROL_GET_CAROUSEL = 60;
constexpr uint16_t CONTROL_CAROUSEL_RESPONSE = 61;

constexpr uint16_t FILE_START_REQUEST = 0;
constexpr uint16_t FILE_START_RESPONSE = 1;
constexpr uint16_t FILE_SEND_START_REQUEST = 2;
constexpr uint16_t FILE_SEND_START_RESPONSE = 3;
constexpr uint16_t FILE_SEND_END_REQUEST = 6;
constexpr uint16_t FILE_SEND_END_RESPONSE = 7;
constexpr uint16_t FILE_SEND_DATA_REQUEST = 8;
constexpr uint16_t FILE_SEND_DATA_RESPONSE = 9;
constexpr uint16_t FILE_LOSE_CHECK_REQUEST = 10;
constexpr uint16_t FILE_LOSE_CHECK_RESPONSE = 11;
constexpr uint16_t FILE_INFO_REQUEST = 13;
constexpr uint16_t FILE_INFO_RESPONSE = 14;

constexpr uint16_t OTA_START_REQUEST = 38;
constexpr uint16_t OTA_START_RESPONSE = 39;
constexpr uint16_t OTA_DATA_REQUEST = 40;
constexpr uint16_t OTA_DATA_RESPONSE = 41;
constexpr uint16_t OTA_END_REQUEST = 42;
constexpr uint16_t OTA_END_RESPONSE = 43;

constexpr char SAMPLE_SERIAL_NUMBER[] = "MCARD-SAMPLE-0001";
constexpr char SAMPLE_VERSION[] = "0.1.0";
constexpr uint16_t SAMPLE_BATTERY_PERCENT = 87;
constexpr uint16_t STATUS_OK = 0;
constexpr uint32_t DEFAULT_PACKET_INDEX = 1;

}  // namespace mcard_profile

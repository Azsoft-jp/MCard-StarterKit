#pragma once

#include <cstdint>

namespace mcard_v1::pins {

// TODO: VERIFY every assignment against the reviewed schematic, exact
// ESP32-S3 module pinout, strapping rules, native USB, and the assembled PCB.
// A value of -1 keeps the peripheral disabled in the PR-4 skeleton.
constexpr int8_t TFT_CS = -1;
constexpr int8_t TFT_DC = -1;
constexpr int8_t TFT_RESET = -1;
constexpr int8_t TFT_SCLK = -1;
constexpr int8_t TFT_MOSI = -1;
constexpr int8_t TFT_BACKLIGHT = -1;

constexpr int8_t NFC_SDA = -1;
constexpr int8_t NFC_SCL = -1;
constexpr int8_t NFC_GPO = -1;

constexpr int8_t RGB_LEFT_DATA = -1;
constexpr int8_t RGB_RIGHT_DATA = -1;

constexpr int8_t BUTTON_LEFT = -1;
constexpr int8_t BUTTON_CENTER = -1;
constexpr int8_t BUTTON_RIGHT = -1;

constexpr int8_t PIEZO_ENABLE = -1;
constexpr int8_t VIBRATION_ENABLE = -1;
constexpr int8_t BATTERY_ADC = -1;
constexpr int8_t CHARGER_STATUS = -1;

#if defined(MCARD_WOKWI_SIM)
// Simulation harness only. This is not a V1 product pin assignment.
constexpr int8_t STATUS_LED = 4;
#else
constexpr int8_t STATUS_LED = -1;
#endif

}  // namespace mcard_v1::pins

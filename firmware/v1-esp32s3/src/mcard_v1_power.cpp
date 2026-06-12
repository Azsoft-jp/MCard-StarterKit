#include <Arduino.h>

#include "mcard_v1_pins.h"
#include "mcard_v1_profile.h"

namespace mcard_v1 {
namespace {

void configureOffOutput(int8_t pin) {
  if (pin < 0) return;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
}

}  // namespace

void initPower() {
  configureOffOutput(pins::TFT_BACKLIGHT);
  configureOffOutput(pins::RGB_LEFT_DATA);
  configureOffOutput(pins::RGB_RIGHT_DATA);
  configureOffOutput(pins::PIEZO_ENABLE);
  configureOffOutput(pins::VIBRATION_ENABLE);
  configureOffOutput(pins::STATUS_LED);

  if (pins::BATTERY_ADC >= 0) pinMode(pins::BATTERY_ADC, INPUT);
  if (pins::CHARGER_STATUS >= 0) pinMode(pins::CHARGER_STATUS, INPUT);

  Serial.println("Pins are placeholders; outputs remain disabled");
}

uint16_t readBatteryPercent() {
  // Deterministic sample data until divider, ADC pin, calibration, and the
  // protected-cell discharge curve are verified.
  return profile::SAMPLE_BATTERY_PERCENT;
}

}  // namespace mcard_v1

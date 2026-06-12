#include <Arduino.h>

#include "mcard_v1_pins.h"
#include "mcard_v1_profile.h"

namespace mcard_v1 {
namespace {

#if defined(MCARD_WOKWI_SIM)
constexpr uint32_t SIM_HEARTBEAT_HALF_PERIOD_MS = 500;
uint32_t lastHeartbeatChange = 0;
bool heartbeatHigh = false;
#endif

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

#if defined(MCARD_WOKWI_SIM)
  Serial.println("Product pins are placeholders; simulation heartbeat enabled");
#else
  Serial.println("Pins are placeholders; outputs remain disabled");
#endif
}

void servicePower() {
#if defined(MCARD_WOKWI_SIM)
  const uint32_t now = millis();
  if (now - lastHeartbeatChange < SIM_HEARTBEAT_HALF_PERIOD_MS) return;

  lastHeartbeatChange = now;
  heartbeatHigh = !heartbeatHigh;
  digitalWrite(pins::STATUS_LED, heartbeatHigh ? HIGH : LOW);
#endif
}

uint16_t readBatteryPercent() {
  // Deterministic sample data until divider, ADC pin, calibration, and the
  // protected-cell discharge curve are verified.
  return profile::SAMPLE_BATTERY_PERCENT;
}

}  // namespace mcard_v1

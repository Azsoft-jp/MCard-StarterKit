#include <Arduino.h>

#include "mcard_v1_pins.h"

namespace mcard_v1 {

void initDisplay() {
  if (pins::TFT_BACKLIGHT >= 0) {
    pinMode(pins::TFT_BACKLIGHT, OUTPUT);
    digitalWrite(pins::TFT_BACKLIGHT, LOW);
  }

  Serial.println(
      "Display disabled: TODO: VERIFY controller, FPC pinout, SPI pins, "
      "backlight driver, and library");
}

void serviceDisplay() {
  // The PR-4 skeleton intentionally has no guessed display driver.
}

}  // namespace mcard_v1

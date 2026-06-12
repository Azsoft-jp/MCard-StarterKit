#include <Arduino.h>

#include "mcard_v1_pins.h"

namespace mcard_v1 {
namespace {

struct ButtonState {
  int8_t pin;
  const char* name;
  int lastValue;
};

ButtonState buttons[] = {
    {pins::BUTTON_LEFT, "left", HIGH},
    {pins::BUTTON_CENTER, "center", HIGH},
    {pins::BUTTON_RIGHT, "right", HIGH}};

}  // namespace

void initUi() {
  for (auto& button : buttons) {
    if (button.pin < 0) continue;
    pinMode(button.pin, INPUT_PULLUP);
    button.lastValue = digitalRead(button.pin);
  }
  Serial.println("UI pins disabled until schematic GPIO review");
}

void serviceUi() {
  for (auto& button : buttons) {
    if (button.pin < 0) continue;
    const int value = digitalRead(button.pin);
    if (value != button.lastValue) {
      button.lastValue = value;
      Serial.printf(
          "Button %s %s\n",
          button.name,
          value == LOW ? "pressed" : "released");
    }
  }
}

}  // namespace mcard_v1

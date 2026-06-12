#include <Arduino.h>

namespace mcard_v1 {
void initBle();
void initDisplay();
void initPower();
void initUi();
void serviceDisplay();
void serviceUi();
}  // namespace mcard_v1

void setup() {
  Serial.begin(115200);
  delay(250);
  Serial.println();
  Serial.println("MCardKit-V1 boot");

  mcard_v1::initPower();
  mcard_v1::initDisplay();
  mcard_v1::initUi();
  mcard_v1::initBle();
}

void loop() {
  mcard_v1::serviceDisplay();
  mcard_v1::serviceUi();
  delay(10);
}

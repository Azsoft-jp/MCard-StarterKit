#include <Arduino.h>

namespace mcard_v1 {
void initBle();
void initDisplay();
void initPower();
void initUi();
void serviceDisplay();
void servicePower();
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
#if defined(MCARD_WOKWI_SIM)
  // Wokwi validates boot and virtual GPIO timing, not the BLE radio.
  Serial.println("Wokwi simulation ready");
#else
  mcard_v1::initBle();
#endif
}

void loop() {
  mcard_v1::servicePower();
  mcard_v1::serviceDisplay();
  mcard_v1::serviceUi();
  delay(10);
}

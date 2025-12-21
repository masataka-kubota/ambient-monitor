#include "ble_manager.h"
#include "cloud_client.h"
#include "sensor_manager.h"
#include "wifi_manager.h"
#include "secrets.h"

// ---------------- Constants ----------------
const unsigned long BLE_INTERVAL_MS  = 1 * 60 * 1000; // 1 minute
const unsigned long CLOUD_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

unsigned long lastBleTick  = 0;
unsigned long lastCloudTick = 0;

// ---------------- Time Sync ----------------
static void syncTime() {
  configTime(0, 0, "pool.ntp.org", "ntp.nict.jp");

  Serial.print("Syncing time");
  while (time(nullptr) < 1700000000) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nTime synchronized!");
}

// ---------------- Reset BLE tick ----------------
void resetBleTick() {
  lastBleTick = 0;
}

// ---------------- setup ----------------
void setup() {
  Serial.begin(115200);

  SensorManager::init();

  if (WiFiManager::connect()) {
    syncTime();
  } else {
    Serial.println("WiFi not connected");
  }

  CloudClient::init();
  BLEManager::init();
}

// ---------------- loop ----------------
void loop() {
  const unsigned long now = millis();
  float t, h, p;

  // ---- BLE update (connected only) ----
  if (BLEManager::isClientConnected() &&
      (lastBleTick == 0 || now - lastBleTick >= BLE_INTERVAL_MS)) {

    if (SensorManager::readMeasurement(t, h, p)) {
      const bool notify = (lastBleTick != 0);
      BLEManager::updateMeasurement(t, h, p, notify);
    }
    lastBleTick = now;
  }

  // ---- Cloud publish ----
  if (lastCloudTick == 0 || now - lastCloudTick >= CLOUD_INTERVAL_MS) {
    if (SensorManager::readMeasurement(t, h, p)) {
      SensorMeasurement m{t, h, p};
      CloudClient::publishMeasurement(m);
    }
    lastCloudTick = now;
  }
}
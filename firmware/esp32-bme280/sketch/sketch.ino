#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <JWTUtils.h>

#include "ble_manager.h"
#include "sensor_manager.h"
#include "wifi_manager.h"
#include "secrets.h"

String DEVICE_JWT;

const unsigned long JWT_EXPIRATION_SEC = 60; // 60 seconds

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

// ---------------- JWT ----------------
static String generateJWT() {
  time_t now = time(nullptr);

  DynamicJsonDocument doc(256);
  doc["iat"] = now;
  doc["exp"] = now + JWT_EXPIRATION_SEC;
  doc["iss"] = DEVICE_ID;

  String payload;
  serializeJson(doc, payload);

  return JWTUtils::createJWT(payload, DEVICE_SECRET);
}

// ---------------- Cloud Publish ----------------
static void publishSensorData(float t, float h, float p) {
  if (WiFi.status() != WL_CONNECTED) return;

  DynamicJsonDocument doc(256);
  doc["temperature"] = t;
  doc["humidity"]    = h;
  doc["pressure"]    = p;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(HONO_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + generateJWT());
  http.addHeader("X-Device-Id", DEVICE_ID);

  int status = http.POST(body);
  Serial.printf("Cloud response: %d\n", status);

  http.end();
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
      publishSensorData(t, h, p);
    }
    lastCloudTick = now;
  }
}
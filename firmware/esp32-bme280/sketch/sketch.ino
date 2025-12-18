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

unsigned long lastBleNotify  = 0;
unsigned long lastCloudPublish = 0;

// ---------------- NTP ----------------
void syncTime() {
  configTime(0, 0, "pool.ntp.org", "ntp.nict.jp"); // UTC

  Serial.print("Syncing time");
  while (time(nullptr) < 1700000000) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nTime synchronized!");
}

// ---------------- JWT ----------------
String generateJWT() {
  time_t now = time(nullptr);

  DynamicJsonDocument doc(256);
  doc["iat"] = now;
  doc["exp"] = now + JWT_EXPIRATION_SEC;
  doc["iss"] = DEVICE_ID;

  String payload;
  serializeJson(doc, payload);

  return JWTUtils::createJWT(payload, DEVICE_SECRET);
}

// ---------------- POST ----------------
void publishSensorData(float t, float h, float p) {

  DynamicJsonDocument doc(256);
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["pressure"] = p;

  String jsonStr;
  serializeJson(doc, jsonStr);

  DEVICE_JWT = generateJWT();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(HONO_API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("Bearer ") + DEVICE_JWT);
    http.addHeader("X-Device-Id", DEVICE_ID);

    int status = http.POST(jsonStr);

    Serial.print("Response code: ");
    Serial.println(status);
    Serial.println("Response body: " + http.getString());

    http.end();
  }
}

// ---------------- setup ----------------
void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (!SensorManager::init()) {
    Serial.println("FATAL: BME280 could not be initialized!");
  }

  bool wifiConnected = connectToWiFi();
  if (wifiConnected) {
    syncTime();
  } else {
    Serial.println("WiFi not connected, skip time sync");
  }
  
  initBLE();
}

// ---------------- loop ----------------
void loop() {
  unsigned long now = millis();
  float t, h, p;

  // --- BLE notify (every 1min / connected only) ---
  if (bleClientConnected && (lastBleNotify == 0 || now - lastBleNotify >= BLE_INTERVAL_MS)) {
    if (SensorManager::readMeasurement(t, h, p)) {
      bool doNotify = lastBleNotify != 0;
      notifyMeasurement(t, h, p, doNotify);
    }
    lastBleNotify = now;
  }

  // --- Cloud publish (every 5min / always) ---
  if ((lastCloudPublish == 0 || now - lastCloudPublish >= CLOUD_INTERVAL_MS)) {
    if (SensorManager::readMeasurement(t, h, p)) {
      publishSensorData(t, h, p);
    }
    lastCloudPublish = now;
  }
}

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <JWTUtils.h>
#include "secrets.h"

Adafruit_BME280 bme;
String DEVICE_JWT;

const unsigned long PUBLISH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const unsigned long JWT_EXPIRATION_SEC = 30; // 30 seconds
unsigned long lastPublish = 0;

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

// ---------------- Wi-Fi ----------------
void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
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
void publishSensorData() {
  float temperature = bme.readTemperature();
  float humidity = bme.readHumidity();
  float pressure = bme.readPressure() / 100.0;

  DynamicJsonDocument doc(256);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["pressure"] = pressure;

  String jsonStr;
  serializeJson(doc, jsonStr);

  // Generate JWT
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
  } else {
    Serial.println("WiFi not connected!");
  }
}

// ---------------- setup ----------------
void setup() {
  Serial.begin(115200);
  while (!Serial);

  if (!bme.begin(0x76)) {
    Serial.println("BME280 not found!");
    while (1);
  }
  Serial.println("BME280 sensor initialized successfully!");

  connectToWiFi();
  syncTime();
}

// ---------------- loop ----------------
void loop() {
  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL_MS) {
    publishSensorData();
    lastPublish = now;
  }
}

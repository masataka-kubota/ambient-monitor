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

// ---------------- Validate BME Data ----------------
bool validateReading(float t, float h, float p) {
  if (isnan(t) || isnan(h) || isnan(p)) return false;
  if (t < -10 || t > 40) return false; // temperature: -10～40℃
  if (h < 0 || h > 100) return false;  // humidity: 0～100%
  if (p < 850 || p > 1100) return false; // pressure: 850～1100hPa
  return true;
}

// ---------------- I2C & BME Recover ----------------
bool recoverBME() {
  Serial.println("Recovering BME280...");

  Wire.end();
  delay(50);
  Wire.begin(21, 22, 100000);  // SCL=22, SDA=21

  delay(50);
  bool ok = bme.begin(0x76);

  if (ok) Serial.println("BME280 recovered!");
  else Serial.println("BME280 recovery failed.");

  return ok;
}

// ---------------- Init BME (extracted) ----------------
bool initBME() {
  Serial.println("Initializing BME280...");

  Wire.begin(21, 22, 100000);
  delay(50);

  if (bme.begin(0x76)) {
    Serial.println("BME280 initialized!");
    return true;
  }

  Serial.println("BME280 not found! Trying recovery...");
  return recoverBME();
}

// ---------------- Safe Read ----------------
bool readSafeBME(float &t, float &h, float &p) {
  for (int i = 0; i < 5; i++) {
    t = bme.readTemperature();
    h = bme.readHumidity();
    p = bme.readPressure() / 100.0;

    if (validateReading(t, h, p)) return true;

    Serial.println("Invalid reading, retrying...");
    delay(50);
  }

  // 5 times failed → recover
  return recoverBME();
}

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
  Serial.print("IP: ");
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
  float t, h, p;

  if (!readSafeBME(t, h, p)) {
    Serial.println("ERROR: Failed to get valid BME data.");
    return;
  }

    Serial.printf("Temp: %.2f °C  Humidity: %.2f %%  Pressure: %.2f hPa\n", t, h, p);


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

  if (!initBME()) {
    Serial.println("FATAL: BME280 could not be initialized!");
  }

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

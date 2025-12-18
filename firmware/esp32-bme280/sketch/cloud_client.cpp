#include "cloud_client.h"
#include "secrets.h"

const unsigned long JWT_EXPIRATION_SEC = 60;

void CloudClient::init() {}

String CloudClient::generateJWT() {
  time_t now = time(nullptr);

  DynamicJsonDocument doc(256);
  doc["iat"] = now;
  doc["exp"] = now + JWT_EXPIRATION_SEC;
  doc["iss"] = DEVICE_ID;

  String payload;
  serializeJson(doc, payload);
  return JWTUtils::createJWT(payload, DEVICE_SECRET);
}

bool CloudClient::publishMeasurement(const SensorMeasurement& m) {
  if (WiFi.status() != WL_CONNECTED) return false;

  DynamicJsonDocument doc(256);
  doc["temperature"] = m.temperature;
  doc["humidity"]    = m.humidity;
  doc["pressure"]    = m.pressure;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(HONO_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + generateJWT());
  http.addHeader("X-Device-Id", DEVICE_ID);

  int status = http.POST(body);

  if (status < 0) {
    Serial.printf("HTTP error: %s\n", http.errorToString(status).c_str());
    http.end();
    return false;
  }

  if (status == 401 || status == 403) {
    Serial.printf("Auth error: %d\n", status);
    http.end();
    return false;
  }

  if (status < 200 || status >= 300) {
    Serial.printf("Cloud error: %d\n", status);
    http.end();
    return false;
  }

  http.end();
  return true;
}
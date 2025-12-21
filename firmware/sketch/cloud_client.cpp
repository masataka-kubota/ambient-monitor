#include "cloud_client.h"
#include "secrets.h"
#include "root_ca.h"

const unsigned long JWT_EXPIRATION_SEC = 60;

NetworkClientSecure client;

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
  
  StaticJsonDocument<128> doc;
  doc["temperature"] = round(m.temperature * 100.0f) / 100.0f;
  doc["humidity"]    = round(m.humidity * 100.0f) / 100.0f;
  doc["pressure"]    = round(m.pressure * 100.0f) / 100.0f;
  
  String body;
  serializeJson(doc, body);
  
  HTTPClient http;
  bool isHttps = String(HONO_API_URL).startsWith("https://");

  if (isHttps) {
      client.setCACert(ROOT_CA);
      http.begin(client, HONO_API_URL);
  } else {
      http.begin(HONO_API_URL);
  }

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
#pragma once

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <JWTUtils.h>

struct SensorMeasurement {
  float temperature;
  float humidity;
  float pressure;
};

class CloudClient {
public:
  static void init();
  static bool publishMeasurement(const SensorMeasurement& m);

private:
  static String generateJWT();
};
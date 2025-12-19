#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>
#include <BLE2902.h>

struct __attribute__((packed)) Measurement {
  int16_t  t;   // temperature * 100
  int16_t  h;   // humidity * 100
  int32_t  p;   // pressure (Pa)
  uint32_t ts;  // unix seconds
};

struct __attribute__((packed)) WiFiStatusPayload {
  uint8_t status;
  char ssid[32];
};

class BLEManager {
public:
  // Initialize BLE service & characteristics
  static void init();

  // Connection state
  static bool isClientConnected();

  // WiFi status update
  static void setWiFiStatus(
    const char* status,
    const char* ssid = nullptr,
    bool notify = false
  );

  // Measurement update / notify
  static void updateMeasurement(
    float t,
    float h,
    float p,
    bool notify = false
  );

  // BLE callbacks
  static void onClientConnected();
  static void onClientDisconnected();

private:
  // BLE state
  static volatile bool clientConnected;

  static BLECharacteristic* wifiConfigChar;
  static BLECharacteristic* wifiStatusChar;
  static BLECharacteristic* measurementChar;
};
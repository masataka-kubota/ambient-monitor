#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <NimBLEDevice.h>

// ---------------- Constants ----------------
#define WIFI_SSID_MAX_LEN     32
#define WIFI_PASSWORD_MAX_LEN 64

// ---------------- BLE Payloads ----------------
struct __attribute__((packed)) Measurement {
  int16_t  t;   // temperature * 100
  int16_t  h;   // humidity * 100
  int32_t  p;   // pressure (Pa)
  uint32_t ts;  // unix seconds
};

struct __attribute__((packed)) WiFiStatusPayload {
  uint8_t status;
  char ssid[WIFI_SSID_MAX_LEN];
};

struct __attribute__((packed)) WiFiConfigPayload {
  char ssid[WIFI_SSID_MAX_LEN];
  char password[WIFI_PASSWORD_MAX_LEN];
};

// ---------------- BLE Manager ----------------
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

  static NimBLECharacteristic* wifiConfigChar;
  static NimBLECharacteristic* wifiStatusChar;
  static NimBLECharacteristic* measurementChar;
};
#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>
#include <BLE2902.h>

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
#pragma once
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>
#include <BLE2902.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include "secrets.h"

extern volatile bool bleClientConnected;

void initBLE();

// Unified WiFi status setter
void setWiFiStatus(const char* status, const char* ssid = nullptr, bool notify = false);

// Unified measurement notifier
void notifyMeasurement(float t, float h, float p);

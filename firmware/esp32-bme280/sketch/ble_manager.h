#pragma once
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLEAdvertising.h>
#include <BLE2902.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include "secrets.h"

void initBLE();

// Unified WiFi status setter
// notify = true  -> send NOTIFY
// notify = false -> just set READ value
void setWiFiStatus(const char* status, const char* ssid = nullptr, bool notify = false);

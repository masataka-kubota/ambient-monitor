#include "ble_manager.h"
#include <Arduino.h>

const char* BLE_DEVICE_NAME = "ESP32-Monitor";

void initBLE() {
    Serial.println("Initializing BLE...");

    BLEDevice::init(BLE_DEVICE_NAME);

    BLEServer *pServer = BLEDevice::createServer();
    BLEService *service = pServer->createService(BLE_SERVICE_UUID);

    service->start();

    BLEAdvertising *advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(BLE_SERVICE_UUID);
    advertising->setScanResponse(true);
    advertising->setMinPreferred(0x06);
    advertising->setMaxPreferred(0x12);

    advertising->start();
    Serial.println("BLE advertising started!");
}

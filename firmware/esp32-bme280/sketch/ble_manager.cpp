#include "ble_manager.h"
#include <Arduino.h>

const char* BLE_DEVICE_NAME = "ESP32-Monitor";

/**
 * BLE server callbacks
 * - Allow only one client connection
 * - Stop advertising while connected
 */
class SingleConnectionServerCallbacks : public BLEServerCallbacks {
public:
    void onConnect(BLEServer* pServer) override {
        Serial.println("🔗 BLE client connected");
        BLEDevice::getAdvertising()->stop();
        Serial.println("🛑 Advertising stopped (single connection mode)");
    }

    void onDisconnect(BLEServer* pServer) override {
        Serial.println("❌ BLE client disconnected");
        BLEDevice::getAdvertising()->start();
        Serial.println("📢 Advertising restarted");
    }
};

void initBLE() {
    Serial.println("Initializing BLE...");

    BLEDevice::init(BLE_DEVICE_NAME);

    BLEServer* pServer = BLEDevice::createServer();
    pServer->setCallbacks(new SingleConnectionServerCallbacks());

    BLEService* service = pServer->createService(BLE_SERVICE_UUID);
    service->start();

    BLEAdvertising* advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(BLE_SERVICE_UUID);
    advertising->setScanResponse(true);
    advertising->setMinPreferred(0x06);
    advertising->setMaxPreferred(0x12);

    advertising->start();
    Serial.println("BLE advertising started!");
}

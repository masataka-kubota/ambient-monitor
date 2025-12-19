#include "ble_manager.h"
#include "wifi_manager.h"
#include "secrets.h"

// Forward declaration (defined in sketch.ino)
extern void resetBleTick();

// ---------------- BLE UUIDs ----------------
#define BLE_SERVICE_UUID        "43373C9D-F63D-4C72-A978-ABD8523DABFB"
#define WIFI_CONFIG_CHAR_UUID   "5FD5AD97-4A4E-4E7E-BB31-7D69E179D965"
#define WIFI_STATUS_CHAR_UUID   "76B20411-217E-49E4-87DE-D544FB19A443"
#define MEASUREMENT_CHAR_UUID   "1DE752AB-EA22-4757-85B2-AC35C7FBB5E1"

static const char* BLE_DEVICE_NAME = "ESP32-Monitor";

// ---------------- Static members ----------------
volatile bool BLEManager::clientConnected = false;

NimBLECharacteristic* BLEManager::wifiConfigChar   = nullptr;
NimBLECharacteristic* BLEManager::wifiStatusChar   = nullptr;
NimBLECharacteristic* BLEManager::measurementChar  = nullptr;

// ---------------- Server Callbacks ----------------
class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override {
    BLEManager::onClientConnected();
  }

  void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override {
    BLEManager::onClientDisconnected();
  }
};

// ---------------- WiFi Config Write Callback ----------------
class WiFiConfigCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override {
    String value = pCharacteristic->getValue();
    if (value.isEmpty()) return;

    DynamicJsonDocument doc(128);
    if (deserializeJson(doc, value)) return;

    String ssid = doc["ssid"] | "";
    String password = doc["password"] | "";

    if (ssid.isEmpty()) {
      WiFiManager::clearConfig();
      BLEManager::setWiFiStatus("not_configured", nullptr, true);
      return;
    }

    BLEManager::setWiFiStatus("connecting", ssid.c_str(), true);

    if (WiFiManager::temporaryConnect(ssid, password)) {
      WiFiManager::saveConfig(ssid, password);
      BLEManager::setWiFiStatus("connected", ssid.c_str(), true);
    } else {
      BLEManager::setWiFiStatus("failed", nullptr, true);
    }
  }
};

// ---------------- Public API ----------------
void BLEManager::init() {
  NimBLEDevice::init(BLE_DEVICE_NAME);

  NimBLEServer* server = NimBLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  NimBLEService* service = server->createService(BLE_SERVICE_UUID);

  wifiConfigChar = service->createCharacteristic(
    WIFI_CONFIG_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  wifiConfigChar->setCallbacks(new WiFiConfigCallbacks());

  wifiStatusChar = service->createCharacteristic(
    WIFI_STATUS_CHAR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );

  measurementChar = service->createCharacteristic(
    MEASUREMENT_CHAR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );

  WiFiConfig config;
  if (!WiFiManager::loadConfig(config)) {
    setWiFiStatus("not_configured", nullptr, false);
  } else if (WiFi.status() == WL_CONNECTED) {
    setWiFiStatus("connected", config.ssid.c_str(), false);
  } else {
      setWiFiStatus("configured", config.ssid.c_str(), false);
  }

  service->start();
  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();
  adv->enableScanResponse(true);
  adv->addServiceUUID(BLE_SERVICE_UUID);
  adv->setName(BLE_DEVICE_NAME);
  adv->start();
}

bool BLEManager::isClientConnected() {
  return clientConnected;
}

void BLEManager::setWiFiStatus(const char* status, const char* ssid, bool notify) {
  if (!wifiStatusChar) return;

  WiFiStatusPayload payload = {0};
  if (strcmp(status, "not_configured") == 0) payload.status = 0;
  else if (strcmp(status, "configured") == 0) payload.status = 1;
  else if (strcmp(status, "connecting") == 0) payload.status = 2;
  else if (strcmp(status, "connected") == 0) payload.status = 3;
  else if (strcmp(status, "failed") == 0) payload.status = 4;

  if (ssid) strncpy(payload.ssid, ssid, sizeof(payload.ssid)-1);

  wifiStatusChar->setValue((uint8_t*)&payload, sizeof(payload));
  if (notify) wifiStatusChar->notify();
}

void BLEManager::updateMeasurement(float t, float h, float p, bool notify) {
  if (!measurementChar || !clientConnected) return;

  Measurement m;
  m.t  = (int16_t)round(t * 100.0f);
  m.h  = (int16_t)round(h * 100.0f);
  m.p  = (int32_t)round(p * 100.0f); // hPa → Pa
  m.ts = (uint32_t)time(nullptr);

  measurementChar->setValue((uint8_t*)&m, sizeof(m));
  if (notify) measurementChar->notify();
}

// ---------------- Internal ----------------
void BLEManager::onClientConnected() {
  clientConnected = true;
  NimBLEDevice::getAdvertising()->stop();
}

void BLEManager::onClientDisconnected() {
  clientConnected = false;
  resetBleTick();
  NimBLEDevice::getAdvertising()->start();
}

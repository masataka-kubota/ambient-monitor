#include "sensor_manager.h"

// ---------------- Static variable initialization ----------------
Adafruit_BME280 SensorManager::bme;
float SensorManager::pHistory[5] = {0};
int SensorManager::pHistoryIndex = 0;
bool SensorManager::pHistoryFilled = false;
float SensorManager::prevPressure = NAN;
float SensorManager::lastValidH = NAN;

// ---------------- Initialization ----------------
bool SensorManager::init() {
  Serial.println("Initializing BME280...");
  Wire.begin(21, 22, 50000); // Initialize I2C with SDA=21, SCL=22
  delay(100);

  if (bme.begin(0x76)) {
    Serial.println("BME280 initialized!");
    bme.setSampling(Adafruit_BME280::MODE_FORCED,
                    Adafruit_BME280::SAMPLING_X2, // Temp
                    Adafruit_BME280::SAMPLING_X16, // Pressure
                    Adafruit_BME280::SAMPLING_X1, // Humidity
                    Adafruit_BME280::FILTER_OFF);
    return true;
  }

  Serial.println("BME280 not found! Trying recovery...");
  return recoverBME();
}

// ---------------- Measurement reading ----------------
bool SensorManager::readMeasurement(float &t, float &h, float &p) {
  bool success = readSafeBME(t, h, p);

  Serial.printf("Temp: %.2f °C  Humidity: %.2f %%  Pressure: %.2f hPa\n", t, h, p);

  if (!success) {
    Serial.println("ERROR: Failed to get valid BME data.");
  }

  return success;
}

// ---------------- Internal reading with retries ----------------
bool SensorManager::readSafeBME(float &t, float &h, float &p) {
  const int maxRetries = 10;
  const int retryDelayMs = 200;

  for (int i = 0; i < maxRetries; i++) {
    if (readAndValidate(t, h, p)) return true;

    Serial.println("Invalid reading, retrying...");
    delay(retryDelayMs);
  }

  if (!recoverBME()) return false;

  delay(200);
  return readAndValidate(t, h, p);
}

// ---------------- Read and validate single measurement ----------------
bool SensorManager::readAndValidate(float &t, float &h, float &p) {
  // Set Forced Mode
  bme.setSampling(Adafruit_BME280::MODE_FORCED,
                  Adafruit_BME280::SAMPLING_X2, // Temp
                  Adafruit_BME280::SAMPLING_X16, // Pressure
                  Adafruit_BME280::SAMPLING_X1, // Humidity
                  Adafruit_BME280::FILTER_OFF);

  // Wait for measurement to complete
  bme.takeForcedMeasurement();

  delay(100);

  // Read measurements
  t = bme.readTemperature();
  h = bme.readHumidity();
  p = bme.readPressure() / 100.0;

  if (!validateReading(t, h, p)) return false;
  if (!validateHumidityAdvanced(h)) return false;
  if (!validatePressureAdvanced(p)) return false;

  return true;
}

// ---------------- Recover BME280 sensor ----------------
bool SensorManager::recoverBME() {
  Serial.println("Recovering BME280...");

  Wire.end();
  delay(100);
  Wire.begin(21, 22, 50000);
  delay(100);

  bool ok = bme.begin(0x76);
  if (ok) {
    delay(100);
    Serial.println("BME280 recovered! Applying settings...");
    bme.setSampling(Adafruit_BME280::MODE_FORCED,
                    Adafruit_BME280::SAMPLING_X2, // Temp
                    Adafruit_BME280::SAMPLING_X16, // Pressure
                    Adafruit_BME280::SAMPLING_X1, // Humidity
                    Adafruit_BME280::FILTER_OFF);
    delay(100);
  } else {
    Serial.println("BME280 recovery failed.");
  }

  return ok;
}

// ---------------- Basic validation of readings ----------------
bool SensorManager::validateReading(float t, float h, float p) {
  if (isnan(t) || isnan(h) || isnan(p)) return false;
  if (t < -10 || t > 40) return false;
  if (h < 0 || h > 100) return false;
  if (p < 850 || p > 1100) return false;
  return true;
}

// ---------------- Advanced humidity validation ----------------
bool SensorManager::validateHumidityAdvanced(float h) {
  if (isnan(lastValidH)) {
    lastValidH = h;
    return true;
  }

  // Jump detection (20% or more change)
  if (fabs(h - lastValidH) > 20.0) {
    Serial.printf("Humidity jump detected! Prev: %.2f%%, New: %.2f%%\n", lastValidH, h);
    return false;
  }

  lastValidH = h;
  return true;
}

// ---------------- Advanced pressure validation ----------------
bool SensorManager::validatePressureAdvanced(float p) {
  if (isnan(prevPressure)) {
    prevPressure = p;
    updatePressureHistory(p);
    return true;
  }

  if (isPressureJump(prevPressure, p)) {
    Serial.println("Pressure jump detected!");
    return false;
  }

  float avgP = getPressureAverage();
  if (!isnan(avgP) && isPressureDeviationTooLarge(avgP, p)) {
    Serial.println("Pressure deviation from moving average!");
    return false;
  }

  prevPressure = p;
  updatePressureHistory(p);
  return true;
}

// ---------------- Pressure history management ----------------
void SensorManager::updatePressureHistory(float p) {
  pHistory[pHistoryIndex] = p;
  pHistoryIndex = (pHistoryIndex + 1) % 5;
  if (pHistoryIndex == 0) pHistoryFilled = true;
}

// ---------------- Get moving average of pressure ----------------
float SensorManager::getPressureAverage() {
  int count = pHistoryFilled ? 5 : pHistoryIndex;
  if (count == 0) return NAN;

  float sum = 0;
  for (int i = 0; i < count; i++) sum += pHistory[i];
  return sum / count;
}

// ---------------- Detect sudden pressure jumps ----------------
bool SensorManager::isPressureJump(float prevP, float newP) {
  return fabs(newP - prevP) > 1.5;
}

// ---------------- Detect excessive deviation from moving average ----------------
bool SensorManager::isPressureDeviationTooLarge(float avgP, float newP) {
  return fabs(newP - avgP) > 1.5;
}

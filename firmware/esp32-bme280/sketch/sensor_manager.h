#pragma once

#include <Arduino.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

class SensorManager {
public:
  // Initialize the BME280 sensor
  static bool init();

  // Read sensor measurements (temperature [°C], humidity [%], pressure [hPa])
  static bool readMeasurement(float &temperature, float &humidity, float &pressure);

private:
  // Internal functions to read and validate sensor data
  static bool readAndValidate(float &t, float &h, float &p);
  static bool readSafeBME(float &t, float &h, float &p);
  static bool recoverBME();
  static bool validateReading(float t, float h, float p);
  static bool validateHumidityAdvanced(float h);
  static bool validatePressureAdvanced(float p);

  // Smoothing and history management for pressure
  static void updatePressureHistory(float p);
  static float getPressureAverage();
  static bool isPressureJump(float prevP, float newP);
  static bool isPressureDeviationTooLarge(float avgP, float newP);

  // Internal variables
  static Adafruit_BME280 bme;      // BME280 sensor instance
  static float pHistory[5];        // Circular buffer for pressure history
  static int pHistoryIndex;        // Current index in pressure history
  static bool pHistoryFilled;      // Indicates if history buffer is fully filled
  static float prevPressure;       // Previous pressure reading for jump detection
  static float lastValidH;         // Last valid humidity reading
};

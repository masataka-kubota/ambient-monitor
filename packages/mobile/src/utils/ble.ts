/**
 * Decodes a Base64-encoded BLE measurement payload into a readable object.
 *
 * Binary layout (little-endian):
 * - offset 0: temperature (int16, scaled by 100)
 * - offset 2: humidity (int16, scaled by 100)
 * - offset 4: pressure (int32, Pa, scaled by 100 -> hPa)
 * - offset 8: timestamp (uint32, Unix epoch seconds)
 *
 * @param base64Value - Base64 string containing the encoded sensor payload.
 * @returns Parsed measurement values with human-readable units.
 * @example
 * const data = decodeMeasurement('...');
 * // => { temperature: 21.5, humidity: 45.67, pressure: 1013.25, timestamp: 1712345678 }

 */
export const decodeMeasurement = (base64Value: string) => {
  const binary = atob(base64Value);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const view = new DataView(bytes.buffer);

  return {
    temperature: view.getInt16(0, true) / 100,
    humidity: view.getInt16(2, true) / 100,
    pressure: view.getInt32(4, true) / 100, // Pa → hPa
    timestamp: view.getUint32(8, true),
  };
};

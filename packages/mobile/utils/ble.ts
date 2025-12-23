// Measurement binary → JSON
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

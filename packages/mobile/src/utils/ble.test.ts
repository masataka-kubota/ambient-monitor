import { decodeMeasurement } from './ble';

/**
 * Encodes measurement values into a Base64-encoded BLE payload.
 */
const encodeMeasurement = ({
  temperature,
  humidity,
  pressure,
  timestamp,
}: {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number;
}): string => {
  const view = new DataView(new ArrayBuffer(12));

  view.setInt16(0, Math.round(temperature * 100), true);
  view.setInt16(2, Math.round(humidity * 100), true);
  view.setInt32(4, Math.round(pressure * 100), true);
  view.setUint32(8, timestamp, true);

  const bytes = new Uint8Array(view.buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

describe('decodeMeasurement', () => {
  it('decodes a typical BLE sensor payload into measurement values', () => {
    const measurement = {
      temperature: 21.5,
      humidity: 45.67,
      pressure: 1013.25,
      timestamp: 1712345678,
    };

    const payload = encodeMeasurement(measurement);

    expect(decodeMeasurement(payload)).toEqual(measurement);
  });

  it('decodes negative and boundary values correctly', () => {
    const measurement = {
      temperature: -3.5,
      humidity: 0,
      pressure: 1000,
      timestamp: 0,
    };

    const payload = encodeMeasurement(measurement);

    expect(decodeMeasurement(payload)).toEqual(measurement);
  });
});

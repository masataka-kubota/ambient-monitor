import { act, renderHook } from '@testing-library/react-native';
import type { Peripheral } from 'react-native-ble-manager';

import { connectedDeviceAtom } from '@/atoms';
import { BLE_SERVICE_UUID, WIFI_CONFIG_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import { createTestWrapper } from '@/test/helpers';

import useBleWifiActions, {
  buildWifiConfigPayload,
  WIFI_CONFIG_PAYLOAD_LEN,
  WIFI_PASSWORD_MAX_LEN,
  WIFI_SSID_MAX_LEN,
} from './useBleWifiActions';
import useBleWifiStatus from './useBleWifiStatus';

jest.mock('@/lib', () => ({
  bleManager: {
    write: jest.fn(),
  },
}));

jest.mock('./useBleWifiStatus', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFetchWifiStatus = jest.fn();
const mockWrite = bleManager.write as jest.Mock;
const connectedDevice = { id: 'device-1' } as Peripheral;

const renderUseBleWifiActions = (device: Peripheral | null) =>
  renderHook(() => useBleWifiActions(), {
    wrapper: createTestWrapper({ atoms: [[connectedDeviceAtom, device]] }),
  });

/**
 * Helper function to expect a UTF-8 encoded field to be padded with zeros to
 * the specified length.
 */
const expectPaddedUtf8Field = (field: Uint8Array, value: string, length: number) => {
  const encoded = Buffer.from(value, 'utf8');

  expect(field).toHaveLength(length);
  expect(Buffer.from(field.subarray(0, encoded.length)).equals(encoded)).toBe(true);
  expect([...field.subarray(encoded.length)]).toEqual(Array(length - encoded.length).fill(0));
};

describe('buildWifiConfigPayload', () => {
  it('stores the SSID in the first 32 bytes and the password in the following 64 bytes', () => {
    const payload = buildWifiConfigPayload({ ssid: 'Home-WiFi', password: 'secret' });

    expect(payload).toHaveLength(WIFI_CONFIG_PAYLOAD_LEN);
    expectPaddedUtf8Field(payload.subarray(0, WIFI_SSID_MAX_LEN), 'Home-WiFi', WIFI_SSID_MAX_LEN);
    expectPaddedUtf8Field(payload.subarray(WIFI_SSID_MAX_LEN), 'secret', WIFI_PASSWORD_MAX_LEN);
  });

  it('writes an all-zero payload when SSID and password are empty', () => {
    const payload = buildWifiConfigPayload({ ssid: '', password: '' });

    expect(payload).toHaveLength(WIFI_CONFIG_PAYLOAD_LEN);
    expect([...payload]).toEqual(Array(WIFI_CONFIG_PAYLOAD_LEN).fill(0));
  });

  it('encodes SSID and password as UTF-8', () => {
    const payload = buildWifiConfigPayload({ ssid: 'ホーム', password: 'パスワード' });

    expect(payload).toHaveLength(WIFI_CONFIG_PAYLOAD_LEN);
    expectPaddedUtf8Field(payload.subarray(0, WIFI_SSID_MAX_LEN), 'ホーム', WIFI_SSID_MAX_LEN);
    expectPaddedUtf8Field(payload.subarray(WIFI_SSID_MAX_LEN), 'パスワード', WIFI_PASSWORD_MAX_LEN);
  });

  it('truncates fields that exceed the fixed buffer sizes', () => {
    const payload = buildWifiConfigPayload({
      ssid: 'a'.repeat(WIFI_SSID_MAX_LEN + 8),
      password: 'b'.repeat(WIFI_PASSWORD_MAX_LEN + 6),
    });

    expect([...payload.subarray(0, WIFI_SSID_MAX_LEN)]).toEqual(
      Array(WIFI_SSID_MAX_LEN).fill(0x61),
    );
    expect([...payload.subarray(WIFI_SSID_MAX_LEN)]).toEqual(
      Array(WIFI_PASSWORD_MAX_LEN).fill(0x62),
    );
  });
});

describe('useBleWifiActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBleWifiStatus as jest.Mock).mockReturnValue({
      fetchWifiStatus: mockFetchWifiStatus,
    });
  });

  it('returns null and skips the write when no device is connected', async () => {
    const { result } = await renderUseBleWifiActions(null);

    const actionResult = await act(() => result.current.initializeWifiConfig());

    expect(actionResult).toBeNull();
    expect(mockWrite).not.toHaveBeenCalled();
    expect(mockFetchWifiStatus).not.toHaveBeenCalled();
  });

  it('initializes Wi‑Fi config by writing an empty SSID/password payload and fetching the updated status', async () => {
    mockFetchWifiStatus.mockResolvedValue({ status: 'not_configured', ssid: '' });

    const { result } = await renderUseBleWifiActions(connectedDevice);

    const actionResult = await act(() => result.current.initializeWifiConfig());

    expect(actionResult).toEqual({ status: 'not_configured', ssid: '' });
    expect(mockWrite).toHaveBeenCalledWith(
      'device-1',
      BLE_SERVICE_UUID,
      WIFI_CONFIG_CHAR_UUID,
      Array.from(buildWifiConfigPayload({ ssid: '', password: '' })),
      WIFI_CONFIG_PAYLOAD_LEN,
    );
    expect(mockFetchWifiStatus).toHaveBeenCalledTimes(1);
  });

  it('updates Wi‑Fi config with the provided SSID and password and returns the refreshed status', async () => {
    mockFetchWifiStatus.mockResolvedValue({ status: 'connected', ssid: 'Home-WiFi' });

    const { result } = await renderUseBleWifiActions(connectedDevice);

    const actionResult = await act(() =>
      result.current.updateWifiConfig({
        ssid: 'Home-WiFi',
        password: 'strong-pass',
      }),
    );

    expect(actionResult).toEqual({ status: 'connected', ssid: 'Home-WiFi' });
    expect(mockWrite).toHaveBeenCalledWith(
      'device-1',
      BLE_SERVICE_UUID,
      WIFI_CONFIG_CHAR_UUID,
      Array.from(buildWifiConfigPayload({ ssid: 'Home-WiFi', password: 'strong-pass' })),
      WIFI_CONFIG_PAYLOAD_LEN,
    );
    expect(mockFetchWifiStatus).toHaveBeenCalledTimes(1);
  });

  it('returns null when the BLE write fails during initialization', async () => {
    mockWrite.mockRejectedValue(new Error('write failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = await renderUseBleWifiActions(connectedDevice);

    const actionResult = await act(() => result.current.initializeWifiConfig());

    expect(actionResult).toBeNull();
    expect(mockFetchWifiStatus).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Failed to initialize Wi-Fi', expect.any(Error));
    consoleError.mockRestore();
  });

  it('returns null when the BLE write fails during config update', async () => {
    mockWrite.mockRejectedValue(new Error('update write failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = await renderUseBleWifiActions(connectedDevice);

    const actionResult = await act(() =>
      result.current.updateWifiConfig({
        ssid: 'Home-WiFi',
        password: 'strong-pass',
      }),
    );

    expect(actionResult).toBeNull();
    expect(mockFetchWifiStatus).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Failed to write WiFi config', expect.any(Error));
    consoleError.mockRestore();
  });
});

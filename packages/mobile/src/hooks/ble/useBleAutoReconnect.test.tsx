import { renderHook } from '@testing-library/react-native';

import { connectedDeviceIdAtom } from '@/atoms';
import { bleManager } from '@/lib';
import { createTestWrapper } from '@/test/helpers';

import useBleAutoReconnect from './useBleAutoReconnect';

jest.mock('@/lib', () => ({
  bleManager: {
    onDidUpdateState: jest.fn(),
    checkState: jest.fn(),
  },
}));

const mockOnDidUpdateState = bleManager.onDidUpdateState as jest.Mock;
const mockCheckState = bleManager.checkState as jest.Mock;

const renderUseBleAutoReconnect = async (deviceId: string | null) => {
  const autoConnectToDevice = jest.fn().mockResolvedValue(undefined);
  const view = await renderHook(() => useBleAutoReconnect(autoConnectToDevice), {
    wrapper: createTestWrapper({ atoms: [[connectedDeviceIdAtom, deviceId]] }),
  });

  return { ...view, autoConnectToDevice };
};

describe('useBleAutoReconnect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDidUpdateState.mockReturnValue({ remove: jest.fn() });
  });

  it('does nothing when there is no connected device id', async () => {
    const { autoConnectToDevice } = await renderUseBleAutoReconnect(null);

    expect(mockOnDidUpdateState).not.toHaveBeenCalled();
    expect(mockCheckState).not.toHaveBeenCalled();
    expect(autoConnectToDevice).not.toHaveBeenCalled();
  });

  it('subscribes to BLE state updates and reconnects when the state turns on', async () => {
    const { autoConnectToDevice } = await renderUseBleAutoReconnect('device-1');

    expect(mockOnDidUpdateState).toHaveBeenCalledTimes(1);
    expect(mockCheckState).toHaveBeenCalledTimes(1);

    const stateListener = mockOnDidUpdateState.mock.calls[0][0];
    await stateListener({ state: 'on' });

    expect(autoConnectToDevice).toHaveBeenCalledTimes(1);
    expect(autoConnectToDevice).toHaveBeenCalledWith('device-1');
  });

  it('unsubscribes from BLE state updates when unmounted', async () => {
    const remove = jest.fn();
    mockOnDidUpdateState.mockReturnValue({ remove });

    const { unmount } = await renderUseBleAutoReconnect('device-1');

    await unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('ignores state updates when the BLE state is not on', async () => {
    const { autoConnectToDevice } = await renderUseBleAutoReconnect('device-1');

    const stateListener = mockOnDidUpdateState.mock.calls[0][0];
    await stateListener({ state: 'off' });

    expect(autoConnectToDevice).not.toHaveBeenCalled();
  });
});

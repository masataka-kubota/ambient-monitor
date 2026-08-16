import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { triggerLightHaptics } from './haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  performAndroidHapticsAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  AndroidHaptics: {
    Keyboard_Press: 'keyboard_press',
  },
}));

describe('triggerLightHaptics', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      value: originalOs,
      configurable: true,
    });
  });

  it('does nothing on web', () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'web',
      configurable: true,
    });

    triggerLightHaptics();

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.performAndroidHapticsAsync).not.toHaveBeenCalled();
  });

  it('uses a light impact on iOS', () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      configurable: true,
    });

    triggerLightHaptics();

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(Haptics.performAndroidHapticsAsync).not.toHaveBeenCalled();
  });

  it('uses keyboard press haptics on Android', () => {
    Object.defineProperty(Platform, 'OS', {
      value: 'android',
      configurable: true,
    });

    triggerLightHaptics();

    expect(Haptics.performAndroidHapticsAsync).toHaveBeenCalledWith(
      Haptics.AndroidHaptics.Keyboard_Press,
    );
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});

import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/**
 * Creates the pulsing opacity animation used by skeleton loading placeholders.
 *
 * The hook keeps a shared value that fades between full visibility and a
 * reduced alpha, then repeats the timing loop so the skeleton remains animated.
 *
 * @returns Animated style props for the skeleton placeholder view.
 */
const useSkeletonAnimation = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.5, { duration: 700 }), Infinity, true);
  }, [opacity]);

  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { skeletonAnimatedStyle };
};

export default useSkeletonAnimation;

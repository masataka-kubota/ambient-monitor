import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const useSkeletonAnimation = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 700 }),
      Infinity,
      true,
    );
  }, [opacity]);

  const skeltonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { skeltonAnimatedStyle };
};

export default useSkeletonAnimation;

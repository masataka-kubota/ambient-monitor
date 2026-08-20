import { render } from '@testing-library/react-native';
import Animated, { getAnimatedStyle } from 'react-native-reanimated';

import useSkeletonAnimation from './useSkeletonAnimation';

const SkeletonAnimatedView = () => {
  const { skeletonAnimatedStyle } = useSkeletonAnimation();

  return <Animated.View testID="skeleton" style={skeletonAnimatedStyle} />;
};

describe('useSkeletonAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at full opacity', async () => {
    const { getByTestId } = await render(<SkeletonAnimatedView />);
    const view = getByTestId('skeleton');

    expect(view).toHaveAnimatedStyle({ opacity: 1 });
  });

  it('pulses opacity toward 0.5 over 700ms', async () => {
    const { getByTestId } = await render(<SkeletonAnimatedView />);
    const view = getByTestId('skeleton');

    jest.advanceTimersByTime(700);

    expect(view).toHaveAnimatedStyle({ opacity: 0.5 });
  });

  it('reaches the midpoint opacity halfway through the timing', async () => {
    const { getByTestId } = await render(<SkeletonAnimatedView />);
    const view = getByTestId('skeleton');

    jest.advanceTimersByTime(350);

    expect(view).toHaveAnimatedStyle({ opacity: 0.75 });
  });

  it('reverses back toward full opacity on the next cycle', async () => {
    const { getByTestId } = await render(<SkeletonAnimatedView />);
    const view = getByTestId('skeleton');

    jest.advanceTimersByTime(700);
    expect(view).toHaveAnimatedStyle({ opacity: 0.5 });

    jest.advanceTimersByTime(700);
    expect(view).toHaveAnimatedStyle({ opacity: 1 });
  });

  it('exposes the current opacity via getAnimatedStyle', async () => {
    const { getByTestId } = await render(<SkeletonAnimatedView />);
    const view = getByTestId('skeleton');

    jest.advanceTimersByTime(700);

    const style = getAnimatedStyle(view);
    expect(style.opacity).toBe(0.5);
  });
});

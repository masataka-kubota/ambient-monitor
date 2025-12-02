import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import ThemeText from "@/components/ui/ThemeText";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const startAngle = -135;
const endAngle = 135;

interface Gradient {
  start: string;
  end: string;
}

//  Returns the gradient color for the given value
const getGradientForValue = (
  value: number,
  gradients: Gradient[],
  thresholds: number[],
) => {
  if (gradients.length !== thresholds.length) {
    console.warn("gradientColors and thresholds count mismatch");
  }

  for (let i = 0; i < thresholds.length; i++) {
    if (value < thresholds[i]) return gradients[i];
  }

  return gradients[gradients.length - 1];
};

const describeArc = (
  r: number,
  center: number,
  startAngle: number,
  endAngle: number,
) => {
  const polarToCartesian = (angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`;
};

interface CShapeGaugeProps {
  value: number;
  unit?: string;
  decimalPlaces?: number;
  label: string;
  radius?: number;
  strokeWidth?: number;
  gradientColors: Gradient[];
  thresholds: number[];
}

const CShapeGauge = ({
  value,
  unit = "",
  decimalPlaces = 0,
  label,
  radius = 50,
  strokeWidth = 10,
  gradientColors,
  thresholds,
}: CShapeGaugeProps) => {
  const progress = useSharedValue(0);

  const sweepAngle = endAngle - startAngle;
  const totalLength = 2 * Math.PI * radius * (sweepAngle / 360);
  const center = radius + strokeWidth;
  const path = describeArc(radius, center, startAngle, endAngle);
  const gradient = getGradientForValue(value, gradientColors, thresholds);
  const valueFontSize = radius * 0.4;
  const unitFontSize = radius * 0.2;
  const labelFontSize = radius * 0.25;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLength * (1 - progress.value),
  }));

  return (
    <View style={styles.wrapper}>
      <Svg width={center * 2} height={center * 2}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={gradient.start} />
            <Stop offset="100%" stopColor={gradient.end} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={path}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={totalLength}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* value */}
      <View style={[styles.centered, { top: center - 15 }]}>
        <ThemeText
          style={[
            styles.value,
            { fontSize: valueFontSize, lineHeight: valueFontSize },
          ]}
        >
          {value.toFixed(decimalPlaces)}
        </ThemeText>
        {unit ? (
          <ThemeText
            style={[
              styles.unit,
              { fontSize: unitFontSize, lineHeight: unitFontSize },
            ]}
          >
            {unit}
          </ThemeText>
        ) : null}
      </View>

      {/* label */}
      <View style={[styles.centered, styles.labelContainer]}>
        <ThemeText
          style={[
            styles.label,
            { fontSize: labelFontSize, lineHeight: labelFontSize },
          ]}
        >
          {label}
        </ThemeText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    margin: 5,
  },
  centered: {
    position: "absolute",
    alignItems: "center",
  },
  value: {
    fontWeight: "bold",
    fontSize: 30,
    lineHeight: 30,
  },
  unit: {
    fontSize: 12,
  },
  labelContainer: {
    bottom: 0,
  },
  label: {
    fontWeight: "bold",
  },
});

export default memo(CShapeGauge);

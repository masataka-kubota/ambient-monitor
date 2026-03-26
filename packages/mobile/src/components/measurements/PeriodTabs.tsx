import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemeText } from '@/components/ui';
import { MEASUREMENT_RANGES } from '@/constants';
import { useAppTheme } from '@/hooks/common';
import { MeasurementRange } from '@/types';
import { triggerLightHaptics } from '@/utils';

interface PeriodTabsProps {
  selectedPeriod: MeasurementRange;
  onSelectPeriod: (p: MeasurementRange) => void;
}

const PeriodTabs = ({ selectedPeriod, onSelectPeriod }: PeriodTabsProps) => {
  const { t } = useTranslation();
  const { activeThemeColors } = useAppTheme();

  const handlePress = useCallback(
    (p: MeasurementRange) => {
      triggerLightHaptics();
      onSelectPeriod(p);
    },
    [onSelectPeriod],
  );

  return (
    <View style={style.container}>
      {MEASUREMENT_RANGES.map((p) => {
        const focused = selectedPeriod === p;
        return (
          <Pressable
            key={p}
            onPress={() => handlePress(p)}
            style={[
              style.tabButton,
              focused && {
                backgroundColor: activeThemeColors.mainColor,
              },
            ]}
          >
            <ThemeText
              style={{
                fontWeight: focused ? 'bold' : 'normal',
                color: focused
                  ? activeThemeColors.mainBackground
                  : activeThemeColors.mediumColor,
              }}
            >
              {t(`data.period.${p}`)}
            </ThemeText>
          </Pressable>
        );
      })}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default memo(PeriodTabs);

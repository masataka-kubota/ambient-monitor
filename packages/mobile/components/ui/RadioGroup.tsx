import { memo } from "react";

import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";

import ThemeText from "@/components/ui/ThemeText";
import { useResolvedTheme } from "@/hooks/common";

interface RadioGroupProps<T extends { id: number; name: string }> {
  data: T[];
  selectedId: number;
  onPress: (id: number) => void;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  itemColor?: TextStyle["color"];
}

const RadioGroup = <T extends { id: number; name: string }>({
  data,
  selectedId,
  onPress,
  buttonStyle,
  textStyle,
}: RadioGroupProps<T>) => {
  const { currentThemeColors } = useResolvedTheme();

  return (
    <>
      {data.map((item) => (
        <Pressable
          key={item.id}
          style={[
            styles.button,
            { borderBottomColor: currentThemeColors.lightColor },
            buttonStyle,
          ]}
          onPress={() => onPress(item.id)}
          disabled={item.id === selectedId}
        >
          <ThemeText style={textStyle} testID={`radio-group-option-${item.id}`}>
            {item.name}
          </ThemeText>
          <Ionicons
            name={
              item.id === selectedId
                ? "radio-button-on-sharp"
                : "radio-button-off-sharp"
            }
            size={16}
            color={
              item.id === selectedId
                ? currentThemeColors.mainColor
                : currentThemeColors.mediumColor
            }
          />
        </Pressable>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    padding: 15,
    marginVertical: 5,
  },
});

export default memo(RadioGroup);

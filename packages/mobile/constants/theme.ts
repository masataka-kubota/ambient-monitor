import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

import { AppThemeColors } from "@/types";

// common
const black = "rgba(62, 62, 62, 1)"; // #3e3e3e)
const white = "rgba(245, 245, 245, 1)"; // #f5f5f5
const gray = "rgba(154, 154, 154, 1)"; // #9a9a9a
const blue = "rgba(0, 113, 227, 1)"; // #0071e3
const red = "rgba(255, 59, 48, 1)"; // #e03440
const tint = "rgba(30, 198, 136, 1)"; // #1ec688ff

// default (light)
const inputBackgroundLight = "rgba(232, 232, 232, 1)"; // #e8e8e8
const navBackgroundLight = "rgba(251, 251, 251, 1)"; // #fbfbfb
const lightGrayLight = "rgba(187, 187, 187, 1)"; // #bbbbbb
const shadowLight = "rgba(0, 0, 0, 1)"; // #000000

// dark
const inputBackgroundDark = "rgba(74, 74, 74, 1)"; // #4a4a4a
const navBackgroundDark = "rgba(32, 32, 32, 1)"; // #202020
const lightGrayDark = "rgba(122, 122, 122, 1)"; // #7a7a7a
const shadowDark = "rgba(255, 255, 255, 1)"; // #ffffff

export const APP_THEME_SCHEME: Record<"defaultTheme" | "darkTheme", Theme> = {
  defaultTheme: {
    ...DefaultTheme,
    colors: {
      primary: blue,
      background: white,
      card: navBackgroundLight,
      text: black,
      border: black,
      notification: red,
    },
  },
  darkTheme: {
    ...DarkTheme,
    colors: {
      primary: blue,
      background: black,
      card: navBackgroundDark,
      text: white,
      border: white,
      notification: red,
    },
  },
};

export const APP_THEME_COLORS: AppThemeColors = {
  light: {
    mainColor: black,
    mediumColor: gray,
    lightColor: lightGrayLight,
    mainBackground: white,
    secondaryBackground: inputBackgroundLight,
    navBackground: navBackgroundLight,
    shadow: shadowLight,
    tint: tint,
  },
  dark: {
    mainColor: white,
    mediumColor: gray,
    lightColor: lightGrayDark,
    mainBackground: black,
    secondaryBackground: inputBackgroundDark,
    navBackground: navBackgroundDark,
    shadow: shadowDark,
    tint: tint,
  },
};

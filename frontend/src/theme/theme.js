import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode(
        "light.bg.primary",
        "linear-gradient(135deg, #0F0F23 0%, #1A1B3A 25%, #252659 50%, #1A1B3A 75%, #0F0F23 100%)"
      )(props),
      fontFamily: "Inter, system-ui, sans-serif",
      minHeight: "100vh",
    },
  }),
};

const colors = {
  dark: {
    bg: {
      primary: "#0F0F23",
      secondary: "#1A1B3A",
      tertiary: "#252659",
      cardGradient: "linear-gradient(135deg, #1A1B3A 0%, #252659 100%)",
      headerGradient: "linear-gradient(90deg, #1A1B3A 0%, #252659 100%)",
    },
    purple: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      primary: "#667eea",
      secondary: "#764ba2",
    },
    blue: {
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      primary: "#4facfe",
      secondary: "#00f2fe",
    },
    accent: {
      green: "#00d4aa",
      orange: "#ff6b6b",
      yellow: "#feca57",
    },
  },
  light: {
    bg: {
      primary: "#EDF2F7",
      secondary: "#FFFFFF",
      tertiary: "#E2E8F0",
      cardGradient: "linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)",
      headerGradient: "linear-gradient(90deg, #FFFFFF 0%, #F7FAFC 100%)",
    },
    purple: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      primary: "#5a67d8",
      secondary: "#6b46c1",
    },
    blue: {
      gradient: "linear-gradient(135deg, #3182ce 0%, #2b77cb 100%)",
      primary: "#3182ce",
      secondary: "#2c5aa0",
    },
    accent: {
      green: "#38a169",
      orange: "#ed8936",
      yellow: "#d69e2e",
    },
  },
};

const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        background: mode("light.bg.secondary", "dark.bg.cardGradient")(props),
        borderRadius: "xl",
        boxShadow: mode("lg", "xl")(props),
        backdropFilter: "blur(10px)",
      },
    }),
  },
  Button: {
    baseStyle: {
      borderRadius: "lg",
      fontWeight: "medium",
    },
    variants: {
      gradient: (props) => ({
        background: mode(
          "light.purple.gradient",
          "dark.purple.gradient"
        )(props),
        color: "white",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
      }),
    },
  },
};

const theme = extendTheme({
  colors,
  styles,
  components,
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;

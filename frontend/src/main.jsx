import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { mode } from "@chakra-ui/theme-tools";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from "./context/UserContext.jsx";

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "gray.50")(props),
      bg: mode("gray.100", "gray.900")(props),
      fontFamily: "Inter, system-ui, sans-serif",
    },
  }),
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    50: "#e3f2ff",
    100: "#b3daff",
    700: "#424242",
    800: "#1e1e1e",
    900: "#0d0d0d",
  },
};

const theme = extendTheme({ styles, config, colors });

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);

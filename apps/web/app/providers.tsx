"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { CssBaseline, PaletteMode, ThemeProvider, useMediaQuery } from "@mui/material";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { buildTheme } from "../lib/theme";
import store from "../store/store";

const ThemeBridge = ({ children }: PropsWithChildren) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<PaletteMode>(prefersDark ? "dark" : "light");

  useEffect(() => {
    setMode(prefersDark ? "dark" : "light");
  }, [prefersDark]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

const Providers = ({ children }: PropsWithChildren) => (
  <AppRouterCacheProvider options={{ enableCssLayer: true }}>
    <Provider store={store}>
      <ThemeBridge>{children}</ThemeBridge>
    </Provider>
  </AppRouterCacheProvider>
);

export default Providers;

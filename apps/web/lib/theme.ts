import { PaletteMode, createTheme } from "@mui/material";

const fontStack = [
  '"SF Pro Text"',
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  '"Noto Sans"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif"
].join(",");

export const buildTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#80cbc4" : "#00695c",
        contrastText: mode === "dark" ? "#0b1117" : "#ffffff"
      },
      secondary: {
        main: mode === "dark" ? "#ffb74d" : "#f57c00"
      },
      background: {
        default: mode === "dark" ? "#0f172a" : "#f8fafc",
        paper: mode === "dark" ? "#111827" : "#ffffff"
      }
    },
    typography: {
      fontFamily: fontStack
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === "dark" ? "#0f172a" : "#f8fafc"
          }
        }
      }
    }
  });

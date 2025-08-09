import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F0E0E",
      paper: "#1A1A1A",
    },
    primary: {
      main: "#CF1259",
      light: "#E3477E",
      dark: "#99003C",
      contrastText: "#F6F4F3",
    },
    secondary: {
      main: "#7D8491",
      light: "#A3AAB6",
      dark: "#585E68",
      contrastText: "#F6F4F3",
    },
    info: {
      main: "#1C7293",
      contrastText: "#F6F4F3",
    },
    text: {
      primary: "#F6F4F3",
      secondary: "#B0B0B0",
      disabled: "#7D7D7D",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },

  typography: {
    fontFamily: `"Bebas Neue", "Helvetica", "Arial", sans-serif`,
    h1: {
      fontWeight: 800,
      fontSize: "6rem",
      lineHeight: 1.1,
      color: "#F6F4F3",
    },
    h2: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
      color: "#F6F4F3",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.75rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#1C7293",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.8,
      fontFamily: `"Helvetica", sans-serif`,
      color: "#F6F4F3",
    },
    button: {
      fontWeight: 700,
      fontSize: "0.9rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#F6F4F3",
    },
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: "100%",
          scrollBehavior: "smooth",
          overflowX: "hidden",
        },
        body: {
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          backgroundColor: "#0F0E0E",
          color: "#F6F4F3",
          fontSmoothing: "antialiased",
        },
        "#root": {
          width: "100%",
          overflowX: "hidden",
        },
        "*": {
          boxSizing: "border-box",
        },
        a: {
          color: "#CF1259",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
            color: "#1C7293",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, rgba(207,18,89,0.04), rgba(28,114,147,0.03))",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 20px rgba(207, 18, 89, 0.15)",
          borderRadius: 20,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "scale(1.015)",
            boxShadow: "0 6px 24px rgba(207, 18, 89, 0.35)",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          textTransform: "none",
          padding: "0.55rem 1.5rem",
          fontWeight: 600,
          backgroundColor: "#CF1259",
          color: "#F6F4F3",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "#1C7293",
            color: "#F6F4F3",
            boxShadow: "0 4px 12px rgba(28, 114, 147, 0.3)",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(15, 14, 14, 0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          borderRadius: 16,
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          padding: "0.5rem 1rem",
          color: "#F6F4F3",
          transition: "background-color 0.3s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.06)",
          },
        },
        input: {
          padding: "0.75rem 0.25rem",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#2a2a2a",
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        select: {
          padding: "0.75rem 1rem",
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(28, 27, 26, 0.9)",
          backdropFilter: "blur(16px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        },
      },
    },
  },
});

export default theme;

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0e0b0d",
      paper: "#1a1418",
    },
    primary: {
      main: "#E43F6F",
      light: "#f06b90",
      dark: "#c02d5a",
      contrastText: "#FFEAEC",
    },
    secondary: {
      main: "#FFEAEC",
      light: "#fff5f6",
      dark: "#ffd0d6",
      contrastText: "#0e0b0d",
    },
    text: {
      primary: "#FFEAEC",
      secondary: "rgba(255,234,236,0.55)",
      disabled: "rgba(255,234,236,0.22)",
    },
    divider: "rgba(255,234,236,0.06)",
    action: {
      hover: "rgba(228,63,111,0.08)",
      selected: "rgba(228,63,111,0.14)",
    },
  },

  typography: {
    fontFamily: `"Syne", "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`,
    h1: {
      fontFamily: `"Syne", sans-serif`,
      fontWeight: 800,
      lineHeight: 0.92,
      letterSpacing: "-4px",
      color: "#FFEAEC",
    },
    h2: {
      fontFamily: `"Syne", sans-serif`,
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: "-2.5px",
      color: "#FFEAEC",
    },
    h3: {
      fontFamily: `"Syne", sans-serif`,
      fontWeight: 700,
      letterSpacing: "-1px",
      color: "#FFEAEC",
    },
    h5: {
      fontFamily: `"DM Sans", sans-serif`,
      fontWeight: 600,
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "3px",
      color: "rgba(255,234,236,0.38)",
    },
    body1: {
      fontFamily: `"DM Sans", sans-serif`,
      fontSize: "1rem",
      lineHeight: 1.75,
      fontWeight: 400,
      color: "rgba(255,234,236,0.68)",
    },
    body2: {
      fontFamily: `"DM Sans", sans-serif`,
      fontSize: "0.875rem",
      lineHeight: 1.65,
      color: "rgba(255,234,236,0.42)",
    },
    caption: {
      fontFamily: `"DM Sans", sans-serif`,
      fontSize: "0.6875rem",
      letterSpacing: "1.8px",
      textTransform: "uppercase",
      color: "rgba(255,234,236,0.32)",
    },
    button: {
      fontFamily: `"Syne", sans-serif`,
      fontWeight: 700,
      fontSize: "0.9rem",
      textTransform: "none",
      letterSpacing: "-0.2px",
    },
  },

  shape: {
    borderRadius: 24,
  },

  shadows: [
    "none",
    "0 2px 8px rgba(0,0,0,0.6)",
    "0 4px 16px rgba(0,0,0,0.65)",
    "0 8px 32px rgba(0,0,0,0.7)",
    "0 12px 40px rgba(0,0,0,0.72)",
    "0 16px 56px rgba(0,0,0,0.74)",
    "0 20px 64px rgba(0,0,0,0.76)",
    "0 24px 80px rgba(0,0,0,0.78)",
    "0 2px 8px rgba(0,0,0,0.6)",
    "0 4px 16px rgba(0,0,0,0.65)",
    "0 8px 32px rgba(0,0,0,0.7)",
    "0 12px 40px rgba(0,0,0,0.72)",
    "0 16px 56px rgba(0,0,0,0.74)",
    "0 20px 64px rgba(0,0,0,0.76)",
    "0 24px 80px rgba(0,0,0,0.78)",
    "0 28px 96px rgba(0,0,0,0.8)",
    "0 2px 8px rgba(0,0,0,0.6)",
    "0 4px 16px rgba(0,0,0,0.65)",
    "0 8px 32px rgba(0,0,0,0.7)",
    "0 12px 40px rgba(0,0,0,0.72)",
    "0 16px 56px rgba(0,0,0,0.74)",
    "0 20px 64px rgba(0,0,0,0.76)",
    "0 24px 80px rgba(0,0,0,0.78)",
    "0 28px 96px rgba(0,0,0,0.8)",
    "0 32px 112px rgba(0,0,0,0.85)",
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        html { scroll-behavior: smooth; overflow-x: hidden; }
        body {
          margin: 0; padding: 0;
          overflow-x: hidden;
          background-color: #0e0b0d;
          color: #FFEAEC;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * { box-sizing: border-box; }
        a { color: #E43F6F; text-decoration: none; }
        a:hover { color: #FFEAEC; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0e0b0d; }
        ::-webkit-scrollbar-thumb {
          background: rgba(228,63,111,0.4);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover { background: #E43F6F; }
      `,
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.03)",
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          boxShadow: [
            "0 1px 0 rgba(255,255,255,0.07) inset",
            "0 -1px 0 rgba(0,0,0,0.4) inset",
            "0 24px 64px rgba(0,0,0,0.7)",
            "6px 6px 16px rgba(0,0,0,0.5)",
            "-4px -4px 12px rgba(255,255,255,0.02)",
          ].join(", "),
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: [
              "0 1px 0 rgba(255,255,255,0.09) inset",
              "0 32px 80px rgba(0,0,0,0.75)",
              "0 8px 24px rgba(228,63,111,0.15)",
              "6px 6px 20px rgba(0,0,0,0.55)",
            ].join(", "),
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          textTransform: "none",
          padding: "0.75rem 2rem",
          fontWeight: 700,
          fontSize: "0.9375rem",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          "&:hover": { boxShadow: "none", transform: "scale(1.04) translateY(-2px)" },
          "&:active": { transform: "scale(0.97)" },
        },
        contained: {
          backgroundColor: "#E43F6F",
          color: "#FFEAEC",
          boxShadow: [
            "0 1px 0 rgba(255,255,255,0.25) inset",
            "0 -2px 0 rgba(0,0,0,0.3) inset",
            "0 8px 32px rgba(228,63,111,0.45)",
            "0 2px 8px rgba(0,0,0,0.4)",
          ].join(", "),
          "&:hover": {
            backgroundColor: "#c02d5a",
            boxShadow: [
              "0 1px 0 rgba(255,255,255,0.25) inset",
              "0 -2px 0 rgba(0,0,0,0.3) inset",
              "0 14px 48px rgba(228,63,111,0.6)",
            ].join(", "),
          },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.1)",
          color: "#FFEAEC",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(12px)",
          boxShadow: [
            "4px 4px 10px rgba(0,0,0,0.4)",
            "-2px -2px 8px rgba(255,255,255,0.02)",
          ].join(", "),
          "&:hover": {
            borderColor: "rgba(228,63,111,0.5)",
            background: "rgba(228,63,111,0.07)",
            color: "#FFEAEC",
          },
        },
        text: {
          color: "rgba(255,234,236,0.42)",
          "&:hover": { color: "#FFEAEC", background: "rgba(255,234,236,0.04)" },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(14,11,13,0.7)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 1px 40px rgba(0,0,0,0.7)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1418",
          backgroundImage: "none",
          borderRadius: 24,
        },
        elevation1: {
          boxShadow: [
            "0 4px 28px rgba(0,0,0,0.6)",
            "4px 4px 12px rgba(0,0,0,0.45)",
            "-2px -2px 8px rgba(255,255,255,0.02)",
          ].join(", "),
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.3px",
          fontFamily: `"DM Sans", sans-serif`,
          transition: "all 0.2s ease",
        },
        colorPrimary: {
          backgroundColor: "rgba(228,63,111,0.1)",
          color: "#E43F6F",
          border: "1px solid rgba(228,63,111,0.22)",
          backdropFilter: "blur(8px)",
          "&:hover": { backgroundColor: "rgba(228,63,111,0.2)" },
        },
        colorDefault: {
          backgroundColor: "rgba(255,255,255,0.04)",
          color: "rgba(255,234,236,0.68)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(8px)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "#FFEAEC" },
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.03)",
          color: "#FFEAEC",
          backdropFilter: "blur(16px)",
          transition: "all 0.25s ease",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
          "&.Mui-focused": {
            backgroundColor: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 0 2px rgba(228,63,111,0.3)",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: "rgba(255,255,255,0.08)" },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.16)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E43F6F",
            borderWidth: "1.5px",
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(14,11,13,0.88)",
          backdropFilter: "blur(56px)",
          WebkitBackdropFilter: "blur(56px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 32,
          boxShadow: [
            "0 40px 100px rgba(0,0,0,0.8)",
            "0 0 0 1px rgba(228,63,111,0.08)",
            "8px 8px 24px rgba(0,0,0,0.5)",
            "-4px -4px 16px rgba(255,255,255,0.01)",
          ].join(", "),
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(255,234,236,0.06)" },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "rgba(14,11,13,0.92)",
          color: "#FFEAEC",
          fontSize: "0.8125rem",
          fontFamily: `"DM Sans", sans-serif`,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          padding: "8px 14px",
          backdropFilter: "blur(16px)",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          "&:hover": { transform: "scale(1.1)" },
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "clamp(20px, 5vw, 80px)",
          paddingRight: "clamp(20px, 5vw, 80px)",
        },
      },
    },
  },
});

export default theme;

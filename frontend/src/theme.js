import { createTheme } from "@mui/material/styles";

const colors = {
  black: "#0b0b0a",
  ink: "#141310",
  panel: "#191815",
  bone: "#f5efe5",
  muted: "rgba(245,239,229,0.66)",
  quiet: "rgba(245,239,229,0.42)",
  red: "#d72f4a",
  redDark: "#a91f37",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: colors.black,
      paper: colors.panel,
    },
    primary: {
      main: colors.red,
      light: "#ee5c71",
      dark: colors.redDark,
      contrastText: colors.bone,
    },
    secondary: {
      main: colors.bone,
      light: "#fffaf1",
      dark: "#d8ccbd",
      contrastText: colors.black,
    },
    text: {
      primary: colors.bone,
      secondary: colors.muted,
      disabled: colors.quiet,
    },
    divider: "rgba(245,239,229,0.12)",
    action: {
      hover: "rgba(215,47,74,0.1)",
      selected: "rgba(215,47,74,0.16)",
      disabled: "rgba(245,239,229,0.28)",
      disabledBackground: "rgba(245,239,229,0.08)",
    },
  },

  custom: {
    colors,
    fonts: {
      display: `"Syne", "DM Sans", sans-serif`,
      body: `"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`,
      mono: `"JetBrains Mono", ui-monospace, monospace`,
    },
  },

  typography: {
    fontFamily: `"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`,
    h1: {
      fontFamily: `"Syne", "DM Sans", sans-serif`,
      fontWeight: 800,
      lineHeight: 0.88,
      letterSpacing: 0,
      color: colors.bone,
    },
    h2: {
      fontFamily: `"Syne", "DM Sans", sans-serif`,
      fontWeight: 800,
      lineHeight: 0.96,
      letterSpacing: 0,
      color: colors.bone,
    },
    h3: {
      fontFamily: `"Syne", "DM Sans", sans-serif`,
      fontWeight: 800,
      lineHeight: 1.04,
      letterSpacing: 0,
      color: colors.bone,
    },
    h4: {
      fontFamily: `"Syne", "DM Sans", sans-serif`,
      fontWeight: 800,
      letterSpacing: 0,
      color: colors.bone,
    },
    h5: {
      fontFamily: `"JetBrains Mono", ui-monospace, monospace`,
      fontWeight: 600,
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      color: colors.quiet,
    },
    body1: {
      fontFamily: `"DM Sans", sans-serif`,
      fontSize: "1rem",
      lineHeight: 1.65,
      color: colors.muted,
    },
    body2: {
      fontFamily: `"DM Sans", sans-serif`,
      fontSize: "0.875rem",
      lineHeight: 1.55,
      color: colors.quiet,
    },
    caption: {
      fontFamily: `"JetBrains Mono", ui-monospace, monospace`,
      fontSize: "0.6875rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: colors.quiet,
    },
    button: {
      fontFamily: `"DM Sans", sans-serif`,
      fontWeight: 800,
      fontSize: "0.9rem",
      textTransform: "none",
      letterSpacing: 0,
    },
  },

  shape: {
    borderRadius: 8,
  },

  shadows: [
    "none",
    "0 2px 6px rgba(0,0,0,0.22)",
    "0 4px 12px rgba(0,0,0,0.24)",
    "0 8px 20px rgba(0,0,0,0.26)",
    "0 12px 28px rgba(0,0,0,0.28)",
    "0 16px 36px rgba(0,0,0,0.3)",
    "0 18px 44px rgba(0,0,0,0.32)",
    "0 20px 52px rgba(0,0,0,0.34)",
    "0 22px 60px rgba(0,0,0,0.36)",
    "0 24px 68px rgba(0,0,0,0.38)",
    "0 26px 76px rgba(0,0,0,0.4)",
    "0 28px 84px rgba(0,0,0,0.42)",
    "0 30px 92px rgba(0,0,0,0.44)",
    "0 32px 100px rgba(0,0,0,0.46)",
    "0 34px 108px rgba(0,0,0,0.48)",
    "0 36px 116px rgba(0,0,0,0.5)",
    "0 38px 124px rgba(0,0,0,0.52)",
    "0 40px 132px rgba(0,0,0,0.54)",
    "0 42px 140px rgba(0,0,0,0.56)",
    "0 44px 148px rgba(0,0,0,0.58)",
    "0 46px 156px rgba(0,0,0,0.6)",
    "0 48px 164px rgba(0,0,0,0.62)",
    "0 50px 172px rgba(0,0,0,0.64)",
    "0 52px 180px rgba(0,0,0,0.66)",
    "0 54px 188px rgba(0,0,0,0.68)",
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        html { scroll-behavior: smooth; overflow-x: hidden; }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: ${colors.black};
          color: ${colors.bone};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * { box-sizing: border-box; }
        a { color: ${colors.red}; text-decoration: none; }
        a:hover { color: ${colors.bone}; }
        ::selection { background: ${colors.red}; color: ${colors.bone}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${colors.black}; }
        ::-webkit-scrollbar-thumb {
          background: rgba(245,239,229,0.2);
          border-radius: 999px;
          border: 2px solid ${colors.black};
        }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.red}; }
      `,
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.panel,
          backgroundImage: "none",
          border: "1px solid rgba(245,239,229,0.12)",
          borderRadius: 8,
          boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "0.72rem 1.25rem",
          boxShadow: "none",
          minHeight: 42,
          transition: "background-color 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease",
          "&:hover": { boxShadow: "none", transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
          "&:focus-visible": {
            outline: `2px solid ${colors.red}`,
            outlineOffset: "2px",
          },
        },
        contained: {
          backgroundColor: colors.red,
          color: colors.bone,
          border: `1px solid ${colors.red}`,
          "&:hover": { backgroundColor: colors.redDark, borderColor: colors.redDark },
        },
        outlined: {
          borderColor: "rgba(245,239,229,0.22)",
          color: colors.bone,
          background: "transparent",
          "&:hover": {
            borderColor: colors.red,
            background: "rgba(215,47,74,0.08)",
            color: colors.bone,
          },
        },
        text: {
          color: colors.muted,
          paddingLeft: "0.25rem",
          paddingRight: "0.25rem",
          "&:hover": {
            color: colors.red,
            background: "transparent",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(11,11,10,0.88)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(245,239,229,0.1)",
          boxShadow: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.panel,
          backgroundImage: "none",
          borderRadius: 8,
          color: colors.bone,
        },
        elevation1: {
          boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
          border: "1px solid rgba(245,239,229,0.12)",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 800,
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: `"JetBrains Mono", ui-monospace, monospace`,
        },
        colorPrimary: {
          backgroundColor: "rgba(215,47,74,0.12)",
          color: colors.red,
          border: "1px solid rgba(215,47,74,0.3)",
        },
        colorDefault: {
          backgroundColor: "rgba(245,239,229,0.08)",
          color: colors.muted,
          border: "1px solid rgba(245,239,229,0.12)",
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: colors.bone,
          transition: "background-color 160ms ease, box-shadow 160ms ease",
          "&.Mui-focused": {
            boxShadow: `0 0 0 2px rgba(215,47,74,0.32)`,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: "rgba(245,239,229,0.14)" },
        root: {
          borderRadius: 8,
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,239,229,0.28)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.red,
            borderWidth: "1px",
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: colors.panel,
          border: "1px solid rgba(245,239,229,0.14)",
          borderRadius: 8,
          boxShadow: "0 32px 90px rgba(0,0,0,0.54)",
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(245,239,229,0.12)" },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.bone,
          color: colors.black,
          fontSize: "0.78rem",
          fontFamily: `"DM Sans", sans-serif`,
          borderRadius: 6,
          padding: "7px 10px",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "background-color 160ms ease, color 160ms ease, transform 160ms ease",
          "&:hover": { transform: "translateY(-1px)" },
          "&:focus-visible": {
            outline: `2px solid ${colors.red}`,
            outlineOffset: "2px",
          },
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "clamp(18px, 4vw, 64px)",
          paddingRight: "clamp(18px, 4vw, 64px)",
        },
      },
    },
  },
});

export default theme;

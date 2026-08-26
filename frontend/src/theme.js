import { createTheme, alpha } from "@mui/material/styles";

const colors = {
  pink: "#E15A97",
  brown: "#362417",
  cream: "#F1DABF",
  blue: "#072AC8",
  ink: "#362417",
  inkSoft: "#5E4533",
  clay: "#F1DABF",
  clayDeep: "#D7B493",
  coral: "#E15A97",
  coralDark: "#A83268",
  apricot: "#F6CFA7",
  linen: "#F7E7D5",
  sage: "#5E4533",
  mint: "#E8D0B7",
  sky: "#072AC8",
  lavender: "#E7C3D8",
  muted: "rgba(54,36,23,0.68)",
  quiet: "rgba(54,36,23,0.46)",
};

const clay = {
  surface: "linear-gradient(145deg, #F8E7D4 0%, #F1DABF 52%, #DDB996 100%)",
  surfaceSoft: "linear-gradient(145deg, #FFF1DF 0%, #F1DABF 58%, #E3C29F 100%)",
  surfaceCool: "linear-gradient(145deg, #F6E2CC 0%, #E8D0B7 52%, #C9A07C 100%)",
  raised:
    "12px 14px 28px rgba(54,36,23,0.2), -10px -10px 24px rgba(255,246,235,0.68)",
  raisedSmall:
    "7px 8px 16px rgba(54,36,23,0.18), -6px -6px 14px rgba(255,246,235,0.62)",
  pressed:
    "inset 6px 7px 13px rgba(54,36,23,0.2), inset -6px -6px 14px rgba(255,246,235,0.58)",
  floating:
    "0 24px 60px rgba(54,36,23,0.22), 0 7px 18px rgba(54,36,23,0.14)",
  border: "1px solid rgba(255,246,235,0.52)",
  hairline: "1px solid rgba(54,36,23,0.12)",
};

const fontDisplay = `"Syne", "DM Sans", sans-serif`;
const fontBody = `"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `"JetBrains Mono", ui-monospace, monospace`;

const shadows = Array.from({ length: 25 }, (_, index) => {
  if (index === 0) return "none";
  const lift = Math.min(index + 5, 28);
  const blur = Math.min(index * 4 + 12, 72);
  const opacity = Math.min(0.11 + index * 0.006, 0.26);
  const lightOffset = Math.ceil(index / 3);

  return `0 ${lift}px ${blur}px rgba(54,36,23,${opacity}), -${lightOffset}px -${lightOffset}px ${
    10 + lightOffset
  }px rgba(255,246,235,0.46)`;
});

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: colors.linen,
      paper: colors.cream,
    },
    primary: {
      main: colors.coral,
      light: "#F08ABD",
      dark: colors.coralDark,
      contrastText: colors.cream,
    },
    secondary: {
      main: colors.sage,
      light: colors.mint,
      dark: colors.brown,
      contrastText: colors.cream,
    },
    accent: {
      main: colors.apricot,
      contrastText: colors.ink,
    },
    text: {
      primary: colors.ink,
      secondary: colors.muted,
      disabled: colors.quiet,
    },
    divider: "rgba(54,36,23,0.12)",
    action: {
      active: colors.brown,
      hover: "rgba(54,36,23,0.08)",
      selected: "rgba(54,36,23,0.14)",
      disabled: "rgba(54,36,23,0.28)",
      disabledBackground: "rgba(54,36,23,0.08)",
      focus: "rgba(225,90,151,0.24)",
    },
  },

  custom: {
    colors,
    clay,
    fonts: {
      display: fontDisplay,
      body: fontBody,
      mono: fontMono,
    },
  },

  typography: {
    fontFamily: fontBody,
    h1: {
      fontFamily: fontDisplay,
      fontWeight: 800,
      lineHeight: 0.92,
      letterSpacing: 0,
      color: colors.ink,
    },
    h2: {
      fontFamily: fontDisplay,
      fontWeight: 800,
      lineHeight: 0.98,
      letterSpacing: 0,
      color: colors.ink,
    },
    h3: {
      fontFamily: fontDisplay,
      fontWeight: 750,
      lineHeight: 1.06,
      letterSpacing: 0,
      color: colors.ink,
    },
    h4: {
      fontFamily: fontDisplay,
      fontWeight: 750,
      letterSpacing: 0,
      color: colors.ink,
    },
    h5: {
      fontFamily: fontMono,
      fontWeight: 700,
      fontSize: "0.76rem",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: colors.coralDark,
    },
    h6: {
      fontFamily: fontBody,
      fontWeight: 800,
      letterSpacing: 0,
      color: colors.ink,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.68,
      color: colors.muted,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.55,
      color: colors.quiet,
    },
    caption: {
      fontFamily: fontMono,
      fontSize: "0.7rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: colors.quiet,
    },
    button: {
      fontFamily: fontBody,
      fontWeight: 800,
      fontSize: "0.9rem",
      textTransform: "none",
      letterSpacing: 0,
    },
  },

  shape: {
    borderRadius: 18,
  },

  shadows,

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --clay-bg: ${colors.linen};
          --clay-surface: ${colors.cream};
          --clay-surface-soft: #FFF1DF;
          --clay-ink: ${colors.ink};
          --clay-muted: ${colors.muted};
          --clay-coral: ${colors.pink};
          --clay-sage: ${colors.brown};
          --clay-apricot: ${colors.apricot};
          --clay-raised: ${clay.raised};
          --clay-raised-small: ${clay.raisedSmall};
          --clay-pressed: ${clay.pressed};
          --clay-border: ${clay.border};
        }

        html { scroll-behavior: smooth; overflow-x: hidden; }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 12% 8%, rgba(241,218,191,0.95) 0 15rem, transparent 26rem),
            radial-gradient(circle at 88% 16%, rgba(54,36,23,0.12) 0 13rem, transparent 24rem),
            radial-gradient(circle at 50% 90%, rgba(225,90,151,0.18) 0 16rem, transparent 30rem),
            linear-gradient(135deg, #F7E7D5 0%, #F1DABF 48%, #E8D0B7 100%);
          background-attachment: fixed;
          color: ${colors.ink};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * { box-sizing: border-box; }
        a { color: ${colors.coralDark}; text-decoration: none; }
        a:hover { color: ${colors.ink}; }
        ::selection { background: ${colors.coral}; color: ${colors.cream}; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }

        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${colors.linen}; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${colors.pink}, ${colors.brown});
          border-radius: 999px;
          border: 3px solid ${colors.linen};
        }
        ::-webkit-scrollbar-thumb:hover { background: ${colors.coralDark}; }
      `,
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(241,218,191,0.78)",
          color: colors.ink,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderBottom: "1px solid rgba(255,246,235,0.52)",
          boxShadow: "0 14px 34px rgba(54,36,23,0.12)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.cream,
          backgroundImage: clay.surfaceSoft,
          border: clay.border,
          borderRadius: 18,
          color: colors.ink,
          boxShadow: clay.raised,
        },
        elevation1: {
          boxShadow: clay.raised,
        },
        elevation8: {
          boxShadow: clay.floating,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: clay.surfaceSoft,
          border: clay.border,
          borderRadius: 22,
          boxShadow: clay.raised,
          color: colors.ink,
          overflow: "hidden",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          minHeight: 44,
          padding: "0.74rem 1.28rem",
          textTransform: "none",
          boxShadow: clay.raisedSmall,
          transition:
            "background-color 170ms ease, color 170ms ease, border-color 170ms ease, box-shadow 170ms ease, transform 170ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: clay.floating,
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: clay.pressed,
          },
          "&:focus-visible": {
            outline: `3px solid ${alpha(colors.coral, 0.32)}`,
            outlineOffset: "3px",
          },
        },
        contained: {
          background: `linear-gradient(145deg, ${colors.pink} 0%, ${colors.brown} 100%)`,
          color: colors.cream,
          border: "1px solid rgba(255,255,255,0.36)",
          "&:hover": {
            background: `linear-gradient(145deg, ${colors.coralDark} 0%, ${colors.inkSoft} 100%)`,
          },
        },
        outlined: {
          color: colors.ink,
          borderColor: "rgba(54,36,23,0.13)",
          background: "rgba(241,218,191,0.38)",
          "&:hover": {
            color: colors.ink,
            borderColor: alpha(colors.coralDark, 0.32),
            background: "rgba(241,218,191,0.56)",
          },
        },
        text: {
          color: colors.coralDark,
          boxShadow: "none",
          "&:hover": {
            background: "rgba(241,218,191,0.35)",
            boxShadow: "none",
          },
          "&:active": {
            boxShadow: "none",
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: colors.inkSoft,
          background: "rgba(241,218,191,0.44)",
          border: clay.border,
          boxShadow: clay.raisedSmall,
          transition: "color 170ms ease, box-shadow 170ms ease, transform 170ms ease",
          "&:hover": {
            color: colors.coralDark,
            background: "rgba(241,218,191,0.68)",
            transform: "translateY(-2px)",
            boxShadow: clay.floating,
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: clay.pressed,
          },
          "&:focus-visible": {
            outline: `3px solid ${alpha(colors.coral, 0.32)}`,
            outlineOffset: "3px",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontFamily: fontMono,
          fontWeight: 700,
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: "rgba(241,218,191,0.5)",
          border: clay.hairline,
          boxShadow: clay.raisedSmall,
          color: colors.inkSoft,
        },
        colorPrimary: {
          background: "linear-gradient(145deg, rgba(225,90,151,0.72), rgba(225,90,151,0.9))",
          color: colors.cream,
          border: "1px solid rgba(255,255,255,0.36)",
        },
        colorSecondary: {
          background: clay.surfaceCool,
          color: colors.brown,
          border: "1px solid rgba(255,255,255,0.45)",
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          color: colors.ink,
          borderRadius: 16,
          background: "rgba(241,218,191,0.46)",
          boxShadow: clay.pressed,
          transition: "background-color 170ms ease, box-shadow 170ms ease",
          "&.Mui-focused": {
            background: "rgba(241,218,191,0.68)",
            boxShadow: `${clay.pressed}, 0 0 0 3px ${alpha(colors.coral, 0.2)}`,
          },
        },
        input: {
          "&::placeholder": {
            color: alpha(colors.ink, 0.45),
            opacity: 1,
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(colors.coralDark, 0.26),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(colors.coralDark, 0.58),
            borderWidth: "1px",
          },
        },
        notchedOutline: {
          borderColor: "rgba(54,36,23,0.12)",
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: clay.surfaceSoft,
          border: clay.border,
          borderRadius: 24,
          boxShadow: "0 28px 80px rgba(54,36,23,0.28)",
          color: colors.ink,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          background: "rgba(241,218,191,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: clay.border,
          borderRadius: 18,
          boxShadow: clay.floating,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 8px",
          color: colors.ink,
          "&:hover": {
            background: "rgba(241,218,191,0.68)",
          },
          "&.Mui-selected": {
            background: alpha(colors.coral, 0.14),
          },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(54,36,23,0.12)",
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.ink,
          color: colors.cream,
          fontSize: "0.78rem",
          fontFamily: fontBody,
          borderRadius: 10,
          padding: "8px 11px",
          boxShadow: "0 12px 30px rgba(54,36,23,0.22)",
        },
        arrow: {
          color: colors.ink,
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

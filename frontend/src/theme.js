import { createTheme, alpha } from "@mui/material/styles";

const colors = {
  pink: "#FF579F",
  brown: "#8C7051",
  cream: "#28262B",
  blue: "#0091AD",
  ink: "#F7EFE8",
  inkSoft: "#D8C6B3",
  clay: "#28262B",
  clayDeep: "#1F1F23",
  coral: "#FF579F",
  coralDark: "#C93A78",
  apricot: "#8C7051",
  linen: "#1B1B1E",
  sage: "#8C7051",
  mint: "#23272B",
  sky: "#0091AD",
  lavender: "#332936",
  muted: "rgba(247,239,232,0.72)",
  quiet: "rgba(247,239,232,0.48)",
};

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const value = parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized,
    16
  );

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const transparent = (color, opacity) => {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r},${g},${b},${opacity})`;
};

const colorRoles = {
  brand: {
    primary: colors.coral,
    primaryLight: "#FF86BA",
    primaryDark: colors.coralDark,
    secondary: colors.brown,
    secondarySoft: colors.inkSoft,
    accent: colors.apricot,
    signal: colors.blue,
  },
  canvas: {
    page: colors.linen,
    base: colors.cream,
    soft: "#FFF1DF",
    muted: colors.mint,
    warm: colors.apricot,
    cool: colors.lavender,
  },
  text: {
    strong: colors.ink,
    body: colors.muted,
    subtle: colors.quiet,
    inverse: colors.cream,
    link: colors.coralDark,
  },
  line: {
    soft: "rgba(247,239,232,0.12)",
    medium: "rgba(247,239,232,0.18)",
    strong: "rgba(247,239,232,0.28)",
    light: "rgba(247,239,232,0.16)",
    lightStrong: "rgba(247,239,232,0.28)",
  },
  state: {
    hover: "rgba(247,239,232,0.08)",
    selected: "rgba(255,87,159,0.16)",
    focus: transparent(colors.coral, 0.24),
    disabled: "rgba(247,239,232,0.28)",
    disabledBackground: "rgba(247,239,232,0.08)",
  },
};

const gradients = {
  page:
    "radial-gradient(circle at 12% 8%, rgba(255,87,159,0.18) 0 15rem, transparent 26rem), radial-gradient(circle at 88% 16%, rgba(0,145,173,0.16) 0 13rem, transparent 24rem), radial-gradient(circle at 50% 90%, rgba(140,112,81,0.18) 0 16rem, transparent 30rem), linear-gradient(135deg, #1B1B1E 0%, #222127 48%, #1F2427 100%)",
  pageFade: `linear-gradient(180deg, transparent 0%, ${colors.linen} 72%)`,
  surface: "linear-gradient(145deg, #302B31 0%, #28262B 52%, #1F1F23 100%)",
  surfaceSoft: "linear-gradient(145deg, #343039 0%, #28262B 58%, #212127 100%)",
  surfaceCool: "linear-gradient(145deg, #253138 0%, #23272B 52%, #1D2225 100%)",
  brand: `linear-gradient(145deg, ${colors.pink} 0%, ${colors.brown} 100%)`,
  brandHover: `linear-gradient(145deg, ${colors.coralDark} 0%, ${colors.inkSoft} 100%)`,
  brandSoft: `linear-gradient(135deg, ${colors.coral} 0%, ${colors.coralDark} 100%)`,
  brandGlow: `linear-gradient(90deg, ${colors.coral}, transparent)`,
  mediaScrim:
    "linear-gradient(to top, rgba(10,10,12,0.82) 0%, rgba(10,10,12,0.24) 55%, transparent 100%)",
  imageScrim:
    "linear-gradient(to top, rgba(10,10,12,0.66) 0%, rgba(10,10,12,0.16) 48%, transparent 100%)",
  shine: "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 35%)",
};

const clay = {
  surface: gradients.surface,
  surfaceSoft: gradients.surfaceSoft,
  surfaceCool: gradients.surfaceCool,
  raised:
    "12px 14px 28px rgba(0,0,0,0.32), -10px -10px 24px rgba(255,255,255,0.035)",
  raisedSmall:
    "7px 8px 16px rgba(0,0,0,0.28), -6px -6px 14px rgba(255,255,255,0.03)",
  pressed:
    "inset 6px 7px 13px rgba(0,0,0,0.32), inset -6px -6px 14px rgba(255,255,255,0.03)",
  floating:
    "0 24px 60px rgba(0,0,0,0.42), 0 7px 18px rgba(0,0,0,0.26)",
  border: `1px solid ${colorRoles.line.light}`,
  hairline: `1px solid ${colorRoles.line.soft}`,
};

const fontDisplay = `"Syne", "DM Sans", sans-serif`;
const fontBody = `"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `"JetBrains Mono", ui-monospace, monospace`;

const fonts = {
  display: fontDisplay,
  body: fontBody,
  mono: fontMono,
};

const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  pill: 999,
  circle: "50%",
};

const spacing = {
  pageX: "clamp(18px, 4vw, 64px)",
  sectionY: "clamp(72px, 11vw, 132px)",
  sectionYCompact: "clamp(44px, 7vw, 84px)",
  contentMax: 1180,
  proseMax: 720,
  navHeight: 76,
};

const motion = {
  duration: {
    fast: "150ms",
    base: "180ms",
    slow: "300ms",
    slower: "420ms",
  },
  easing: {
    standard: "cubic-bezier(0.22, 1, 0.36, 1)",
    expressive: "cubic-bezier(0.34,1.56,0.64,1)",
    inOut: "ease-in-out",
  },
  transition: {
    interactive:
      "background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
    lift: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 300ms ease",
    media: "transform 600ms ease, opacity 300ms ease",
    opacity: "opacity 180ms ease",
  },
};

const shadows = Array.from({ length: 25 }, (_, index) => {
  if (index === 0) return "none";
  const lift = Math.min(index + 5, 28);
  const blur = Math.min(index * 4 + 12, 72);
  const opacity = Math.min(0.11 + index * 0.006, 0.26);
  const lightOffset = Math.ceil(index / 3);

  return `0 ${lift}px ${blur}px rgba(0,0,0,${opacity + 0.08}), -${lightOffset}px -${lightOffset}px ${
    10 + lightOffset
  }px rgba(255,255,255,0.035)`;
});

const effects = {
  blur: {
    appBar: "blur(22px)",
    menu: "blur(20px)",
  },
  focusRing: `0 0 0 3px ${transparent(colors.coral, 0.24)}`,
  focusOutline: `3px solid ${transparent(colors.coral, 0.32)}`,
  glow: {
    primary: `0 0 8px ${transparent(colors.coral, 0.4)}`,
    primaryStrong: `0 0 10px ${colors.coral}, 0 0 24px ${transparent(colors.coral, 0.5)}`,
    rule: `0 2px 14px ${transparent(colors.coral, 0.5)}`,
  },
  orb: {
    rose:
      `radial-gradient(circle at 40% 40%, ${transparent(colors.coral, 0.2)} 0%, ${transparent(colors.coralDark, 0.13)} 55%, transparent 72%)`,
    brown:
      `radial-gradient(circle, ${transparent(colors.brown, 0.27)} 0%, transparent 70%)`,
    primary: (color = colors.coral, size = 52) => ({
      background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, ${color} 48%, ${colors.clayDeep} 100%)`,
      boxShadow: [
        `0 ${size * 0.1}px ${size * 0.3}px rgba(151,82,69,0.24)`,
        `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.45)`,
        `inset ${size * 0.03}px ${size * 0.03}px ${size * 0.08}px rgba(255,255,255,0.45)`,
      ].join(", "),
    }),
  },
  overlay: {
    modal: "rgba(0, 0, 0, 0.7)",
    wash: transparent(colors.cream, 0.46),
    washStrong: transparent(colors.cream, 0.68),
    tint: transparent(colors.coral, 0.14),
  },
};

const patterns = {
  page: {
    shell: {
      backgroundColor: colors.linen,
      minHeight: "100vh",
      color: colors.ink,
      position: "relative",
      overflow: "hidden",
    },
    contentNarrow: {
      position: "relative",
      zIndex: 2,
      maxWidth: 720,
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: 24,
      paddingRight: 24,
    },
    noise: {
      position: "absolute",
      inset: 0,
      opacity: 0.022,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "128px 128px",
    },
  },
  surface: {
    raised: {
      background: clay.surfaceSoft,
      border: clay.border,
      borderRadius: `${radius["3xl"]}px`,
      boxShadow: clay.raised,
      color: colors.ink,
    },
    compact: {
      background: clay.surfaceSoft,
      border: clay.border,
      borderRadius: `${radius.lg}px`,
      boxShadow: clay.raisedSmall,
      color: colors.ink,
    },
    pressed: {
      background: transparent(colors.cream, 0.46),
      border: clay.hairline,
      borderRadius: `${radius.lg}px`,
      boxShadow: clay.pressed,
      color: colors.ink,
    },
    glass: {
      background: clay.surfaceSoft,
      border: clay.border,
      borderRadius: `${radius["2xl"]}px`,
      boxShadow: clay.raised,
      position: "relative",
      overflow: "hidden",
    },
  },
  interactive: {
    lift: {
      transition: motion.transition.lift,
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: clay.floating,
        borderColor: transparent(colors.coral, 0.4),
      },
    },
    press: {
      transition: motion.transition.interactive,
      "&:active": {
        transform: "translateY(0)",
        boxShadow: clay.pressed,
      },
    },
    focus: {
      "&:focus-visible": {
        outline: effects.focusOutline,
        outlineOffset: "3px",
      },
    },
  },
  media: {
    squareCover: {
      position: "relative",
      paddingTop: "100%",
      overflow: "hidden",
    },
    coverImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: motion.transition.media,
    },
    bottomScrim: {
      position: "absolute",
      inset: 0,
      background: gradients.mediaScrim,
      pointerEvents: "none",
    },
  },
  accentBar: {
    vertical: {
      width: 4,
      height: 36,
      borderRadius: "2px",
      backgroundColor: colors.coral,
      boxShadow: effects.glow.rule,
    },
    horizontal: {
      width: 48,
      height: 3,
      borderRadius: "2px",
      backgroundColor: colors.coral,
      boxShadow: effects.glow.rule,
    },
  },
  badge: {
    soft: {
      display: "inline-flex",
      alignItems: "center",
      gap: 0.6,
      background: transparent(colors.coral, 0.13),
      border: `1px solid ${transparent(colors.coral, 0.27)}`,
      borderRadius: `${radius.pill}px`,
    },
  },
  button: {
    primary: {
      background: gradients.brandSoft,
      color: colors.cream,
      border: `1px solid ${transparent(colors.coral, 0.4)}`,
      boxShadow: clay.raisedSmall,
      transition: motion.transition.interactive,
      "&:hover": {
        background: `linear-gradient(135deg, ${colorRoles.brand.primaryLight}, ${colors.coral})`,
        boxShadow: clay.floating,
        transform: "translateY(-1px)",
      },
    },
    quiet: {
      color: colors.muted,
      background: clay.surfaceSoft,
      border: clay.border,
      boxShadow: clay.raisedSmall,
      transition: motion.transition.interactive,
      "&:hover": {
        color: colors.ink,
        borderColor: colors.coral,
        background: transparent(colors.coral, 0.08),
      },
    },
  },
};

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: colors.linen,
      paper: colors.cream,
    },
    primary: {
      main: colors.coral,
      light: colorRoles.brand.primaryLight,
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
    divider: colorRoles.line.soft,
    action: {
      active: colorRoles.brand.secondary,
      hover: colorRoles.state.hover,
      selected: colorRoles.state.selected,
      disabled: colorRoles.state.disabled,
      disabledBackground: colorRoles.state.disabledBackground,
      focus: colorRoles.state.focus,
    },
  },

  custom: {
    colors,
    colorRoles,
    gradients,
    clay,
    fonts,
    radius,
    spacing,
    motion,
    effects,
    patterns,
    transparent,
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
    borderRadius: radius.xl,
  },

  shadows,

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --clay-bg: ${colorRoles.canvas.page};
          --clay-surface: ${colorRoles.canvas.base};
          --clay-surface-soft: ${colorRoles.canvas.soft};
          --clay-ink: ${colorRoles.text.strong};
          --clay-muted: ${colorRoles.text.body};
          --clay-coral: ${colorRoles.brand.primary};
          --clay-sage: ${colorRoles.brand.secondary};
          --clay-apricot: ${colorRoles.brand.accent};
          --clay-raised: ${clay.raised};
          --clay-raised-small: ${clay.raisedSmall};
          --clay-pressed: ${clay.pressed};
          --clay-floating: ${clay.floating};
          --clay-border: ${clay.border};
          --gradient-brand-soft: ${gradients.brandSoft};
          --image-scrim: ${gradients.imageScrim};
          --radius-sm: ${radius.sm}px;
          --radius-md: ${radius.md}px;
          --radius-lg: ${radius.lg}px;
          --radius-xl: ${radius.xl}px;
          --radius-panel: ${radius["3xl"]}px;
          --font-display: ${fontDisplay};
          --font-body: ${fontBody};
          --font-mono: ${fontMono};
          --motion-interactive: ${motion.transition.interactive};
          --motion-lift: ${motion.transition.lift};
          --motion-opacity: ${motion.transition.opacity};
        }

        html { scroll-behavior: smooth; overflow-x: hidden; }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: ${gradients.page};
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
          background: "rgba(40,38,43,0.78)",
          color: colors.ink,
          backdropFilter: effects.blur.appBar,
          WebkitBackdropFilter: effects.blur.appBar,
          borderBottom: clay.border,
          boxShadow: "0 14px 34px rgba(0,0,0,0.32)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.cream,
          backgroundImage: clay.surfaceSoft,
          border: clay.border,
          borderRadius: radius.xl,
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
          borderRadius: radius["3xl"],
          boxShadow: clay.raised,
          color: colors.ink,
          overflow: "hidden",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.lg,
          minHeight: 44,
          padding: "0.74rem 1.28rem",
          textTransform: "none",
          boxShadow: clay.raisedSmall,
          transition: motion.transition.interactive,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: clay.floating,
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: clay.pressed,
          },
          "&:focus-visible": {
            outline: effects.focusOutline,
            outlineOffset: "3px",
          },
        },
        contained: {
          background: gradients.brand,
          color: colors.cream,
          border: `1px solid ${colorRoles.line.lightStrong}`,
          "&:hover": {
            background: gradients.brandHover,
          },
        },
        outlined: {
          color: colors.ink,
          borderColor: transparent(colors.brown, 0.13),
          background: transparent(colors.cream, 0.38),
          "&:hover": {
            color: colors.ink,
            borderColor: alpha(colors.coralDark, 0.32),
            background: transparent(colors.cream, 0.56),
          },
        },
        text: {
          color: colors.coralDark,
          boxShadow: "none",
          "&:hover": {
            background: "rgba(255,87,159,0.1)",
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
          background: transparent(colors.cream, 0.44),
          border: clay.border,
          boxShadow: clay.raisedSmall,
          transition: motion.transition.interactive,
          "&:hover": {
            color: colors.coralDark,
            background: transparent(colors.cream, 0.68),
            transform: "translateY(-2px)",
            boxShadow: clay.floating,
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: clay.pressed,
          },
          "&:focus-visible": {
            outline: effects.focusOutline,
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
          background: transparent(colors.cream, 0.5),
          border: clay.hairline,
          boxShadow: clay.raisedSmall,
          color: colors.inkSoft,
        },
        colorPrimary: {
          background: `linear-gradient(145deg, ${transparent(colors.coral, 0.72)}, ${transparent(colors.coral, 0.9)})`,
          color: colors.cream,
          border: `1px solid ${colorRoles.line.lightStrong}`,
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
          borderRadius: radius.lg,
          background: transparent(colors.cream, 0.46),
          boxShadow: clay.pressed,
          transition: "background-color 180ms ease, box-shadow 180ms ease",
          "&.Mui-focused": {
            background: transparent(colors.cream, 0.68),
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
          borderRadius: radius.lg,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(colors.coralDark, 0.26),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(colors.coralDark, 0.58),
            borderWidth: "1px",
          },
        },
        notchedOutline: {
          borderColor: colorRoles.line.soft,
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
          borderRadius: radius["3xl"],
          boxShadow: "0 28px 80px rgba(0,0,0,0.46)",
          color: colors.ink,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          background: "rgba(40,38,43,0.92)",
          backdropFilter: effects.blur.menu,
          WebkitBackdropFilter: effects.blur.menu,
          border: clay.border,
          borderRadius: radius.xl,
          boxShadow: clay.floating,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          margin: "4px 8px",
          color: colors.ink,
          "&:hover": {
            background: transparent(colors.cream, 0.68),
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
          borderColor: colorRoles.line.soft,
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
          borderRadius: radius.sm,
          padding: "8px 11px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.34)",
        },
        arrow: {
          color: colors.ink,
        },
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: spacing.pageX,
          paddingRight: spacing.pageX,
        },
      },
    },
  },
});

export default theme;

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F0E0E", // Deeper black for more contrast
      paper: "#1C1B1A",   // Subtle warm contrast
    },
    primary: {
      main: "#FF3366", // Vibrant pink-red
      light: "#FF6F91",
      dark: "#B3003C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#646E78",
      light: "#88909A",
      dark: "#3B434A",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#EAEAEA",     // Softer white
      secondary: "#B0B0B0",   // Mid-gray
      disabled: "#7D7D7D",
    },
    divider: "rgba(255, 255, 255, 0.06)",
  },


  typography: {
    fontFamily: `"Bebas Neue", "Helvetica", "Arial", sans-serif`,
    h1: {
      fontWeight: 800,
      fontSize: "4.5rem",
      lineHeight: 1.1,
      letterSpacing: "-0.00em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.75rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.8,
      fontFamily: `"Helvetica", sans-serif`,
    },
    button: {
      fontWeight: 700,
      fontSize: "0.9rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
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
          overflowX: "hidden", // 💥 Prevent horizontal overflow
        },
        body: {
          margin: 0,
          padding: 0,
          overflowX: "hidden", // 💥 Prevent horizontal scroll
          backgroundColor: "#0F0E0E",
          color: "#EAEAEA",
          fontSmoothing: "antialiased",
        },
        "#root": {
          width: "100%",
          overflowX: "hidden", // 💥 Prevent root overflow
        },
        "*": {
          boxSizing: "border-box",
        },
        a: {
          color: "#FF3366",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 20px rgba(255, 51, 102, 0.1)",
          borderRadius: 20,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "scale(1.015)",
            boxShadow: "0 6px 24px rgba(255, 51, 102, 0.25)",
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
          transition: "all 0.2s ease-in-out",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#ff3366",
            boxShadow: "0 4px 12px rgba(255, 51, 102, 0.2)",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(20, 18, 4, 0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 1px 8px rgba(0, 0, 0, 0.3)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
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
          color: "#ffffff",
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

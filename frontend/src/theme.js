import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0d0d0d",
      paper: "#141414", // Slightly deeper than before
    },
    primary: {
      main: "#ff3366",
    },
    secondary: {
      main: "#e6e6e6",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#999999",
    },
  },

  typography: {
    fontFamily: `"Outfit", "Inter", "DM Sans", "Helvetica", "Arial", sans-serif`,
    h1: {
      fontWeight: 800,
      fontSize: "2.8rem",
      letterSpacing: "-0.75px",
      lineHeight: 1.15,
    },
    h2: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.5px",
    },
    h5: {
      fontWeight: 600,
      fontSize: "0.95rem",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.7,
    },
    button: {
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          borderRadius: 20,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0 6px 28px rgba(255, 51, 102, 0.25)",
            borderColor: "rgba(255, 255, 255, 0.08)",
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
            boxShadow: "0 4px 12px rgba(255, 51, 102, 0.2)",
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 1px 8px rgba(0, 0, 0, 0.3)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#141414",
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
          color: "#fff",
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
          background: "#1a1a1a",
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;

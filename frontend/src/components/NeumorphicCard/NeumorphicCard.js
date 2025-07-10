import React from "react";
import { Box, useTheme, alpha } from "@mui/material";

const NeumorphicCard = ({ children, onClick, sx = {}, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const bg = theme.palette.background.default;
  const shadowDark = alpha("#000", isDark ? 0.6 : 0.1);
  const shadowLight = alpha("#fff", isDark ? 0.07 : 0.6);

  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "16px",
        backgroundColor: "transparent",
        boxShadow: `
          8px 8px 16px ${shadowDark},
          -8px -8px 16px ${shadowLight}
        `,
        padding: "0rem",
        transition: "all 0.15s ease-in-out",
        userSelect: "none",
        cursor: onClick ? "pointer" : "default",
        transform: "translateY(0)",

        "&:active": {
          boxShadow: `
            inset 6px 6px 12px ${shadowDark},
            inset -6px -6px 12px ${shadowLight}
          `,
          transform: "scale(0.97)",
          backgroundColor: "transparent"
        },

        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default NeumorphicCard;

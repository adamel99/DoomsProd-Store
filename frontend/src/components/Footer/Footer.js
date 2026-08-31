import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={(theme) => ({
        position: "relative",
        zIndex: 3,
        borderTop: theme.custom.clay.hairline,
        background: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        px: { xs: 2.5, sm: 4, md: 6 },
        py: 3,
      })}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: "0.82rem" }}>
          © {new Date().getFullYear()} doomsprod
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Link
            component={RouterLink}
            to="/terms"
            sx={{
              color: "primary.main",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecorationColor: "currentColor",
            }}
          >
            Terms
          </Link>
          <Link
            component={RouterLink}
            to="/privacy-policy"
            sx={{
              color: "primary.main",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecorationColor: "currentColor",
            }}
          >
            Privacy Policy
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;

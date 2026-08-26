// CheckoutCancel.jsx
import React from "react";
import { useHistory } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const LiquidBackground = React.memo(() => (
  <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <Box sx={{
      position: "absolute", top: "-10vh", left: "-8vw",
      width: { xs: "55vw", md: "40vw" }, height: { xs: "55vw", md: "40vw" },
      borderRadius: "50%",
      background: (theme) => `radial-gradient(circle at 40% 40%, 33 0%, 22 55%, transparent 72%)`,
      filter: "blur(70px)",
      animation: "orbF1 22s ease-in-out infinite",
      "@keyframes orbF1": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(4vw, 5vh) scale(1.07)" },
      },
    }} />
    <Box sx={{
      position: "absolute", bottom: 0, right: "-10vw",
      width: { xs: "45vw", md: "32vw" }, height: { xs: "45vw", md: "32vw" },
      borderRadius: "50%",
      background: (theme) => `radial-gradient(circle, 44 0%, transparent 70%)`,
      filter: "blur(80px)",
      animation: "orbF2 30s ease-in-out infinite reverse",
      "@keyframes orbF2": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(-4vw, -5vh) scale(1.1)" },
      },
    }} />
    <Box sx={{
      position: "absolute", inset: 0, opacity: 0.022,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px 128px",
    }} />
  </Box>
));

const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={(theme) => ({
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "28px",
      boxShadow: theme.custom.clay.raised,
      ...sx,
    })}
    {...rest}
  >
    {children}
  </Box>
);

export default function CheckoutCancel() {
  const history = useHistory();

  return (
    <Box sx={{
      backgroundColor: "background.default",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "text.primary",
      position: "relative",
      overflow: "hidden",
      px: 2,
    }}>
      <LiquidBackground />

      <Box sx={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 520 }}>
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassPanel sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>

            {/* Cancel icon */}
            <Box sx={{ display: "inline-flex", mb: 4 }}>
              <Box sx={{
                width: 88, height: 88, borderRadius: "50%",
                background: (theme) => `${theme.palette.primary.main}14`,
                border: (theme) => `1px solid ${theme.palette.primary.main}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: (theme) => theme.custom.clay.raisedSmall,
              }}>
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <HighlightOffIcon sx={{ fontSize: 48, color: "primary.main" }} />
                </motion.div>
              </Box>
            </Box>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <Box sx={{ width: 48, height: 3, borderRadius: "2px", bgcolor: "primary.main", mx: "auto", mb: 3, boxShadow: (theme) => `0 2px 12px ${theme.palette.primary.main}80` }} />
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 800,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: "text.primary", lineHeight: 1.15, mb: 2,
              }}>
                Payment Canceled
              </Typography>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.body,
                color: "text.secondary",
                fontSize: "0.95rem", lineHeight: 1.7, mb: 4,
              }}>
                No worries — your cart is still saved. You can return and complete
                your purchase whenever you're ready.
              </Typography>
            </motion.div>

            {/* Return to cart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={() => history.push("/cart")}
                sx={{
                  mb: 2,
                  py: 1.8,
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: "14px",
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: (theme) => theme.custom.clay.raisedSmall,
                  "&:hover": {
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    boxShadow: (theme) => theme.custom.clay.floating,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Return to Cart
              </Button>
            </motion.div>

            {/* Back to shop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                fullWidth
                startIcon={<ArrowBackIcon />}
                onClick={() => history.push("/products")}
                sx={{
                  py: 1.4,
                  fontFamily: (theme) => theme.custom.fonts.body,
                  fontWeight: 600, fontSize: "0.875rem",
                  color: "text.secondary",
                  background: (theme) => theme.custom.clay.surfaceSoft,
                  border: (theme) => theme.custom.clay.border,
                  borderRadius: "14px",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    color: "text.primary",
                    borderColor: "primary.main",
                    background: (theme) => `${theme.palette.primary.main}14`,
                  },
                }}
              >
                Back to Collection
              </Button>
            </motion.div>

          </GlassPanel>
        </motion.div>
      </Box>
    </Box>
  );
}

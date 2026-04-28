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
      background: "radial-gradient(circle at 40% 40%, rgba(228,63,111,0.2) 0%, rgba(192,45,90,0.08) 55%, transparent 72%)",
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
      background: "radial-gradient(circle, rgba(150,20,60,0.15) 0%, transparent 70%)",
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
    sx={{
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderTop: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "28px",
      boxShadow: [
        "0 1px 0 rgba(255,255,255,0.07) inset",
        "0 24px 64px rgba(0,0,0,0.6)",
        "8px 8px 20px rgba(0,0,0,0.4)",
        "-3px -3px 10px rgba(255,255,255,0.015)",
      ].join(", "),
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

export default function CheckoutCancel() {
  const history = useHistory();

  return (
    <Box sx={{
      backgroundColor: "#0e0b0d",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#FFEAEC",
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
                background: "rgba(228,63,111,0.08)",
                border: "1px solid rgba(228,63,111,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 32px rgba(228,63,111,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <HighlightOffIcon sx={{ fontSize: 48, color: "#E43F6F" }} />
                </motion.div>
              </Box>
            </Box>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <Box sx={{ width: 48, height: 3, borderRadius: "2px", bgcolor: "#E43F6F", mx: "auto", mb: 3, boxShadow: "0 2px 12px rgba(228,63,111,0.5)" }} />
              <Typography sx={{
                fontFamily: `"Syne", sans-serif`,
                fontWeight: 800,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: "#FFEAEC", lineHeight: 1.15, mb: 2,
              }}>
                Payment Canceled
              </Typography>
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                color: "rgba(255,234,236,0.45)",
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
                  fontFamily: `"Syne", sans-serif`,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #E43F6F, #c02d5a)",
                  boxShadow: "0 6px 24px rgba(228,63,111,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #f0537f, #d03568)",
                    boxShadow: "0 8px 32px rgba(228,63,111,0.5)",
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
                  fontFamily: `"DM Sans", sans-serif`,
                  fontWeight: 600, fontSize: "0.875rem",
                  color: "rgba(255,234,236,0.4)",
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    color: "#FFEAEC",
                    borderColor: "rgba(228,63,111,0.3)",
                    background: "rgba(228,63,111,0.07)",
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

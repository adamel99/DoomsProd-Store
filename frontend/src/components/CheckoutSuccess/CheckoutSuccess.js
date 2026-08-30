import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const LiquidBackground = React.memo(() => (
  <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <Box sx={{
      position: "absolute", top: "-10vh", left: "-8vw",
      width: { xs: "55vw", md: "40vw" }, height: { xs: "55vw", md: "40vw" },
      borderRadius: "50%",
      background: (theme) => theme.custom.effects.orb.rose,
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
      background: (theme) => theme.custom.effects.orb.brown,
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
      ...theme.custom.patterns.surface.raised,
      borderRadius: "var(--radius-panel)",
      ...sx,
    })}
    {...rest}
  >
    {children}
  </Box>
);

export default function CheckoutSuccess() {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  const isFree = location.state?.isFree || false;
  const freeDownloadLinks = location.state?.downloadLinks || [];
  const [ring, setRing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRing(true), 200);
    return () => clearTimeout(t);
  }, []);

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

            {/* Success icon */}
            <Box sx={{ position: "relative", display: "inline-flex", mb: 4 }}>
              {ring && [0, 1, 2].map((i) => (
                <Box key={i} sx={{
                  position: "absolute",
                  inset: `-${(i + 1) * 12}px`,
                  borderRadius: "50%",
                  border: (theme) => `1px solid ${theme.palette.success.main}44`,
                  animation: `ripple 2s ease-out ${i * 0.3}s infinite`,
                  "@keyframes ripple": {
                    "0%": { opacity: 0.7, transform: "scale(0.85)" },
                    "100%": { opacity: 0, transform: "scale(1.2)" },
                  },
                }} />
              ))}
              <Box sx={{
                width: 88, height: 88, borderRadius: "50%",
                background: (theme) => `${theme.palette.success.main}18`,
                border: (theme) => `1px solid ${theme.palette.success.main}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--clay-raised-small)",
              }}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main" }} />
                </motion.div>
              </Box>
            </Box>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Box sx={{ width: 48, height: 3, borderRadius: "2px", bgcolor: "success.main", mx: "auto", mb: 3, boxShadow: (theme) => `0 2px 12px ${theme.palette.success.main}80` }} />
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 800,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: "text.primary", lineHeight: 1.15, mb: 2,
              }}>
                {isFree ? "Your Files Are Ready!" : "Purchase Complete"}
              </Typography>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.body,
                color: "text.secondary",
                fontSize: "0.95rem", lineHeight: 1.7, mb: 4,
              }}>
                {isFree
                  ? "Download your files below. We also sent the links to your email."
                  : "Thank you for your order. You'll receive an email with your download links and license details shortly."}
              </Typography>
            </motion.div>

            {/* Free download links */}
            {isFree && freeDownloadLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                  {freeDownloadLinks.map((download, idx) => {
                    const url = typeof download === "string" ? download : download.url;
                    const label = typeof download === "string"
                      ? `File ${idx + 1}`
                      : (download.type?.toUpperCase() || `File ${idx + 1}`);
                    const fileName = typeof download === "string"
                      ? decodeURIComponent(url.split("?")[0].split("/").pop())
                      : `download.${download.type || idx + 1}`;
                    return (
                      <Button
                        key={idx}
                        fullWidth
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={fileName}
                        sx={{
                          py: 1.5,
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          borderRadius: "var(--radius-md)",
                          color: "success.main",
                          borderColor: "success.main",
                          background: "rgba(46, 125, 50, 0.07)",
                          textAlign: "left",
                          justifyContent: "flex-start",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            borderColor: "success.main",
                            background: "rgba(46, 125, 50, 0.13)",
                          },
                        }}
                      >
                        Download {label}
                      </Button>
                    );
                  })}
                </Box>
              </motion.div>
            )}

            {/* Paid Stripe download button */}
            {!isFree && sessionId && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<DownloadIcon />}
                  onClick={() => history.push(`/downloads/${sessionId}`)}
                  sx={{
                    mb: 2,
                    py: 1.8,
                    fontFamily: (theme) => theme.custom.fonts.display,
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
                    boxShadow: "var(--clay-raised-small)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                      boxShadow: "var(--clay-floating)",
                      transform: "translateY(-2px)",
                    },
                    transition: "var(--motion-lift)",
                  }}
                >
                  Download Your Files
                </Button>
              </motion.div>
            )}

            {/* Back to shop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
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
                  border: "var(--clay-border)",
                  borderRadius: "var(--radius-md)",
                  transition: "var(--motion-interactive)",
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

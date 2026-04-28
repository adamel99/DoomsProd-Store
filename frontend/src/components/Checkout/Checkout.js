import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StripeCheckoutButton from "../StripeCheckoutButton/StripeCheckoutButton";
import { Box, Typography, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

// ─── Shared primitives ───────────────────────────────────────────────────────

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

const LiquidOrb = ({ size = 52, color = "rgba(228,63,111,0.7)", sx = {} }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
    boxShadow: [
      `0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.55)`,
      `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
    ].join(", "),
    ...sx,
  }} />
);

// ─── Order item row ──────────────────────────────────────────────────────────

const OrderItemRow = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
  >
    <Box
      sx={{
        display: "flex",
        gap: 2.5,
        alignItems: "center",
        background: "linear-gradient(160deg, rgba(30,20,24,0.9), rgba(18,12,16,0.95))",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "20px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: [
          "6px 6px 20px rgba(0,0,0,0.6)",
          "-2px -2px 8px rgba(255,255,255,0.02)",
          "0 1px 0 rgba(255,255,255,0.06) inset",
        ].join(", "),
        p: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "rgba(228,63,111,0.18)",
          boxShadow: [
            "8px 8px 28px rgba(0,0,0,0.65)",
            "0 4px 20px rgba(228,63,111,0.1)",
          ].join(", "),
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{
        width: 72, height: 72, flexShrink: 0,
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "4px 4px 12px rgba(0,0,0,0.5)",
      }}>
        <Box
          component="img"
          src={item.image}
          alt={item.productName}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Type badge */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.6, mb: 0.75,
          background: "rgba(228,63,111,0.15)",
          border: "1px solid rgba(228,63,111,0.25)",
          borderRadius: "100px",
          px: 1.2, py: 0.3,
        }}>
          <MusicNoteIcon sx={{ fontSize: 11, color: "#E43F6F" }} />
          <Typography sx={{
            fontFamily: `"DM Sans", sans-serif`,
            fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "1.5px", color: "#E43F6F", textTransform: "uppercase",
          }}>
            {item.type}
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: `"Syne", sans-serif`,
          fontWeight: 700, fontSize: "1rem",
          color: "#FFEAEC", lineHeight: 1.2, mb: 0.4,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.productName}
        </Typography>

        <Typography sx={{
          fontFamily: `"DM Sans", sans-serif`,
          fontSize: "0.78rem",
          color: "rgba(255,234,236,0.35)",
        }}>
          {item.licenseType}
        </Typography>
      </Box>

      {/* Price */}
      <Typography sx={{
        fontFamily: `"Syne", sans-serif`,
        fontWeight: 800, fontSize: "1.15rem",
        color: "#FFEAEC", flexShrink: 0,
      }}>
        ${item.price.toFixed(2)}
      </Typography>
    </Box>
  </motion.div>
);

// ─── Checkout ────────────────────────────────────────────────────────────────

const Checkout = () => {
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) =>
    Object.values(state.cartItems?.allItems || {})
  );

  const formattedCartItems = cartItems.map((item) => {
    let downloadUrls = [];
    try {
      if (Array.isArray(item.downloadUrls)) {
        downloadUrls = item.downloadUrls;
      } else if (typeof item.downloadUrls === "string") {
        downloadUrls = JSON.parse(item.downloadUrls);
      }
    } catch (e) {
      downloadUrls = [];
    }
    return {
      productName: item.productName || "Untitled",
      licenseType: item.licenseType || "Standard",
      price: parseFloat(item.price) || 0,
      type: item.type || "Unknown",
      image: item.imageUrl || "/default-image.png",
      downloadUrls,
    };
  });

  const total = formattedCartItems.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  return (
    <Box sx={{
      backgroundColor: "#0e0b0d",
      minHeight: "100vh",
      pt: { xs: 5, md: 8 },
      pb: { xs: 10, md: 16 },
      color: "#FFEAEC",
      position: "relative",
      overflow: "hidden",
    }}>
      <LiquidBackground />

      <Box sx={{ position: "relative", zIndex: 2, maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 } }}>

        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/cart")}
            sx={{
              mb: 5,
              fontFamily: `"DM Sans", sans-serif`,
              fontWeight: 600, fontSize: "0.875rem",
              color: "rgba(255,234,236,0.4)",
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "100px",
              px: 2.5, py: 1,
              boxShadow: "3px 3px 10px rgba(0,0,0,0.4), -1px -1px 5px rgba(255,255,255,0.02)",
              transition: "all 0.25s ease",
              "&:hover": {
                color: "#FFEAEC",
                borderColor: "rgba(228,63,111,0.3)",
                background: "rgba(228,63,111,0.07)",
              },
            }}
          >
            Back to Cart
          </Button>
        </motion.div>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 6 }}>
            <Box sx={{ width: 4, height: 36, borderRadius: "2px", bgcolor: "#E43F6F", boxShadow: "0 2px 14px rgba(228,63,111,0.5)" }} />
            <Typography sx={{
              fontFamily: `"Syne", sans-serif`,
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "#FFEAEC", lineHeight: 1.1,
            }}>
              Review Your Order
            </Typography>
          </Box>
        </motion.div>

        {/* Order items */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 5 }}>
          {formattedCartItems.map((item, idx) => (
            <OrderItemRow key={idx} item={item} index={idx} />
          ))}
        </Box>

        {/* Summary + checkout panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          <GlassPanel sx={{ p: 3 }}>

            {/* Line items summary */}
            <Box sx={{ mb: 3 }}>
              {formattedCartItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    py: 1.2,
                    borderBottom: idx < formattedCartItems.length - 1
                      ? "1px solid rgba(255,255,255,0.05)"
                      : "none",
                  }}
                >
                  <Box sx={{ minWidth: 0, mr: 2 }}>
                    <Typography sx={{
                      fontFamily: `"DM Sans", sans-serif`,
                      fontSize: "0.88rem", fontWeight: 600,
                      color: "rgba(255,234,236,0.7)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{
                      fontFamily: `"DM Sans", sans-serif`,
                      fontSize: "0.72rem",
                      color: "rgba(255,234,236,0.28)",
                    }}>
                      {item.licenseType}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontFamily: `"DM Sans", sans-serif`,
                    fontSize: "0.88rem", fontWeight: 700,
                    color: "rgba(255,234,236,0.6)", flexShrink: 0,
                  }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Divider */}
            <Box sx={{ height: "1px", background: "rgba(255,255,255,0.07)", mb: 3 }} />

            {/* Total row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3.5 }}>
              <Box>
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`,
                  color: "rgba(255,234,236,0.35)",
                  fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", mb: 0.5,
                }}>
                  Total Due
                </Typography>
                <Typography sx={{
                  fontFamily: `"Syne", sans-serif`,
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  color: "#FFEAEC", lineHeight: 1,
                }}>
                  ${total}
                </Typography>
              </Box>
              <LiquidOrb size={52} color="rgba(228,63,111,0.7)" />
            </Box>

            {/* Stripe button wrapper */}
            <Box sx={{
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(228,63,111,0.25)",
              "& button, & a": {
                width: "100% !important",
                borderRadius: "14px !important",
              },
            }}>
              <StripeCheckoutButton cartItems={formattedCartItems} userId={user?.id} />
            </Box>

            {/* Security note */}
            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`,
              fontSize: "0.72rem",
              color: "rgba(255,234,236,0.2)",
              textAlign: "center",
              mt: 2,
              letterSpacing: "0.3px",
            }}>
              Secured by Stripe · Your payment info is never stored
            </Typography>

          </GlassPanel>
        </motion.div>

      </Box>
    </Box>
  );
};

export default Checkout;

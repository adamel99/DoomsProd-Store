import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StripeCheckoutButton from "../StripeCheckoutButton/StripeCheckoutButton";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { formatProductType } from "../../utils/formatProductType";

// ─── Shared primitives ───────────────────────────────────────────────────────

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

const LiquidOrb = ({ size = 52, color, sx = {} }) => (
  <Box sx={(theme) => ({
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, ${color || theme.palette.primary.main} 48%, ${theme.custom.colors.clayDeep} 100%)`,
    boxShadow: [
      `0 ${size * 0.1}px ${size * 0.3}px rgba(151,82,69,0.24)`,
      `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.45)`,
    ].join(", "),
    ...sx,
  })} />
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
        background: (theme) => theme.custom.clay.surfaceSoft,
        border: (theme) => theme.custom.clay.border,
        borderRadius: "var(--radius-xl)",
        boxShadow: (theme) => theme.custom.clay.raisedSmall,
        p: 2,
        transition: "var(--motion-lift)",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) => theme.custom.clay.floating,
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{
        width: 72, height: 72, flexShrink: 0,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: (theme) => theme.custom.clay.border,
        boxShadow: (theme) => theme.custom.clay.raisedSmall,
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
          background: (theme) => `${theme.palette.primary.main}22`,
          border: (theme) => `1px solid ${theme.palette.primary.main}44`,
          borderRadius: "999px",
          px: 1.2, py: 0.3,
        }}>
          <MusicNoteIcon sx={{ fontSize: 11, color: "primary.main" }} />
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.body,
            fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "1.5px", color: "primary.main", textTransform: "uppercase",
          }}>
            {formatProductType(item.type)}
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 700, fontSize: "1rem",
          color: "text.primary", lineHeight: 1.2, mb: 0.4,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.productName}
        </Typography>

        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.body,
          fontSize: "0.78rem",
          color: "text.secondary",
        }}>
          {item.licenseType}
        </Typography>
      </Box>

      {/* Price */}
      <Typography sx={{
        fontFamily: (theme) => theme.custom.fonts.display,
        fontWeight: 800, fontSize: "1.15rem",
        color: "text.primary", flexShrink: 0,
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
    return {
      productName: item.productName || "Untitled",
      licenseType: item.licenseType || "Standard",
      price: parseFloat(item.price) || 0,
      type: item.type || "Unknown",
      image: item.imageUrl || "/default-image.png",
    };
  });

  const total = formattedCartItems.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  return (
    <Box sx={{
      backgroundColor: "background.default",
      minHeight: "100vh",
      pt: { xs: 5, md: 8 },
      pb: { xs: 10, md: 16 },
      color: "text.primary",
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
              fontFamily: (theme) => theme.custom.fonts.body,
              fontWeight: 600, fontSize: "0.875rem",
              color: "text.secondary",
              background: (theme) => theme.custom.clay.surfaceSoft,
              border: (theme) => theme.custom.clay.border,
              borderRadius: "999px",
              px: 2.5, py: 1,
              boxShadow: (theme) => theme.custom.clay.raisedSmall,
              transition: "var(--motion-interactive)",
              "&:hover": {
                color: "text.primary",
                borderColor: "primary.main",
                background: (theme) => `${theme.palette.primary.main}14`,
              },
            }}
          >
            Back to Cart
          </Button>
        </motion.div>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 6 }}>
            <Box sx={{ width: 4, height: 36, borderRadius: "2px", bgcolor: "primary.main", boxShadow: (theme) => theme.custom.effects.glow.rule }} />
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "text.primary", lineHeight: 1.1,
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
                      ? (theme) => `1px solid ${theme.palette.divider}`
                      : "none",
                  }}
                >
                  <Box sx={{ minWidth: 0, mr: 2 }}>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.body,
                      fontSize: "0.88rem", fontWeight: 600,
                      color: "text.primary",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {item.productName}
                    </Typography>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.body,
                      fontSize: "0.72rem",
                      color: "text.disabled",
                    }}>
                      {item.licenseType}
                    </Typography>
                  </Box>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.body,
                    fontSize: "0.88rem", fontWeight: 700,
                    color: "text.secondary", flexShrink: 0,
                  }}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Divider */}
            <Box sx={{ height: "1px", background: (theme) => theme.palette.divider, mb: 3 }} />

            {/* Total row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3.5 }}>
              <Box>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.body,
                  color: "text.secondary",
                  fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", mb: 0.5,
                }}>
                  Total Due
                </Typography>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  color: "text.primary", lineHeight: 1,
                }}>
                  ${total}
                </Typography>
              </Box>
              <LiquidOrb size={52} color="var(--clay-coral)" />
            </Box>

            {/* Stripe button wrapper */}
            <Box sx={{
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              boxShadow: (theme) => theme.custom.clay.raisedSmall,
              "& button, & a": {
                width: "100% !important",
                borderRadius: "14px !important",
              },
            }}>
              <StripeCheckoutButton cartItems={formattedCartItems} userId={user?.id} />
            </Box>

            {/* Security note */}
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: "0.72rem",
              color: "text.disabled",
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

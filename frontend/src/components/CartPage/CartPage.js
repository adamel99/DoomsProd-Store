import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { fetchCartItemsThunk, deleteCartItemThunk } from "../../store/cartItems";
import { Box, Typography, Button, Grid, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

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

// ─── CartItem card ───────────────────────────────────────────────────────────

const CartItemCard = ({ item, onRemove }) => {
  const { id, productName, type, licenseType, price, imageUrl } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        {/* Image */}
        <Box sx={{
          width: 72, height: 72, flexShrink: 0,
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "4px 4px 12px rgba(0,0,0,0.5)",
          position: "relative",
        }}>
          <Box
            component="img"
            src={imageUrl || "/default-image.png"}
            alt={productName || "Product"}
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
              {type || "Product"}
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: `"Syne", sans-serif`,
            fontWeight: 700,
            fontSize: "1rem",
            color: "#FFEAEC",
            lineHeight: 1.2,
            mb: 0.4,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {productName || "Unknown"}
          </Typography>

          {licenseType && (
            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`,
              fontSize: "0.78rem",
              color: "rgba(255,234,236,0.35)",
            }}>
              {licenseType}
            </Typography>
          )}
        </Box>

        {/* Price + remove */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{
            fontFamily: `"Syne", sans-serif`,
            fontWeight: 800,
            fontSize: "1.15rem",
            color: "#FFEAEC",
          }}>
            ${parseFloat(price || 0).toFixed(2)}
          </Typography>
          <IconButton
            onClick={() => onRemove(id)}
            size="small"
            sx={{
              width: 34, height: 34,
              background: "rgba(228,63,111,0.08)",
              border: "1px solid rgba(228,63,111,0.2)",
              borderRadius: "10px",
              color: "#E43F6F",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "rgba(228,63,111,0.18)",
                borderColor: "rgba(228,63,111,0.45)",
                transform: "scale(1.08)",
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── CartPage ────────────────────────────────────────────────────────────────

const CartPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) =>
    Object.values(state.cartItems?.allItems || {})
  );

  useEffect(() => {
    dispatch(fetchCartItemsThunk());
  }, [dispatch]);

  const totalPrice = cartItems
    .reduce((acc, item) => acc + parseFloat(item.price || 0), 0)
    .toFixed(2);

  const handleRemove = (id) => dispatch(deleteCartItemThunk(id));

  const handleCheckout = () => {
    if (!user) { history.push("/login"); return; }
    history.push({ pathname: "/checkout", state: { cartItems } });
  };

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
            onClick={() => history.push("/products")}
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
            Back to Collection
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
              Your Cart
            </Typography>
            {cartItems.length > 0 && (
              <Box sx={{
                ml: 0.5,
                px: 1.5, py: 0.4,
                background: "rgba(228,63,111,0.15)",
                border: "1px solid rgba(228,63,111,0.3)",
                borderRadius: "100px",
              }}>
                <Typography sx={{ fontFamily: `"DM Sans", sans-serif`, fontSize: "0.8rem", fontWeight: 700, color: "#E43F6F" }}>
                  {cartItems.length}
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>

        {/* Empty state */}
        {cartItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <GlassPanel sx={{ p: { xs: 6, md: 10 }, textAlign: "center" }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%", mx: "auto", mb: 3,
                background: "rgba(228,63,111,0.08)",
                border: "1px solid rgba(228,63,111,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShoppingCartIcon sx={{ fontSize: 32, color: "rgba(228,63,111,0.5)" }} />
              </Box>
              <Typography sx={{
                fontFamily: `"Syne", sans-serif`,
                fontWeight: 700, fontSize: "1.3rem",
                color: "#FFEAEC", mb: 1,
              }}>
                Your cart is empty
              </Typography>
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                color: "rgba(255,234,236,0.35)", fontSize: "0.9rem", mb: 4,
              }}>
                Browse the collection and add something you love.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => history.push("/products")}
                sx={{
                  borderColor: "rgba(228,63,111,0.3)", color: "#E43F6F",
                  borderRadius: "100px", px: 3, py: 1,
                  "&:hover": { borderColor: "#E43F6F", bgcolor: "rgba(228,63,111,0.08)" },
                }}
              >
                Browse Collection
              </Button>
            </GlassPanel>
          </motion.div>
        ) : (
          <>
            {/* Items list */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 5 }}>
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <CartItemCard key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </AnimatePresence>
            </Box>

            {/* Total + checkout */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <GlassPanel sx={{ p: 3 }}>
                {/* Divider line */}
                <Box sx={{ height: "1px", background: "rgba(255,255,255,0.06)", mb: 3 }} />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                  <Box>
                    <Typography sx={{
                      fontFamily: `"DM Sans", sans-serif`,
                      color: "rgba(255,234,236,0.35)",
                      fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", mb: 0.5,
                    }}>
                      Total
                    </Typography>
                    <Typography sx={{
                      fontFamily: `"Syne", sans-serif`,
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "2.6rem" },
                      color: "#FFEAEC", lineHeight: 1,
                    }}>
                      ${totalPrice}
                    </Typography>
                  </Box>
                  <LiquidOrb size={52} color="rgba(228,63,111,0.7)" />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleCheckout}
                  sx={{
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
                  Proceed to Checkout
                </Button>
              </GlassPanel>
            </motion.div>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CartPage;

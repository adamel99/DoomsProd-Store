import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { fetchCartItemsThunk, deleteCartItemThunk } from "../../store/cartItems";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
          background: (theme) => theme.custom.clay.surfaceSoft,
          border: (theme) => theme.custom.clay.border,
          borderRadius: "20px",
          boxShadow: (theme) => theme.custom.clay.raisedSmall,
          p: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: (theme) => theme.custom.clay.floating,
          },
        }}
      >
        {/* Image */}
        <Box sx={{
          width: 72, height: 72, flexShrink: 0,
          borderRadius: "14px",
          overflow: "hidden",
          border: (theme) => theme.custom.clay.border,
          boxShadow: (theme) => theme.custom.clay.raisedSmall,
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
            background: (theme) => `${theme.palette.primary.main}22`,
            border: (theme) => `1px solid ${theme.palette.primary.main}44`,
            borderRadius: "100px",
            px: 1.2, py: 0.3,
          }}>
            <MusicNoteIcon sx={{ fontSize: 11, color: "primary.main" }} />
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: "0.6rem", fontWeight: 700,
              letterSpacing: "1.5px", color: "primary.main", textTransform: "uppercase",
            }}>
              {formatProductType(type)}
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.display,
            fontWeight: 700,
            fontSize: "1rem",
            color: "text.primary",
            lineHeight: 1.2,
            mb: 0.4,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {productName || "Unknown"}
          </Typography>

          {licenseType && (
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              fontSize: "0.78rem",
              color: "text.secondary",
            }}>
              {licenseType}
            </Typography>
          )}
        </Box>

        {/* Price + remove */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5, flexShrink: 0 }}>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.display,
            fontWeight: 800,
            fontSize: "1.15rem",
            color: "text.primary",
          }}>
            ${parseFloat(price || 0).toFixed(2)}
          </Typography>
          <IconButton
            onClick={() => onRemove(id)}
            size="small"
            sx={{
              width: 34, height: 34,
              background: (theme) => `${theme.palette.primary.main}14`,
              border: (theme) => `1px solid ${theme.palette.primary.main}44`,
              borderRadius: "10px",
              color: "primary.main",
              transition: "all 0.25s ease",
              "&:hover": {
                background: (theme) => `${theme.palette.primary.main}24`,
                borderColor: "primary.main",
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
            onClick={() => history.push("/products")}
            sx={{
              mb: 5,
              fontFamily: (theme) => theme.custom.fonts.body,
              fontWeight: 600, fontSize: "0.875rem",
              color: "text.secondary",
              background: (theme) => theme.custom.clay.surfaceSoft,
              border: (theme) => theme.custom.clay.border,
              borderRadius: "100px",
              px: 2.5, py: 1,
              boxShadow: (theme) => theme.custom.clay.raisedSmall,
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

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 6 }}>
            <Box sx={{ width: 4, height: 36, borderRadius: "2px", bgcolor: "primary.main", boxShadow: (theme) => `0 2px 14px ${theme.palette.primary.main}80` }} />
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.display,
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "text.primary", lineHeight: 1.1,
            }}>
              Your Cart
            </Typography>
            {cartItems.length > 0 && (
              <Box sx={{
                ml: 0.5,
                px: 1.5, py: 0.4,
                background: (theme) => `${theme.palette.primary.main}22`,
                border: (theme) => `1px solid ${theme.palette.primary.main}55`,
                borderRadius: "100px",
              }}>
                <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.body, fontSize: "0.8rem", fontWeight: 700, color: "primary.main" }}>
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
                background: (theme) => `${theme.palette.primary.main}14`,
                border: (theme) => `1px solid ${theme.palette.primary.main}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShoppingCartIcon sx={{ fontSize: 32, color: "primary.main" }} />
              </Box>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.display,
                fontWeight: 700, fontSize: "1.3rem",
                color: "text.primary", mb: 1,
              }}>
                Your cart is empty
              </Typography>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.body,
                color: "text.secondary", fontSize: "0.9rem", mb: 4,
              }}>
                Browse the collection and add something you love.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => history.push("/products")}
                sx={{
                  borderColor: (theme) => `${theme.palette.primary.main}66`, color: "primary.main",
                  borderRadius: "100px", px: 3, py: 1,
                  "&:hover": { borderColor: "primary.main", bgcolor: (theme) => `${theme.palette.primary.main}14` },
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
                <Box sx={{ height: "1px", background: (theme) => theme.palette.divider, mb: 3 }} />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                  <Box>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.body,
                      color: "text.secondary",
                      fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "2px", mb: 0.5,
                    }}>
                      Total
                    </Typography>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.display,
                      fontWeight: 800,
                      fontSize: { xs: "2rem", md: "2.6rem" },
                      color: "text.primary", lineHeight: 1,
                    }}>
                      ${totalPrice}
                    </Typography>
                  </Box>
                  <LiquidOrb size={52} color="var(--clay-coral)" />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleCheckout}
                  sx={{
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

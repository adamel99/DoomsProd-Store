import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleProductThunk,
  deleteProductThunk,
} from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import {
  Box,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// ─── Glass Panel ──────────────────────────────────────────────────────────────
const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(36px)",
      WebkitBackdropFilter: "blur(36px)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderTop: "1px solid rgba(255,255,255,0.13)",
      borderLeft: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "28px",
      boxShadow: [
        "0 1px 0 rgba(255,255,255,0.06) inset",
        "0 32px 80px rgba(0,0,0,0.65)",
        "0 2px 4px rgba(0,0,0,0.45)",
      ].join(", "),
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Neumorphic inset surface ─────────────────────────────────────────────────
const NeumorphInset = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      background: "linear-gradient(145deg, #0e0b0d, #181118)",
      borderRadius: "16px",
      boxShadow: [
        "inset 4px 4px 10px rgba(0,0,0,0.7)",
        "inset -2px -2px 6px rgba(255,255,255,0.025)",
      ].join(", "),
      border: "1px solid rgba(255,255,255,0.04)",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Accent rule ──────────────────────────────────────────────────────────────
const AccentRule = ({ width = 40, sx = {} }) => (
  <Box sx={{
    width,
    height: "2px",
    background: "linear-gradient(90deg, #E43F6F, transparent)",
    borderRadius: "2px",
    boxShadow: "0 0 8px rgba(228,63,111,0.45)",
    ...sx,
  }} />
);

// ─── Waveform bars ────────────────────────────────────────────────────────────
const WaveformBars = ({ count = 5 }) => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
    {[...Array(count)].map((_, i) => (
      <Box key={i} sx={{
        width: 3, borderRadius: "2px",
        bgcolor: "#E43F6F",
        animation: `waveBar 0.8s ease-in-out ${i * 0.1}s infinite`,
        "@keyframes waveBar": {
          "0%,100%": { height: "6px", opacity: 0.5 },
          "50%": { height: "20px", opacity: 1 },
        },
      }} />
    ))}
  </Box>
);

// ─── Speaker icon ─────────────────────────────────────────────────────────────
const SpeakerIcon = ({ opacity = 0.6 }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={`rgba(255,234,236,${opacity})`}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

// ─── ProductCard ──────────────────────────────────────────────────────────────
const ProductCard = ({ customProduct }) => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const history = useHistory();

  const isStandalone = !!productId;
  const product = useSelector((state) => state.products.singleProduct);
  const currentUser = useSelector((state) => state.session.user);
  const licenses = useSelector((state) => Object.values(state.licenses.licenses || {}));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [addCartError, setAddCartError] = useState(null);
  const [addCartSuccess, setAddCartSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isStandalone) dispatch(getSingleProductThunk(productId));
    setIsVisible(true);
  }, [dispatch, productId, isStandalone]);

  useEffect(() => {
    const dp = isStandalone ? product : customProduct;
    if (dp?.type === "beat") dispatch(getAllLicensesThunk());
  }, [dispatch, product, customProduct, isStandalone]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5;
  }, []);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const displayedProduct = isStandalone ? product : customProduct;

  if (isStandalone && !product) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ color: "rgba(255,234,236,0.4)" }}>Loading...</Typography>
      </Box>
    );
  }
  if (!displayedProduct) return null;

  const { title, price, description, imageUrl, audioPreviewUrl, id, type } = displayedProduct;
  const audioUrl = audioPreviewUrl || "";

  const isAdmin = currentUser?.role === "admin";

  const handleClick = () => { if (!isStandalone) history.push(`/products/${id}`); };
  const handleUpdate = () => history.push(`/products/${id}/edit`);
  const handleDelete = () => setDeleteDialogOpen(true);
  const cancelDelete = () => setDeleteDialogOpen(false);
  const confirmDelete = async () => {
    await dispatch(deleteProductThunk(id));
    setDeleteDialogOpen(false);
    history.push("/products");
  };

  const handleAddToCart = async () => {
    setAddCartError(null);
    setAddCartSuccess(false);
    if (type === "beat" && !selectedLicenseId) {
      setAddCartError("Please select a license first.");
      return;
    }
    setAddCartLoading(true);
    try {
      await dispatch(addToCartThunk(id, selectedLicenseId || null));
      setAddCartSuccess(true);
      setTimeout(() => setAddCartSuccess(false), 3000);
    } catch {
      setAddCartError("Failed to add to cart. Please try again.");
    } finally {
      setAddCartLoading(false);
    }
  };

  const toggleAudio = async (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play product preview:", err);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Box sx={{
        py: isStandalone ? 6 : 0,
        minHeight: isStandalone ? "100vh" : "auto",
        display: "flex",
        alignItems: isStandalone ? "center" : "stretch",
        justifyContent: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 28 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: isStandalone ? "450px" : "100%" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box
            onClick={handleClick}
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 350, md: isStandalone ? 450 : 400 },
              margin: isStandalone ? "auto" : "0",
              borderRadius: "24px",
              overflow: "hidden",
              cursor: !isStandalone ? "pointer" : "default",
              background: "linear-gradient(160deg, #1c1419, #120e12)",
              border: "1px solid rgba(255,255,255,0.065)",
              borderTop: "1px solid rgba(255,255,255,0.11)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: [
                "8px 8px 28px rgba(0,0,0,0.72)",
                "-4px -4px 12px rgba(255,255,255,0.022)",
                "0 1px 0 rgba(255,255,255,0.07) inset",
              ].join(", "),
              position: "relative",
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              "&:hover": !isStandalone ? {
                transform: "translateY(-8px)",
                borderColor: "rgba(228,63,111,0.2)",
                boxShadow: [
                  "10px 18px 40px rgba(0,0,0,0.78)",
                  "-3px -3px 10px rgba(255,255,255,0.02)",
                  "0 8px 32px rgba(228,63,111,0.12)",
                ].join(", "),
              } : {},
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0, left: "15%", right: "15%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.4s ease",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, transparent 10%, rgba(228,63,111,0.65) 50%, transparent 90%)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.35s ease",
                borderRadius: "24px 24px 0 0",
              },
            }}
          >
            {/* ── Image zone ────────────────────────────────────────────── */}
            <Box sx={{
              position: "relative",
              width: "100%",
              paddingTop: isStandalone ? "100%" : "75%",
              overflow: "hidden",
              background: "#0a080a",
            }}>
              {/* Type badge */}
              <Box sx={{
                position: "absolute", top: 14, left: 14, zIndex: 3,
                display: "flex", alignItems: "center", gap: 0.8,
                background: "rgba(14,11,13,0.65)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "100px",
                px: 1.5, py: 0.6,
                boxShadow: [
                  "3px 3px 10px rgba(0,0,0,0.55)",
                  "inset 0 1px 0 rgba(255,255,255,0.08)",
                ].join(", "),
              }}>
                <Box sx={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#E43F6F",
                  boxShadow: "0 0 6px rgba(228,63,111,0.9)",
                  flexShrink: 0,
                }} />
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`,
                  fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "1.5px", color: "rgba(255,234,236,0.8)",
                  textTransform: "uppercase",
                }}>
                  {type || "Product"}
                </Typography>
              </Box>

              {/* Cover image */}
              <Box
                component="img"
                src={imageUrl || "/placeholder.jpg"}
                alt={title}
                sx={{
                  position: "absolute", top: 0, left: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
                  transform: isHovered ? "scale(1.06)" : "scale(1)",
                }}
              />

              {/* Gradient overlay */}
              <Box sx={{
                position: "absolute", inset: 0,
                background: [
                  "linear-gradient(to top, rgba(14,11,13,0.92) 0%, rgba(14,11,13,0.35) 45%, transparent 100%)",
                  "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 40%)",
                ].join(", "),
                pointerEvents: "none",
              }} />

              {audioUrl && (
                <>
                  {/* ── Zone 1: Play button — dead center ── */}
                  <Box sx={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}>
                    <IconButton
                      onClick={toggleAudio}
                      sx={{
                        width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 },
                        background: "rgba(14,11,13,0.6)",
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderTop: "1px solid rgba(255,255,255,0.26)",
                        color: "#FFEAEC",
                        boxShadow: [
                          "6px 6px 18px rgba(0,0,0,0.65)",
                          "-2px -2px 8px rgba(255,255,255,0.04)",
                          "inset 0 1px 0 rgba(255,255,255,0.15)",
                        ].join(", "),
                        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                        "&:hover": {
                          background: "rgba(228,63,111,0.22)",
                          borderColor: "rgba(228,63,111,0.45)",
                          transform: "scale(1.1)",
                          boxShadow: [
                            "6px 8px 22px rgba(0,0,0,0.65)",
                            "0 0 20px rgba(228,63,111,0.2)",
                            "inset 0 1px 0 rgba(228,63,111,0.2)",
                          ].join(", "),
                        },
                      }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying
                        ? <PauseIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
                        : <PlayArrowIcon sx={{ fontSize: { xs: 26, sm: 30 }, ml: 0.5 }} />
                      }
                    </IconButton>
                  </Box>

                  {/* ── Zone 2: Volume — bottom-left pill, expands on hover ── */}
                  <Box
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: "absolute",
                      bottom: 12, left: 12,
                      zIndex: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: "rgba(14,11,13,0.75)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderTop: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: "100px",
                      px: 1.25, py: 0.75,
                      boxShadow: "4px 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      minWidth: 32,
                      transition: "width 0.25s ease",
                      width: showVolume ? 130 : 32,
                    }}
                  >
                    {/* Speaker icon — always visible */}
                    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", lineHeight: 0 }}>
                      <SpeakerIcon opacity={showVolume ? 0.9 : 0.55} />
                    </Box>

                    {/* Slider + readout — slides in on hover */}
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      opacity: showVolume ? 1 : 0,
                      width: showVolume ? 86 : 0,
                      overflow: "hidden",
                      transition: "opacity 0.2s ease, width 0.25s ease",
                      flexShrink: 0,
                    }}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: 58,
                          cursor: "pointer",
                          accentColor: "#E43F6F",
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{
                        fontSize: "0.52rem",
                        color: "rgba(255,234,236,0.45)",
                        fontFamily: "monospace",
                        minWidth: 20,
                        lineHeight: 1,
                        flexShrink: 0,
                      }}>
                        {Math.round(volume * 100)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ── Zone 3: Waveform — bottom-right, playing only ── */}
                  {isPlaying && (
                    <Box sx={{
                      position: "absolute",
                      bottom: 14, right: 14,
                      zIndex: 2,
                    }}>
                      <WaveformBars count={5} />
                    </Box>
                  )}

                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    preload="metadata"
                  />
                </>
              )}
            </Box>

            {/* ── Content ───────────────────────────────────────────────── */}
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>
              <Typography sx={{
                fontFamily: `"Syne", sans-serif`,
                fontWeight: 700,
                fontSize: { xs: "1.15rem", sm: "1.25rem", md: "1.4rem" },
                color: "#FFEAEC", lineHeight: 1.25, mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {title}
              </Typography>

              <AccentRule width={28} sx={{ mb: 2, opacity: 0.7 }} />

              {description && (
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`,
                  color: "rgba(255,234,236,0.38)",
                  fontSize: "0.875rem", mb: 2.5, lineHeight: 1.65,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {description}
                </Typography>
              )}

              <NeumorphInset sx={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 0.5,
                px: 2, py: 0.75,
                borderRadius: "12px",
                mb: 2.5,
                alignSelf: "flex-start",
              }}>
                <Typography sx={{
                  fontFamily: `"Syne", sans-serif`,
                  fontWeight: 800,
                  fontSize: { xs: "1.4rem", sm: "1.6rem" },
                  color: "#FFEAEC",
                  lineHeight: 1,
                }}>
                  ${price}
                </Typography>
              </NeumorphInset>

              {type === "beat" && licenses.length > 0 && (
                <FormControl fullWidth size="small" sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    background: "linear-gradient(145deg, #0e0b0d, #161014)",
                    backdropFilter: "blur(10px)",
                    color: "#FFEAEC",
                    boxShadow: [
                      "inset 3px 3px 8px rgba(0,0,0,0.65)",
                      "inset -1px -1px 4px rgba(255,255,255,0.02)",
                    ].join(", "),
                    "& fieldset": { borderColor: "rgba(255,255,255,0.05)" },
                    "&:hover fieldset": { borderColor: "rgba(228,63,111,0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(228,63,111,0.5)" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255,234,236,0.35)", fontSize: "0.875rem" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E43F6F" },
                }}>
                  <InputLabel>Select License</InputLabel>
                  <Select
                    value={selectedLicenseId}
                    label="Select License"
                    onChange={(e) => setSelectedLicenseId(e.target.value)}
                    sx={{ color: "#FFEAEC" }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          background: "rgba(20,14,18,0.97)",
                          backdropFilter: "blur(32px)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderTop: "1px solid rgba(255,255,255,0.13)",
                          borderRadius: "16px",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                          "& .MuiMenuItem-root": {
                            color: "rgba(255,234,236,0.65)",
                            fontSize: "0.9rem",
                            "&:hover": { background: "rgba(228,63,111,0.1)", color: "#FFEAEC" },
                            "&.Mui-selected": { background: "rgba(228,63,111,0.15)", color: "#FFEAEC" },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value=""><em style={{ color: "rgba(255,234,236,0.25)" }}>Choose a license</em></MenuItem>
                    {licenses.map((license) => (
                      <MenuItem key={license.id} value={license.id}>
                        {license.name} — ${license.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <AnimatePresence>
                {addCartError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <Box sx={{
                      mb: 1.5, px: 2, py: 1.2,
                      background: "rgba(228,63,111,0.07)",
                      border: "1px solid rgba(228,63,111,0.22)",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.4)",
                    }}>
                      <Typography sx={{ color: "#E43F6F", fontSize: "0.82rem", fontFamily: `"DM Sans", sans-serif` }}>
                        {addCartError}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
                {addCartSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                  >
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: 1,
                      mb: 1.5, px: 2, py: 1.2,
                      background: "rgba(76,175,80,0.07)",
                      border: "1px solid rgba(76,175,80,0.22)",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.4)",
                    }}>
                      <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                      <Typography sx={{ color: "success.main", fontSize: "0.85rem", fontWeight: 600 }}>
                        Added to cart!
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={addCartLoading}
                fullWidth
                startIcon={!addCartLoading && <ShoppingCartIcon sx={{ fontSize: "1rem" }} />}
                sx={{
                  mt: 0.5, py: 1.4,
                  fontWeight: 700, fontSize: "0.95rem",
                  borderRadius: "14px",
                  background: addCartSuccess
                    ? "rgba(76,175,80,0.85)"
                    : "linear-gradient(145deg, #e84a77, #c02d5a)",
                  boxShadow: addCartSuccess
                    ? "4px 4px 14px rgba(76,175,80,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                    : "4px 4px 14px rgba(228,63,111,0.35), -2px -2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover:not(:disabled)": {
                    background: "linear-gradient(145deg, #f05585, #d63665)",
                    boxShadow: "5px 6px 18px rgba(228,63,111,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                    transform: "translateY(-2px)",
                  },
                  "&:active:not(:disabled)": {
                    transform: "translateY(1px)",
                    boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.4)",
                  },
                  "&:disabled": {
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,234,236,0.3)",
                    boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.4)",
                  },
                }}
              >
                {addCartLoading ? "Adding..." : addCartSuccess ? "Added!" : "Add to Cart"}
              </Button>

              {isAdmin && isStandalone && (
                <Box sx={{
                  display: "flex", gap: 1.5, mt: 2.5, pt: 2.5,
                  borderTop: "1px solid rgba(255,255,255,0.055)",
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: "0.95rem" }} />}
                    onClick={handleUpdate}
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,234,236,0.5)",
                      background: "linear-gradient(145deg, #161014, #1c1419)",
                      boxShadow: [
                        "3px 3px 8px rgba(0,0,0,0.5)",
                        "-1px -1px 4px rgba(255,255,255,0.018)",
                        "inset 0 1px 0 rgba(255,255,255,0.04)",
                      ].join(", "),
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.18)",
                        color: "#FFEAEC",
                        background: "rgba(255,255,255,0.04)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon sx={{ fontSize: "0.95rem" }} />}
                    onClick={handleDelete}
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      borderColor: "rgba(228,63,111,0.22)",
                      color: "rgba(228,63,111,0.7)",
                      background: "linear-gradient(145deg, #161014, #1c1419)",
                      boxShadow: [
                        "3px 3px 8px rgba(0,0,0,0.5)",
                        "-1px -1px 4px rgba(255,255,255,0.018)",
                        "inset 0 1px 0 rgba(255,255,255,0.04)",
                      ].join(", "),
                      "&:hover": {
                        borderColor: "rgba(228,63,111,0.5)",
                        color: "#E43F6F",
                        background: "rgba(228,63,111,0.07)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </CardContent>
          </Box>
        </motion.div>
      </Box>

      {/* ── Delete Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            background: "rgba(14,11,13,0.95)",
            backdropFilter: "blur(52px)",
            WebkitBackdropFilter: "blur(52px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderTop: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "28px",
            boxShadow: [
              "0 48px 100px rgba(0,0,0,0.82)",
              "10px 10px 28px rgba(0,0,0,0.55)",
              "-3px -3px 12px rgba(255,255,255,0.012)",
              "inset 0 1px 0 rgba(255,255,255,0.06)",
            ].join(", "),
          },
        }}
      >
        <Box sx={{
          height: "2px",
          background: "linear-gradient(90deg, transparent 10%, rgba(228,63,111,0.5) 50%, transparent 90%)",
          borderRadius: "28px 28px 0 0",
        }} />

        <DialogTitle sx={{
          fontFamily: `"Syne", sans-serif`,
          fontWeight: 800, fontSize: "1.35rem",
          color: "#FFEAEC", pt: 3,
        }}>
          Confirm Delete
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{
            color: "rgba(255,234,236,0.45)",
            fontSize: "0.92rem",
            fontFamily: `"DM Sans", sans-serif`,
            lineHeight: 1.7,
          }}>
            Are you sure you want to delete "{title}"? This cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            sx={{
              flex: 1, borderRadius: "12px",
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,234,236,0.5)",
              background: "linear-gradient(145deg, #161014, #1c1419)",
              boxShadow: "3px 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
              "&:hover": { borderColor: "rgba(255,255,255,0.18)", color: "#FFEAEC" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            autoFocus
            sx={{
              flex: 1, borderRadius: "12px",
              background: "linear-gradient(145deg, #e84a77, #c02d5a)",
              boxShadow: "4px 4px 14px rgba(228,63,111,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              "&:hover": {
                background: "linear-gradient(145deg, #f05585, #d63665)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;

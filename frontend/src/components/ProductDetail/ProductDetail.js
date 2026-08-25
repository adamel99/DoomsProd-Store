import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import { getYouTubeEmbedUrl } from "../../utils/youtube";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// ─── Shared primitives ────────────────────────────────────────────────────────

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
      position: "absolute", bottom: "0", right: "-10vw",
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
  <Box sx={{
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
  }} {...rest}>
    {children}
  </Box>
);

const NeumorphPanel = ({ children, sx = {} }) => (
  <Box sx={{
    background: "linear-gradient(145deg, #1c1419, #130f12)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    boxShadow: [
      "6px 6px 20px rgba(0,0,0,0.7)",
      "-3px -3px 10px rgba(255,255,255,0.025)",
      "0 1px 0 rgba(255,255,255,0.07) inset",
    ].join(", "),
    ...sx,
  }}>
    {children}
  </Box>
);

const LiquidOrb = ({ size = 60, color = "rgba(228,63,111,0.7)", sx = {} }) => (
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

const WaveformBars = ({ count = 7 }) => (
  <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
    {[...Array(count)].map((_, i) => (
      <Box key={i} sx={{
        width: 4, height: 28, bgcolor: "#E43F6F", borderRadius: "2px",
        animation: `waveBar 0.8s ease-in-out ${i * 0.1}s infinite`,
        "@keyframes waveBar": {
          "0%,100%": { height: "12px", opacity: 0.6 },
          "50%": { height: "32px", opacity: 1 },
        },
      }} />
    ))}
  </Box>
);

// ─── Speaker icon SVG ─────────────────────────────────────────────────────────
const SpeakerIcon = ({ opacity = 0.6 }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={`rgba(255,234,236,${opacity})`}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

// ─── ProductDetailPage ────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { productId } = useParams();

  const product = useSelector((state) => state.products.singleProduct);
  const currentUser = useSelector((state) => state.session.user);
  const licenses = useSelector((state) => Object.values(state.licenses.licenses || {}));

  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartError, setAddCartError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    dispatch(getSingleProductThunk(productId));
    window.scrollTo(0, 0);
  }, [dispatch, productId]);

  useEffect(() => {
    if (product?.type === "beat") dispatch(getAllLicensesThunk());
  }, [dispatch, product]);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5;
  }, []);

  const handleVolumeChange = (val) => {
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0e0b0d" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LiquidOrb size={32} color="rgba(228,63,111,0.7)" sx={{
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%,100%": { opacity: 0.6, transform: "scale(1)" },
              "50%": { opacity: 1, transform: "scale(1.1)" },
            },
          }} />
          <Typography sx={{ fontFamily: `"DM Sans", sans-serif`, color: "rgba(255,234,236,0.4)", fontSize: "1rem" }}>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  const { title, description, imageUrl, youtubeLink, audioPreviewUrl, type, price, id, genre, bpm } = product;
  const audioUrl = audioPreviewUrl || "";

  const isAdmin = currentUser?.role === "admin";

  const handleLicenseChange = (e) => {
    setSelectedLicenseId(e.target.value);
    setAddCartError(null);
  };

  const handleAddToCart = async () => {
    setAddCartError(null);
    setSuccess(false);
    if (type === "beat" && !selectedLicenseId) {
      setAddCartError("Please select a license.");
      return;
    }
    try {
      await dispatch(addToCartThunk(id, selectedLicenseId || null));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setAddCartError("Something went wrong. Try again.");
    }
  };

  const toggleAudio = async () => {
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

  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeLink);

  const selectedLicense = licenses.find((l) => l.id === selectedLicenseId);
  const displayPrice = type === "beat" && selectedLicense ? selectedLicense.price : price;

  return (
    <Box sx={{
      backgroundColor: "#0e0b0d",
      pt: { xs: 5, md: 8 }, pb: { xs: 10, md: 16 },
      color: "#FFEAEC", minHeight: "100vh",
      position: "relative", overflow: "hidden",
    }}>
      <LiquidBackground />

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="lg">

          {/* ── Back button ────────────────────────────────────────────── */}
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

          <Grid container spacing={{ xs: 4, md: 6 }}>

            {/* ── LEFT: Image ───────────────────────────────────────────── */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{ position: "sticky", top: 24 }}>

                  {/* Image card */}
                  <Box sx={{
                    position: "relative",
                    borderRadius: "28px",
                    overflow: "hidden",
                    background: "linear-gradient(160deg, rgba(28,20,24,0.9), rgba(16,10,14,0.95))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTop: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: [
                      "10px 10px 30px rgba(0,0,0,0.7)",
                      "-4px -4px 14px rgba(255,255,255,0.02)",
                      "0 1px 0 rgba(255,255,255,0.07) inset",
                    ].join(", "),
                    cursor: audioUrl ? "pointer" : "default",
                    transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                    "&:hover": audioUrl ? {
                      transform: "translateY(-4px)",
                      boxShadow: [
                        "12px 14px 40px rgba(0,0,0,0.75)",
                        "0 8px 28px rgba(228,63,111,0.12)",
                      ].join(", "),
                    } : {},
                  }}
                    onClick={audioUrl ? toggleAudio : undefined}
                  >
                    {/* Type badge */}
                    <Box sx={{
                      position: "absolute", top: 16, left: 16, zIndex: 3,
                      display: "flex", alignItems: "center", gap: 0.8,
                      background: "rgba(228,63,111,0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderTop: "1px solid rgba(255,255,255,0.35)",
                      borderRadius: "100px", px: 1.8, py: 0.6,
                      boxShadow: "3px 3px 12px rgba(0,0,0,0.5)",
                    }}>
                      <MusicNoteIcon sx={{ fontSize: 14, color: "#fff" }} />
                      <Typography sx={{
                        fontFamily: `"DM Sans", sans-serif`,
                        fontSize: "0.7rem", fontWeight: 700,
                        letterSpacing: "1.5px", color: "#fff", textTransform: "uppercase",
                      }}>
                        {type || "Product"}
                      </Typography>
                    </Box>

                    <Box
                      component="img"
                      src={imageUrl || "/placeholder.jpg"}
                      alt={title}
                      onLoad={() => setImageLoaded(true)}
                      sx={{
                        width: "100%",
                        height: { xs: 320, md: 420 },
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.6s ease, opacity 0.4s ease",
                        transform: isPlaying ? "scale(1.04)" : "scale(1)",
                        opacity: imageLoaded ? 1 : 0,
                      }}
                    />

                    {/* Bottom gradient */}
                    <Box sx={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
                      pointerEvents: "none",
                    }} />

                    {audioUrl && (
                      <>
                        {/* ── Play button — centered ── */}
                        <Box sx={{
                          position: "absolute",
                          top: "50%", left: "50%",
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                        }}>
                          <AnimatePresence>
                            <motion.div
                              key="playBtn"
                              initial={{ scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <IconButton
                                onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                                sx={{
                                  width: { xs: 68, md: 80 }, height: { xs: 68, md: 80 },
                                  background: "rgba(255,255,255,0.1)",
                                  backdropFilter: "blur(24px)",
                                  WebkitBackdropFilter: "blur(24px)",
                                  border: "1px solid rgba(255,255,255,0.18)",
                                  borderTop: "1px solid rgba(255,255,255,0.32)",
                                  color: "#FFEAEC",
                                  boxShadow: [
                                    "4px 4px 16px rgba(0,0,0,0.6)",
                                    "-2px -2px 10px rgba(255,255,255,0.05)",
                                    "inset 0 1px 0 rgba(255,255,255,0.2)",
                                  ].join(", "),
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    background: "rgba(228,63,111,0.3)",
                                    borderColor: "rgba(228,63,111,0.5)",
                                    transform: "scale(1.1)",
                                  },
                                }}
                                aria-label={isPlaying ? "Pause" : "Play"}
                              >
                                {isPlaying
                                  ? <PauseIcon sx={{ fontSize: { xs: 32, md: 38 } }} />
                                  : <PlayArrowIcon sx={{ fontSize: { xs: 32, md: 38 }, ml: 0.5 }} />
                                }
                              </IconButton>
                            </motion.div>
                          </AnimatePresence>
                        </Box>

                        {/* ── Volume control — bottom-left, horizontal pill ── */}
                        <Box
                          onMouseEnter={() => setShowVolume(true)}
                          onMouseLeave={() => setShowVolume(false)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            position: "absolute",
                            bottom: 18, left: 18,
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
                            px: 1.5, py: 1,
                            boxShadow: "4px 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                            overflow: "hidden",
                            minWidth: 36,
                            transition: "width 0.3s ease",
                            width: showVolume ? 160 : 36,
                          }}
                        >
                          {/* Speaker icon — always visible */}
                          <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", lineHeight: 0 }}>
                            <SpeakerIcon opacity={showVolume ? 0.9 : 0.55} />
                          </Box>

                          {/* Slider + label — expands on hover */}
                          <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            opacity: showVolume ? 1 : 0,
                            width: showVolume ? 112 : 0,
                            overflow: "hidden",
                            transition: "opacity 0.2s ease, width 0.3s ease",
                            flexShrink: 0,
                          }}>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              style={{
                                width: 80,
                                cursor: "pointer",
                                accentColor: "#E43F6F",
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{
                              fontSize: "0.58rem",
                              color: "rgba(255,234,236,0.5)",
                              fontFamily: "monospace",
                              minWidth: 22,
                              lineHeight: 1,
                              flexShrink: 0,
                            }}>
                              {Math.round(volume * 100)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* ── Waveform — bottom-right, only when playing ── */}
                        {isPlaying && (
                          <Box sx={{
                            position: "absolute",
                            bottom: 22, right: 18,
                            zIndex: 2,
                          }}>
                            <WaveformBars />
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

                  {/* Genre / BPM chips */}
                  {(genre || bpm) && (
                    <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
                      {genre && (
                        <Box sx={{
                          px: 2, py: 0.8, borderRadius: "100px",
                          background: "rgba(255,255,255,0.04)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          boxShadow: "3px 3px 10px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.02)",
                        }}>
                          <Typography sx={{ fontFamily: `"DM Sans", sans-serif`, fontSize: "0.78rem", color: "rgba(255,234,236,0.45)", fontWeight: 600 }}>
                            Genre: {genre}
                          </Typography>
                        </Box>
                      )}
                      {bpm && (
                        <Box sx={{
                          px: 2, py: 0.8, borderRadius: "100px",
                          background: "rgba(228,63,111,0.08)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(228,63,111,0.2)",
                          boxShadow: "3px 3px 10px rgba(0,0,0,0.4)",
                        }}>
                          <Typography sx={{ fontFamily: `"DM Sans", sans-serif`, fontSize: "0.78rem", color: "#E43F6F", fontWeight: 700 }}>
                            {bpm} BPM
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Grid>

            {/* ── RIGHT: Info ───────────────────────────────────────────── */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              >
                <Box>
                  {/* Title */}
                  <Typography variant="h2" sx={{
                    fontFamily: `"Syne", sans-serif`,
                    fontWeight: 800,
                    fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem" },
                    lineHeight: 1.1, mb: 1,
                    background: "linear-gradient(180deg, #FFEAEC 0%, rgba(255,234,236,0.65) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    {title}
                  </Typography>

                  <Box sx={{
                    width: 48, height: 3, borderRadius: "2px",
                    bgcolor: "#E43F6F", mb: 3,
                    boxShadow: "0 2px 12px rgba(228,63,111,0.5)",
                  }} />

                  {/* Description */}
                  <Typography sx={{
                    fontFamily: `"DM Sans", sans-serif`,
                    color: "rgba(255,234,236,0.45)",
                    whiteSpace: "pre-line", mb: 5,
                    lineHeight: 1.8, fontSize: "1rem",
                  }}>
                    {description || "No description available."}
                  </Typography>

                  {/* License selection */}
                  {type === "beat" && licenses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.55 }}
                    >
                      <FormControl fullWidth sx={{
                        mb: 4,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          background: "rgba(255,255,255,0.04)",
                          backdropFilter: "blur(16px)",
                          color: "#FFEAEC",
                          boxShadow: [
                            "4px 4px 14px rgba(0,0,0,0.5)",
                            "-2px -2px 8px rgba(255,255,255,0.02)",
                          ].join(", "),
                          "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                          "&:hover fieldset": { borderColor: "rgba(228,63,111,0.35)" },
                          "&.Mui-focused fieldset": { borderColor: "#E43F6F", borderWidth: "1.5px" },
                        },
                        "& .MuiInputLabel-root": { color: "rgba(255,234,236,0.4)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#E43F6F" },
                      }}>
                        <InputLabel>Select License</InputLabel>
                        <Select
                          value={selectedLicenseId}
                          label="Select License"
                          onChange={handleLicenseChange}
                          sx={{ color: "#FFEAEC" }}
                        >
                          <MenuItem value=""><em>Choose a license</em></MenuItem>
                          {licenses.map((license) => (
                            <MenuItem key={license.id} value={license.id}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                <Typography>{license.name}</Typography>
                                <Typography sx={{ color: "#E43F6F", fontWeight: 700 }}>${license.price}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </motion.div>
                  )}

                  {/* Price panel */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <GlassPanel sx={{ p: 3, mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography sx={{
                            fontFamily: `"DM Sans", sans-serif`,
                            color: "rgba(255,234,236,0.35)",
                            fontSize: "0.65rem", textTransform: "uppercase",
                            letterSpacing: "2px", mb: 0.5,
                          }}>
                            {selectedLicense ? selectedLicense.name : "Price"}
                          </Typography>
                          <Typography sx={{
                            fontFamily: `"Syne", sans-serif`,
                            fontWeight: 800,
                            fontSize: { xs: "2.2rem", md: "2.8rem" },
                            color: "#FFEAEC", lineHeight: 1,
                          }}>
                            ${displayPrice}
                          </Typography>
                        </Box>
                        <LiquidOrb size={52} color="rgba(228,63,111,0.7)" />
                      </Box>
                    </GlassPanel>
                  </motion.div>

                  {/* Error / success */}
                  <AnimatePresence>
                    {addCartError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        <Box sx={{
                          mb: 2, px: 2.5, py: 1.5,
                          background: "rgba(228,63,111,0.08)",
                          border: "1px solid rgba(228,63,111,0.25)",
                          borderRadius: "14px", backdropFilter: "blur(8px)",
                        }}>
                          <Typography sx={{ color: "#E43F6F", fontSize: "0.875rem" }}>
                            {addCartError}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                      >
                        <Box sx={{
                          display: "flex", alignItems: "center", gap: 1.5,
                          mb: 2, px: 2.5, py: 1.5,
                          background: "rgba(76,175,80,0.1)",
                          border: "1px solid rgba(76,175,80,0.25)",
                          borderRadius: "14px", backdropFilter: "blur(8px)",
                        }}>
                          <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />
                          <Typography sx={{
                            color: "success.main", fontSize: "0.9rem",
                            fontWeight: 600, fontFamily: `"DM Sans", sans-serif`,
                          }}>
                            Added to cart successfully!
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add to cart */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{ mb: 3, py: 2, fontSize: "1.05rem", fontWeight: 700 }}
                  >
                    Add to Cart
                  </Button>

                  {/* Admin actions */}
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.55 }}
                    >
                      <Box sx={{
                        display: "flex", gap: 2, pt: 3, mt: 1,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<EditIcon />}
                          onClick={() => history.push(`/products/${productId}/edit`)}
                          sx={{
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "rgba(255,234,236,0.55)",
                            "&:hover": {
                              borderColor: "rgba(255,255,255,0.22)",
                              bgcolor: "rgba(255,255,255,0.04)",
                              color: "#FFEAEC",
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<DeleteIcon />}
                          onClick={async () => {
                            if (window.confirm(`Delete "${title}"?`)) {
                              await dispatch(deleteProductThunk(id));
                              history.push("/products");
                            }
                          }}
                          sx={{
                            borderColor: "rgba(228,63,111,0.3)",
                            color: "#E43F6F",
                            "&:hover": {
                              borderColor: "#E43F6F",
                              bgcolor: "rgba(228,63,111,0.08)",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* ── YouTube Section ──────────────────────────────────────────── */}
          {youtubeEmbedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ mt: { xs: 10, md: 14 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 5 }}>
                  <Box sx={{
                    width: 4, height: 32, borderRadius: "2px",
                    bgcolor: "#E43F6F",
                    boxShadow: "0 2px 12px rgba(228,63,111,0.5)",
                  }} />
                  <Typography variant="h4" sx={{
                    fontFamily: `"Syne", sans-serif`,
                    fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.1rem" },
                    color: "#FFEAEC",
                  }}>
                    YouTube Preview
                  </Typography>
                </Box>

                <NeumorphPanel>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{
                      position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden",
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    }}>
                      <iframe
                        src={youtubeEmbedUrl}
                        title="YouTube Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                      />
                    </Box>
                  </Box>
                </NeumorphPanel>
              </Box>
            </motion.div>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;

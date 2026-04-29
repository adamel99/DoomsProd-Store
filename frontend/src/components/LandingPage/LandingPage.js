import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  IconButton,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getAllProductsThunk } from "../../store/products";
import ContactModal from "../ContactInfo/ContactInfo";

const getYouTubeId = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^\s&?\/]+)/i
  );
  return match ? match[1] : null;
};

const routeMap = {
  "Browse Beats": "/products",
  "Meet the Creator": "/about",
  "Licenses & Terms": "/licenses",
};

const testimonials = [
  {
    name: "Fivio Foreign - Dribble",
    quote: "They aint never even seen no sh*t like this before",
    videoUrl: "https://www.youtube.com/watch?v=sBsax2S2G9s&list=RDsBsax2S2G9s&start_radio=1",
  },
];

const stats = [
  { label: "Premium Beats", value: "500+" },
  { label: "Happy Artists", value: "1K+" },
  { label: "Downloads", value: "10K+" },
];

// ─── Ambient Background ───────────────────────────────────────────────────────
const LiquidBackground = React.memo(() => (
  <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <Box sx={{
      position: "absolute", top: "-20vh", left: "-15vw",
      width: "55vw", height: "55vw", borderRadius: "50%",
      background: "radial-gradient(ellipse at 40% 40%, rgba(228,63,111,0.13) 0%, transparent 65%)",
      filter: "blur(80px)",
      animation: "ambientDrift1 28s ease-in-out infinite",
      "@keyframes ambientDrift1": {
        "0%,100%": { transform: "translate(0,0)" },
        "50%": { transform: "translate(3vw, 5vh)" },
      },
    }} />
    <Box sx={{
      position: "absolute", bottom: "-10vh", right: "-10vw",
      width: "45vw", height: "45vw", borderRadius: "50%",
      background: "radial-gradient(ellipse at 60% 60%, rgba(160,20,60,0.10) 0%, transparent 65%)",
      filter: "blur(100px)",
      animation: "ambientDrift2 34s ease-in-out infinite reverse",
      "@keyframes ambientDrift2": {
        "0%,100%": { transform: "translate(0,0)" },
        "50%": { transform: "translate(-4vw, -4vh)" },
      },
    }} />
    <Box sx={{
      position: "absolute", inset: 0, opacity: 0.022,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px 128px",
    }} />
  </Box>
));

// ─── Glass Panel ──────────────────────────────────────────────────────────────
const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box sx={{
    background: "rgba(255,255,255,0.025)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderTop: "1px solid rgba(255,255,255,0.13)",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    boxShadow: [
      "0 1px 0 rgba(255,255,255,0.06) inset",
      "0 32px 80px rgba(0,0,0,0.6)",
      "0 2px 4px rgba(0,0,0,0.4)",
    ].join(", "),
    ...sx,
  }} {...rest}>
    {children}
  </Box>
);

// ─── Neumorphic Card ──────────────────────────────────────────────────────────
const NeumorphCard = ({ children, sx = {}, onClick }) => (
  <Box onClick={onClick} sx={{
    background: "linear-gradient(145deg, #1c1419, #130f12)",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.055)",
    boxShadow: [
      "8px 8px 24px rgba(0,0,0,0.75)",
      "-4px -4px 12px rgba(255,255,255,0.022)",
      "0 1px 0 rgba(255,255,255,0.06) inset",
    ].join(", "),
    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    cursor: onClick ? "pointer" : "default",
    "&:hover": onClick ? {
      transform: "translateY(-6px)",
      boxShadow: [
        "10px 14px 36px rgba(0,0,0,0.8)",
        "-3px -3px 10px rgba(255,255,255,0.02)",
        "0 1px 0 rgba(255,255,255,0.08) inset",
        "0 4px 28px rgba(228,63,111,0.10)",
      ].join(", "),
      borderColor: "rgba(228,63,111,0.18)",
    } : {},
    ...sx,
  }}>
    {children}
  </Box>
);

// ─── Liquid Orb ───────────────────────────────────────────────────────────────
const LiquidOrb = ({ size = 80, color = "rgba(228,63,111,0.7)", sx = {} }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
    boxShadow: [
      `0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.6)`,
      `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
      `inset ${size * 0.03}px ${size * 0.03}px ${size * 0.08}px rgba(255,255,255,0.2)`,
    ].join(", "),
    ...sx,
  }} />
);

// ─── Accent Rule ──────────────────────────────────────────────────────────────
const AccentRule = ({ width = 40, sx = {} }) => (
  <Box sx={{
    width, height: "2px",
    background: "linear-gradient(90deg, #E43F6F, transparent)",
    borderRadius: "2px",
    boxShadow: "0 0 8px rgba(228,63,111,0.5)",
    ...sx,
  }} />
);

// ─── Waveform Bars ────────────────────────────────────────────────────────────
const WaveformBars = ({ count = 5 }) => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
    {[...Array(count)].map((_, i) => (
      <Box key={i} sx={{
        width: 3, borderRadius: "2px", bgcolor: "#E43F6F",
        animation: `waveBar 0.8s ease-in-out ${i * 0.1}s infinite`,
        "@keyframes waveBar": {
          "0%,100%": { height: "5px", opacity: 0.5 },
          "50%": { height: "18px", opacity: 1 },
        },
      }} />
    ))}
  </Box>
);

// ─── Volume Speaker SVG ───────────────────────────────────────────────────────
const SpeakerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,234,236,0.6)">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(({ product, playingProductId, onToggleAudio, onCardClick }) => {
  const audioRef = useRef(null);
  const isPlaying = playingProductId === product.id;
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5;
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  }, []);

  const handleClick = useCallback(() => onCardClick(product.id), [product.id, onCardClick]);
  const handleAudioToggle = useCallback(
    (e) => onToggleAudio(e, product.id, audioRef),
    [product.id, onToggleAudio]
  );

  const audioSrc = Array.isArray(product.downloadUrls)
    ? (product.downloadUrls.find((f) => f.type === "mp3")?.url ||
       product.downloadUrls[0]?.url ||
       product.downloadUrls[0])
    : product.downloadUrls;

  return (
    <Box
      onClick={handleClick}
      sx={{
        borderRadius: "24px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: "linear-gradient(160deg, rgba(28,18,22,0.9), rgba(16,10,14,0.97))",
        border: "1px solid rgba(255,255,255,0.065)",
        borderTop: "1px solid rgba(255,255,255,0.11)",
        backdropFilter: "blur(20px)",
        boxShadow: [
          "8px 8px 28px rgba(0,0,0,0.7)",
          "-3px -3px 10px rgba(255,255,255,0.018)",
          "0 1px 0 rgba(255,255,255,0.07) inset",
        ].join(", "),
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        "&:hover": {
          transform: "translateY(-8px)",
          borderColor: "rgba(228,63,111,0.22)",
          boxShadow: [
            "10px 18px 44px rgba(0,0,0,0.75)",
            "-2px -2px 8px rgba(255,255,255,0.015)",
            "0 8px 36px rgba(228,63,111,0.12)",
          ].join(", "),
        },
      }}
    >
      {/* ── Image zone ────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
        <Box
          component="img"
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.title}
          loading="lazy"
          sx={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s ease",
            ".MuiBox-root:hover &": { transform: "scale(1.05)" },
          }}
        />

        {/* Bottom gradient */}
        <Box sx={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
          pointerEvents: "none",
        }} />

        {audioSrc && (
          <>
            {/* ── Play button — centered, nothing stacks on it ── */}
            <Box sx={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}>
              <IconButton
                onClick={handleAudioToggle}
                sx={{
                  width: 60, height: 60,
                  background: "rgba(14,11,13,0.6)",
                  backdropFilter: "blur(28px)",
                  WebkitBackdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderTop: "1px solid rgba(255,255,255,0.28)",
                  color: "#FFEAEC",
                  boxShadow: [
                    "5px 5px 16px rgba(0,0,0,0.65)",
                    "-2px -2px 8px rgba(255,255,255,0.03)",
                    "inset 0 1px 0 rgba(255,255,255,0.18)",
                  ].join(", "),
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  "&:hover": {
                    background: "rgba(228,63,111,0.28)",
                    borderColor: "rgba(228,63,111,0.5)",
                    transform: "scale(1.12)",
                    boxShadow: [
                      "5px 8px 20px rgba(0,0,0,0.65)",
                      "0 0 18px rgba(228,63,111,0.2)",
                      "inset 0 1px 0 rgba(228,63,111,0.2)",
                    ].join(", "),
                  },
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying
                  ? <PauseIcon sx={{ fontSize: 28 }} />
                  : <PlayArrowIcon sx={{ fontSize: 28, ml: 0.5 }} />
                }
              </IconButton>
            </Box>

            {/* ── Volume — bottom-left pill, expands horizontally on hover ── */}
            <Box
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
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
                px: 1.25,
                py: 0.75,
                boxShadow: "4px 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                transition: "width 0.25s ease",
                minWidth: 32,
                overflow: "hidden",
                width: showVolume ? 128 : 32,
              }}
            >
              {/* Speaker icon — always visible */}
              <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", lineHeight: 0 }}>
                <SpeakerIcon />
              </Box>

              {/* Slider + readout — reveals on hover */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                opacity: showVolume ? 1 : 0,
                width: showVolume ? 84 : 0,
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
                    width: 56,
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

            {/* ── Waveform — bottom-right, only when playing ── */}
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
              src={audioSrc}
              preload="metadata"
            />
          </>
        )}
      </Box>

      {/* ── Card footer ───────────────────────────────────────────────── */}
      <Box sx={{ p: 3 }}>
        <Typography sx={{
          fontFamily: `"Syne", sans-serif`,
          fontWeight: 700,
          fontSize: "1.05rem",
          mb: 2,
          color: "#FFEAEC",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "2.6em",
        }}>
          {product.title}
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: 1,
            fontWeight: 600,
            fontSize: "0.875rem",
            borderRadius: "100px",
            borderColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,234,236,0.5)",
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(8px)",
            boxShadow: [
              "3px 3px 10px rgba(0,0,0,0.45)",
              "-1px -1px 4px rgba(255,255,255,0.018)",
              "inset 0 1px 0 rgba(255,255,255,0.05)",
            ].join(", "),
            transition: "all 0.25s ease",
            "&:hover": {
              borderColor: "rgba(228,63,111,0.38)",
              color: "#E43F6F",
              background: "rgba(228,63,111,0.06)",
            },
          }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
}, (prev, next) =>
  prev.product.id === next.product.id &&
  prev.playingProductId === next.playingProductId
);

// ─── Interactive Feature Section ──────────────────────────────────────────────
const InteractiveFeatureSection = ({ history }) => {
  const [active, setActive] = useState("Browse Beats");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const menuItems = [
    { title: "Browse Beats", label: "SONIC CATALOG", desc: "Access the full vault of industry-standard production." },
    { title: "Meet the Creator", label: "THE ARCHITECT", desc: "Go behind the scenes of the signature sound design." },
    { title: "Licenses & Terms", label: "USAGE RIGHTS", desc: "Transparent, flexible legal framework for your hits." },
  ];

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{ position: "relative", zIndex: 2, py: { xs: 10, md: 18 }, overflow: "hidden" }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={5}>
            <Box sx={{ position: "relative" }}>
              <Typography sx={{
                fontSize: "0.65rem", letterSpacing: "5px",
                color: "rgba(228,63,111,0.6)", mb: 4, fontWeight: 800,
              }}>
                SYSTEM_NAVIGATION // 001
              </Typography>

              {menuItems.map((item) => {
                const isActive = active === item.title;
                return (
                  <Box
                    key={item.title}
                    onMouseEnter={() => setActive(item.title)}
                    onClick={() => history.push(routeMap[item.title])}
                    sx={{
                      position: "relative", mb: 4, cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      transform: isActive ? "translateX(20px)" : "translateX(0)",
                    }}
                  >
                    <Box sx={{
                      position: "absolute", left: -30, top: "50%",
                      width: isActive ? 40 : 0, height: "2px",
                      background: "linear-gradient(90deg, #E43F6F, rgba(228,63,111,0.2))",
                      transition: "width 0.4s ease",
                      boxShadow: "0 0 12px rgba(228,63,111,0.6)",
                    }} />
                    <Typography sx={{
                      fontSize: "0.7rem",
                      color: isActive ? "#E43F6F" : "rgba(255,255,255,0.28)",
                      fontWeight: 800, mb: 0.5, letterSpacing: "1px",
                    }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h4" sx={{
                      fontWeight: 900,
                      color: isActive ? "#FFEAEC" : "rgba(255,255,255,0.13)",
                      transition: "color 0.3s",
                    }}>
                      {item.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box sx={{ perspective: "1200px", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.75))" }}>
              <GlassPanel sx={{
                position: "relative", minHeight: 480,
                transition: "transform 0.1s linear",
                transform: `rotateY(${coords.x * 14}deg) rotateX(${coords.y * -14}deg)`,
                p: 6, display: "flex", flexDirection: "column",
                justifyContent: "flex-end", overflow: "hidden",
                background: "rgba(255,255,255,0.01)",
                "&::before": {
                  content: '""', position: "absolute",
                  top: 0, left: `${(coords.x + 0.5) * 100}%`,
                  width: "1px", height: "100%",
                  background: "linear-gradient(to bottom, transparent 0%, rgba(228,63,111,0.55) 50%, transparent 100%)",
                  opacity: 0.6, boxShadow: "0 0 18px rgba(228,63,111,0.4)",
                  transition: "left 0.08s linear",
                },
                "&::after": {
                  content: '""', position: "absolute", inset: 0,
                  borderRadius: "28px",
                  background: `radial-gradient(ellipse at ${50 + coords.x * 40}% ${50 + coords.y * 40}%, rgba(228,63,111,0.06) 0%, transparent 65%)`,
                  pointerEvents: "none",
                },
              }}>
                <Box sx={{ position: "absolute", top: "20%", right: "10%" }}>
                  <LiquidOrb size={160} color="rgba(228,63,111,0.2)" sx={{ filter: "blur(40px)" }} />
                </Box>
                <Box sx={{
                  position: "absolute", top: "40%", left: "50%",
                  transform: `translate(-50%, -50%) scale(${1 + coords.y * 0.1})`,
                  transition: "transform 0.2s ease-out",
                }}>
                  <LiquidOrb
                    size={240}
                    color={active === "Browse Beats" ? "rgba(228,63,111,0.8)" : "rgba(255,255,255,0.05)"}
                  />
                </Box>

                <Box sx={{ position: "relative", zIndex: 5 }}>
                  <Typography variant="h2" sx={{
                    fontSize: "4rem", fontWeight: 900, mb: 2,
                    opacity: 0.06, position: "absolute", top: -80, left: -20,
                    width: "150%", pointerEvents: "none", userSelect: "none",
                    letterSpacing: "-2px",
                  }}>
                    {active.toUpperCase()}
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
                    {active}
                  </Typography>
                  <Typography sx={{
                    color: "rgba(255,234,236,0.55)", fontSize: "1.1rem",
                    maxWidth: "80%", mb: 4, lineHeight: 1.7,
                  }}>
                    {menuItems.find((i) => i.title === active)?.desc}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => history.push(routeMap[active])}
                    sx={{
                      borderRadius: 0, py: 2, px: 6,
                      background: "#FFEAEC", color: "#0e0b0d",
                      fontWeight: 900, letterSpacing: "2px",
                      boxShadow: "4px 4px 16px rgba(0,0,0,0.5), -2px -2px 8px rgba(255,255,255,0.04)",
                      "&:hover": {
                        background: "#E43F6F", color: "#FFEAEC",
                        boxShadow: "4px 4px 24px rgba(228,63,111,0.4)",
                      },
                    }}
                  >
                    INITIALIZE SEQUENCE
                  </Button>
                </Box>

                <Box sx={{ position: "absolute", bottom: 20, right: 20, textAlign: "right", opacity: 0.3 }}>
                  <Typography sx={{ fontSize: "0.6rem", fontFamily: "monospace", lineHeight: 1.8 }}>
                    LATENCY: 12ms<br />
                    STATUS: ACTIVE<br />
                    COORD: {coords.x.toFixed(2)} / {coords.y.toFixed(2)}
                  </Typography>
                </Box>
              </GlassPanel>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────
const LandingPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [openContactModal, setOpenContactModal] = useState(false);
  const [playingProductId, setPlayingProductId] = useState(null);
  const audioRefs = useRef({});

  const products = useSelector((state) =>
    Object.values(state.products.allProducts || {})
  );

  useEffect(() => { dispatch(getAllProductsThunk()); }, [dispatch]);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }, [searchTerm, history]);

  const toggleAudio = useCallback((e, productId, audioRef) => {
    e.stopPropagation();
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio && audio !== currentAudio && !audio.paused) audio.pause();
    });

    if (currentAudio.paused) {
      currentAudio.play();
      setPlayingProductId(productId);
    } else {
      currentAudio.pause();
      setPlayingProductId(null);
    }
    audioRefs.current[productId] = currentAudio;
  }, []);

  const handleCardClick = useCallback((id) => history.push(`/products/${id}`), [history]);
  const handleContactOpen = useCallback(() => setOpenContactModal(true), []);
  const handleContactClose = useCallback(() => setOpenContactModal(false), []);

  const latestProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [products]
  );

  return (
    <Box sx={{
      position: "relative", minHeight: "100vh",
      backgroundColor: "#0e0b0d", color: "#FFEAEC", overflowX: "hidden",
    }}>
      <LiquidBackground />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, pt: { xs: 10, md: 14 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          {/* Status pill */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
            <GlassPanel sx={{
              px: 3, py: 1, borderRadius: "100px",
              display: "inline-flex", alignItems: "center", gap: 2,
            }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#E43F6F",
                boxShadow: "0 0 8px rgba(228,63,111,0.9), 0 0 20px rgba(228,63,111,0.4)",
                flexShrink: 0,
              }} />
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                fontSize: "0.8rem", fontWeight: 600,
                letterSpacing: "2px", textTransform: "uppercase",
                color: "rgba(255,234,236,0.6)",
              }}>
                Industry Standard Production
              </Typography>
            </GlassPanel>
          </Box>

          {/* Hero title */}
          <Box sx={{ textAlign: "center", mb: 6, position: "relative" }}>
            <LiquidOrb size={64} color="rgba(228,63,111,0.6)" sx={{
              position: "absolute", left: { xs: "2%", md: "8%" }, top: "10%",
              display: { xs: "none", sm: "block" },
              animation: "orbBob 6s ease-in-out infinite",
              "@keyframes orbBob": {
                "0%,100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(-10px)" },
              },
            }} />
            <LiquidOrb size={40} color="rgba(150,20,55,0.7)" sx={{
              position: "absolute", right: { xs: "2%", md: "10%" }, top: "0%",
              display: { xs: "none", sm: "block" },
              animation: "orbBob 8s ease-in-out infinite reverse",
            }} />
            <LiquidOrb size={28} color="rgba(228,63,111,0.5)" sx={{
              position: "absolute", right: { xs: "5%", md: "7%" }, bottom: "10%",
              display: { xs: "none", md: "block" },
              animation: "orbBob 5s ease-in-out infinite",
            }} />

            <Typography variant="h1" sx={{
              fontSize: { xs: "3.2rem", sm: "5rem", md: "7rem", lg: "8rem" },
              background: "linear-gradient(180deg, #FFEAEC 0%, rgba(255,234,236,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              mb: 0, mx: "auto", letterSpacing: "-0.02em",
            }}>
              welcome
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
              <AccentRule width={60} />
            </Box>

            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`,
              fontSize: { xs: "1.05rem", md: "1.3rem" },
              color: "rgba(255,234,236,0.4)",
              letterSpacing: "0.5px", mt: 2,
            }}>
              Industry-ready beats · Instant downloads · Elevate your sound
            </Typography>
          </Box>

          {/* Stats */}
          <GlassPanel sx={{
            display: "flex", justifyContent: "center",
            gap: { xs: 4, md: 8 }, py: 3, px: 4, mb: 5,
            mx: "auto", maxWidth: 560, flexWrap: "wrap",
          }}>
            {stats.map((stat, i) => (
              <Box key={i} sx={{ textAlign: "center", position: "relative" }}>
                {i > 0 && (
                  <Box sx={{
                    position: "absolute", left: { xs: -16, md: -32 }, top: "10%",
                    width: "1px", height: "80%",
                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)",
                  }} />
                )}
                <Typography sx={{
                  fontFamily: `"Syne", sans-serif`, fontWeight: 800,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  color: "#E43F6F", lineHeight: 1,
                }}>
                  {stat.value}
                </Typography>
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`, fontSize: "0.75rem",
                  color: "rgba(255,234,236,0.35)",
                  letterSpacing: "1.5px", textTransform: "uppercase", mt: 0.5,
                }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </GlassPanel>

          {/* Search bar */}
          <Box
            component="form"
            onSubmit={onSearchSubmit}
            sx={{
              display: "flex", mx: "auto", maxWidth: 600, mb: 5,
              background: "rgba(255,255,255,0.025)",
              backdropFilter: "blur(28px)",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "1px solid rgba(255,255,255,0.13)",
              overflow: "hidden",
              boxShadow: [
                "6px 6px 24px rgba(0,0,0,0.6)",
                "-2px -2px 8px rgba(255,255,255,0.018)",
                "inset 0 1px 0 rgba(255,255,255,0.06)",
              ].join(", "),
              transition: "box-shadow 0.25s ease, border-color 0.25s ease",
              "&:focus-within": {
                borderColor: "rgba(228,63,111,0.35)",
                boxShadow: [
                  "6px 6px 24px rgba(0,0,0,0.6)",
                  "0 0 0 2px rgba(228,63,111,0.12)",
                  "inset 0 1px 0 rgba(255,255,255,0.06)",
                ].join(", "),
              },
            }}
          >
            <InputBase
              placeholder="Search beats, kits, loops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{
                px: 3, py: 1.5, fontSize: "1rem", color: "#FFEAEC",
                "& input::placeholder": { color: "rgba(255,234,236,0.25)" },
              }}
            />
            <IconButton
              type="submit"
              sx={{
                m: 0.75, width: 44, height: 44, borderRadius: "100px",
                bgcolor: "#E43F6F", color: "#FFEAEC",
                boxShadow: [
                  "0 4px 18px rgba(228,63,111,0.45)",
                  "inset 0 1px 0 rgba(255,255,255,0.18)",
                  "3px 3px 10px rgba(0,0,0,0.4)",
                ].join(", "),
                flexShrink: 0,
                "&:hover": { bgcolor: "#c02d5a" },
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* CTAs */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained" size="large"
              onClick={handleContactOpen}
              sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
            >
              Contact Me
            </Button>
            <Button
              variant="outlined" size="large"
              href="https://www.youtube.com/@DoomsProduction"
              target="_blank"
              sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
            >
              YouTube
            </Button>
            <Button
              variant="text" size="large"
              onClick={() => history.push("/products")}
              sx={{
                px: 4, py: 1.5, fontSize: "1rem",
                color: "rgba(255,234,236,0.35)",
                "&:hover": { color: "#E43F6F", bgcolor: "transparent" },
              }}
            >
              Explore Beats →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── LATEST RELEASES ──────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", mb: 6,
            flexWrap: "wrap", gap: 2, pb: 4,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <Box>
              <AccentRule width={32} sx={{ mb: 2 }} />
              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`, fontSize: "0.7rem",
                fontWeight: 600, letterSpacing: "3px",
                textTransform: "uppercase", color: "#E43F6F", mb: 1,
              }}>
                Fresh Out
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, lineHeight: 1 }}>
                Latest Releases
              </Typography>
            </Box>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => history.push("/products")}
              sx={{ color: "rgba(255,234,236,0.35)", "&:hover": { color: "#E43F6F", bgcolor: "transparent" } }}
            >
              View all
            </Button>
          </Box>

          <Grid container spacing={3}>
            {latestProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard
                  product={product}
                  playingProductId={playingProductId}
                  onToggleAudio={toggleAudio}
                  onCardClick={handleCardClick}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FEATURE SECTION ──────────────────────────────────────────────── */}
      <InteractiveFeatureSection history={history} />

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 7 }}>
            <AccentRule width={32} sx={{ mx: "auto", mb: 3 }} />
            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`, fontSize: "0.7rem",
              fontWeight: 600, letterSpacing: "3px",
              textTransform: "uppercase", color: "#E43F6F", mb: 1.5,
            }}>
              Trusted By
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
              Heard Worldwide
            </Typography>
          </Box>

          {testimonials.map(({ name, quote, videoUrl }, i) => (
            <NeumorphCard key={i} sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "flex-start" }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: "14px",
                  background: "linear-gradient(145deg, rgba(228,63,111,0.15), rgba(228,63,111,0.05))",
                  border: "1px solid rgba(228,63,111,0.2)",
                  borderTop: "1px solid rgba(228,63,111,0.35)",
                  boxShadow: [
                    "4px 4px 12px rgba(0,0,0,0.5)",
                    "-2px -2px 8px rgba(255,255,255,0.02)",
                    "inset 0 1px 0 rgba(228,63,111,0.15)",
                  ].join(", "),
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, mt: 0.5,
                }}>
                  <Typography sx={{
                    fontSize: "1.2rem", color: "#E43F6F",
                    fontFamily: `"Syne", sans-serif`,
                    fontWeight: 900, lineHeight: 1,
                  }}>
                    "
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: `"Syne", sans-serif`, fontWeight: 700,
                    fontSize: "1rem", color: "#E43F6F", mb: 1,
                  }}>
                    {name}
                  </Typography>
                  <Typography sx={{
                    fontFamily: `"DM Sans", sans-serif`,
                    fontSize: { xs: "1.05rem", md: "1.2rem" },
                    color: "rgba(255,234,236,0.65)",
                    fontStyle: "italic", lineHeight: 1.7,
                  }}>
                    "{quote}"
                  </Typography>
                </Box>
              </Box>

              {videoUrl && (
                <Box sx={{
                  borderRadius: "20px", overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.055)",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: [
                    "8px 8px 28px rgba(0,0,0,0.7)",
                    "-2px -2px 8px rgba(255,255,255,0.012)",
                    "inset 0 1px 0 rgba(255,255,255,0.04)",
                  ].join(", "),
                }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&controls=1`}
                    title={`Video by ${name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                  />
                </Box>
              )}
            </NeumorphCard>
          ))}
        </Container>
      </Box>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 10, md: 16 } }}>
        <Container maxWidth="sm">
          <GlassPanel sx={{ p: { xs: 5, md: 7 }, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5, mb: 5 }}>
              <AccentRule width={16} sx={{ opacity: 0.4 }} />
              <AccentRule width={40} />
              <AccentRule width={16} sx={{ opacity: 0.4 }} />
            </Box>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", md: "2.6rem" }, mb: 2 }}>
              Ready to Elevate Your Sound?
            </Typography>
            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`,
              color: "rgba(255,234,236,0.4)", fontSize: "1rem", mb: 5, lineHeight: 1.8,
            }}>
              Browse premium beats and start creating your next hit today.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained" size="large"
                onClick={() => history.push("/products")}
                sx={{ px: 5, py: 1.6, fontSize: "1rem" }}
              >
                Explore Beats
              </Button>
              <Button
                variant="outlined" size="large"
                onClick={handleContactOpen}
                sx={{ px: 5, py: 1.6, fontSize: "1rem" }}
              >
                Get in Touch
              </Button>
            </Box>
          </GlassPanel>
        </Container>
      </Box>

      {openContactModal && (
        <ContactModal open={openContactModal} onClose={handleContactClose} />
      )}
    </Box>
  );
};

export default LandingPage;

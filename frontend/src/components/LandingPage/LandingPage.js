import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { getYouTubeEmbedUrl } from "../../utils/youtube";
import { useAudioPlayer } from "../../context/AudioPlayer";

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

const tickerItems = [
  "TRAP · DRILL · R&B · LOFI",
  "WAV + TRACKED STEMS",
  "UNLIMITED / EXCLUSIVE LICENSING",
  "NEW DROPS EVERY WEEK",
  "MIXED & MASTERED IN-HOUSE",
];

const LiquidBackground = React.memo(() => (
  <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <Box sx={{
      position: "absolute", inset: 0, opacity: 0.022,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px 128px",
    }} />
    <Box sx={(theme) => ({
      position: "absolute",
      inset: 0,
      background: `linear-gradient(180deg, transparent 0%, ${theme.palette.background.default} 72%)`,
    })} />
  </Box>
));

const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box sx={(theme) => ({
    position: "relative",
    background: theme.custom.clay.surfaceSoft,
    border: theme.custom.clay.border,
    borderRadius: "20px",
    boxShadow: theme.custom.clay.raised,
    "&::before": {
      content: '""',
      position: "absolute", inset: 0, borderRadius: "inherit",
      background: "linear-gradient(120deg, rgba(255,255,255,0.5) 0%, transparent 35%)",
      pointerEvents: "none",
    },
    ...sx,
  })} {...rest}>
    {children}
  </Box>
);

// ─── Neumorphic Card ──────────────────────────────────────────────────────────
const NeumorphCard = ({ children, sx = {}, onClick }) => (
  <Box onClick={onClick} sx={(theme) => ({
    background: theme.custom.clay.surfaceSoft,
    borderRadius: "28px",
    border: theme.custom.clay.border,
    boxShadow: theme.custom.clay.raised,
    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    cursor: onClick ? "pointer" : "default",
    "&:hover": onClick ? {
      transform: "translateY(-6px)",
      boxShadow: theme.custom.clay.floating,
      borderColor: `${theme.palette.primary.main}66`,
    } : {},
    ...sx,
  })}>
    {children}
  </Box>
);

const AccentRule = ({ width = 40, sx = {} }) => (
  <Box sx={(theme) => ({
    width, height: "2px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
    borderRadius: "2px",
    boxShadow: `0 0 8px ${theme.palette.primary.main}66`,
    ...sx,
  })} />
);

// ─── Waveform Bars ────────────────────────────────────────────────────────────
const WaveformBars = ({ count = 5 }) => (
  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
    {[...Array(count)].map((_, i) => (
      <Box key={i} sx={{
        width: 3, borderRadius: "2px", bgcolor: "primary.main",
        animation: `waveBar 0.8s ease-in-out ${i * 0.1}s infinite`,
        "@keyframes waveBar": {
          "0%,100%": { height: "5px", opacity: 0.5 },
          "50%": { height: "18px", opacity: 1 },
        },
      }} />
    ))}
  </Box>
);

// ─── Decorative Level Meter (studio motif, purely ambient) ──────────────────
const LevelMeter = ({ bars = 28 }) => (
  <Box sx={{
    display: "flex", alignItems: "flex-end", gap: "3px",
    height: 64, width: "100%",
  }}>
    {[...Array(bars)].map((_, i) => (
      <Box key={i} sx={{
        flex: 1, borderRadius: "2px",
        background: i % 7 === 0
          ? (theme) => `linear-gradient(to top, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
          : (theme) => `${theme.palette.text.primary}22`,
        animation: `meterBar ${1.6 + (i % 5) * 0.25}s ease-in-out ${(i % 9) * 0.09}s infinite`,
        "@keyframes meterBar": {
          "0%,100%": { height: "18%" },
          "50%": { height: `${30 + ((i * 37) % 65)}%` },
        },
      }} />
    ))}
  </Box>
);

// ─── Studio status ticker (mono, marquee) ─────────────────────────────────────
const StatusTicker = () => {
  const loop = [...tickerItems, ...tickerItems];
  return (
    <Box sx={(theme) => ({
      position: "relative", overflow: "hidden",
      borderTop: `1px solid ${theme.palette.divider}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      py: 1.5,
      "&::before, &::after": {
        content: '""', position: "absolute", top: 0, bottom: 0, width: 80, zIndex: 2,
      },
      "&::before": { left: 0, background: `linear-gradient(90deg, ${theme.palette.background.default}, transparent)` },
      "&::after": { right: 0, background: `linear-gradient(270deg, ${theme.palette.background.default}, transparent)` },
    })}>
      <Box sx={{
        display: "flex", width: "max-content", gap: 6,
        animation: "tickerScroll 32s linear infinite",
        "@keyframes tickerScroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      }}>
        {loop.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono, fontSize: "0.72rem", letterSpacing: "2px",
              color: "text.secondary", whiteSpace: "nowrap",
            }}>
              {item}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Product Card (styled as a channel strip) ─────────────────────────────────
const ProductCard = React.memo(({ product, onCardClick }) => {
  const { activeTrackId, isPlaying, toggleTrack } = useAudioPlayer();
  const isCurrentTrackPlaying = activeTrackId === product.id && isPlaying;
  const handleClick = useCallback(() => onCardClick(product.id), [product.id, onCardClick]);
  const handleAudioToggle = useCallback((e) => {
    e.stopPropagation();
    toggleTrack({
      id: product.id,
      title: product.title,
      imageUrl: product.imageUrl,
      audioPreviewUrl: product.audioPreviewUrl,
      type: product.type,
    });
  }, [product, toggleTrack]);

  const audioSrc = product.audioPreviewUrl || "";

  return (
    <Box
      onClick={handleClick}
      sx={(theme) => ({
        borderRadius: "24px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: theme.custom.clay.surfaceSoft,
        border: theme.custom.clay.border,
        boxShadow: theme.custom.clay.raised,
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        "&:hover": {
          transform: "translateY(-8px)",
          borderColor: `${theme.palette.primary.main}66`,
          boxShadow: theme.custom.clay.floating,
        },
      })}
    >
      {/* channel-strip index rail */}
      <Box sx={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 2,
        background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.main}33 60%, transparent)`,
        opacity: isCurrentTrackPlaying ? 1 : 0.45,
        transition: "opacity 0.3s ease",
      }} />

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
          background: "linear-gradient(to top, rgba(34,28,32,0.78) 0%, rgba(34,28,32,0.14) 55%, transparent 100%)",
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
                  background: (theme) => theme.custom.clay.surfaceSoft,
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",
                  border: (theme) => theme.custom.clay.border,
                  color: "primary.main",
                  boxShadow: (theme) => theme.custom.clay.raisedSmall,
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  "&:hover": {
                    background: (theme) => `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    color: "primary.contrastText",
                    transform: "scale(1.12)",
                    boxShadow: (theme) => theme.custom.clay.floating,
                  },
                }}
                aria-label={isCurrentTrackPlaying ? "Pause preview" : "Play preview"}
              >
                {isCurrentTrackPlaying
                  ? <PauseIcon sx={{ fontSize: 28 }} />
                  : <PlayArrowIcon sx={{ fontSize: 28, ml: 0.5 }} />
                }
              </IconButton>
            </Box>

            {/* ── Waveform — bottom-right, only when playing ── */}
            {isCurrentTrackPlaying && (
              <Box sx={{
                position: "absolute",
                bottom: 14, right: 14,
                zIndex: 2,
              }}>
                <WaveformBars count={5} />
              </Box>
            )}

          </>
        )}
      </Box>

      {/* ── Card footer ───────────────────────────────────────────────── */}
      <Box sx={{ p: 3 }}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 700,
          fontSize: "1.05rem",
          mb: 2,
          color: "text.primary",
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
            borderColor: (theme) => theme.palette.divider,
            color: "text.secondary",
            background: (theme) => theme.custom.clay.surfaceSoft,
            boxShadow: (theme) => theme.custom.clay.raisedSmall,
            transition: "all 0.25s ease",
            "&:hover": {
              borderColor: "primary.main",
              color: "primary.main",
              background: (theme) => theme.custom.clay.surface,
            },
          }}
        >
          View details
        </Button>
      </Box>
    </Box>
  );
}, (prev, next) =>
  prev.product.id === next.product.id
);

// ─── Interactive Feature Section ──────────────────────────────────────────────
const InteractiveFeatureSection = ({ history }) => {
  const [active, setActive] = useState("Browse Beats");

  const menuItems = [
    { title: "Browse Beats", label: "SONIC CATALOG", desc: "Access the full vault of industry-standard production.", cta: "Browse the catalog" },
    { title: "Meet the Creator", label: "THE ARCHITECT", desc: "Go behind the scenes of the signature sound design.", cta: "Meet the creator" },
    { title: "Licenses & Terms", label: "USAGE RIGHTS", desc: "Transparent, flexible legal framework for your hits.", cta: "View licensing" },
  ];
  const activeItem = menuItems.find((i) => i.title === active);

  return (
    <Box
      sx={{ position: "relative", zIndex: 2, py: { xs: 8, md: 12 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 5, maxWidth: 620 }}>
          <AccentRule width={32} sx={{ mb: 2 }} />
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.mono,
            fontSize: "0.7rem",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "primary.main",
            mb: 1,
          }}>
            Studio map
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3rem" }, lineHeight: 1.05 }}>
            Find what you need without the maze.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {menuItems.map((item) => {
                const isActive = active === item.title;
                return (
                  <Box
                    key={item.title}
                    onMouseEnter={() => setActive(item.title)}
                    onClick={() => history.push(routeMap[item.title])}
                    sx={(theme) => ({
                      p: { xs: 2.25, md: 2.75 },
                      borderRadius: "18px",
                      cursor: "pointer",
                      border: isActive ? `1px solid ${theme.palette.primary.main}55` : theme.custom.clay.hairline,
                      background: isActive ? theme.custom.clay.surfaceSoft : "rgba(241,218,191,0.24)",
                      boxShadow: isActive ? theme.custom.clay.raisedSmall : "none",
                      transition: "background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    })}
                  >
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.mono,
                      fontSize: "0.68rem",
                      color: isActive ? "primary.main" : "text.disabled",
                      fontWeight: 700,
                      mb: 0.75,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase",
                    }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h4" sx={{
                      fontSize: { xs: "1.35rem", md: "1.55rem" },
                      color: "text.primary",
                    }}>
                      {item.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <GlassPanel sx={{
              minHeight: { xs: 340, md: 430 },
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                alignItems: "flex-start",
                mb: 5,
              }}>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  fontSize: "0.68rem",
                  letterSpacing: "2px",
                  color: "text.disabled",
                  textTransform: "uppercase",
                }}>
                  Selected route
                </Typography>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  fontSize: "0.68rem",
                  letterSpacing: "2px",
                  color: "text.disabled",
                  textTransform: "uppercase",
                }}>
                  0{menuItems.findIndex((item) => item.title === active) + 1} / 03
                </Typography>
              </Box>

              <Box>
                <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "3.4rem" }, mb: 2 }}>
                  {active}
                </Typography>
                <Typography sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  maxWidth: 520,
                  mb: 4,
                  lineHeight: 1.7,
                }}>
                  {activeItem?.desc}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => history.push(routeMap[active])}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 3.5 }}
                >
                  {activeItem?.cta}
                </Button>
              </Box>

              <Box sx={{ mt: 5, opacity: 0.42 }}>
                <LevelMeter bars={24} />
              </Box>
            </GlassPanel>
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

  const products = useSelector((state) =>
    Object.values(state.products.allProducts || {})
  );

  useEffect(() => { dispatch(getAllProductsThunk()); }, [dispatch]);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }, [searchTerm, history]);

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
      backgroundColor: "background.default", color: "text.primary", overflowX: "hidden",
    }}>
      <LiquidBackground />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, pt: { xs: 10, md: 15 }, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.mono,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "primary.main",
                mb: 2,
              }}>
                Studio online / Now booking
              </Typography>

              <Typography variant="h1" sx={{
                fontSize: { xs: "4.4rem", sm: "6.5rem", md: "8.5rem" },
                lineHeight: 0.9,
                mb: 3,
                maxWidth: 760,
              }}>
                DOOMS
              </Typography>

              <Typography sx={{
                fontSize: { xs: "1.08rem", md: "1.28rem" },
                color: "text.secondary",
                maxWidth: 560,
                mb: 4,
              }}>
                Hip-hop, trap & R&B instrumentals mixed and mastered for artists ready to release.
              </Typography>

              <Box
                component="form"
                onSubmit={onSearchSubmit}
                sx={{
                  display: "flex",
                  maxWidth: 560,
                  mb: 3,
                  background: (theme) => theme.custom.clay.surfaceSoft,
                  borderRadius: "18px",
                  border: (theme) => theme.custom.clay.border,
                  overflow: "hidden",
                  boxShadow: (theme) => theme.custom.clay.pressed,
                  "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: (theme) => `${theme.custom.clay.pressed}, 0 0 0 3px ${theme.palette.primary.main}33`,
                  },
                }}
              >
                <InputBase
                  placeholder="Search beats, kits, loops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  inputProps={{ "aria-label": "Search beats, kits, and loops" }}
                  sx={{
                    px: 2.5,
                    py: 1.35,
                    fontSize: "1rem",
                    color: "text.primary",
                    "& input::placeholder": { color: "text.disabled" },
                  }}
                />
                <IconButton
                  type="submit"
                  aria-label="Search"
                  sx={{
                    m: 0.75,
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button variant="contained" size="large" onClick={handleContactOpen}>
                  Start a project
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="https://www.youtube.com/@DoomsProduction"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </Button>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => history.push("/products")}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                >
                  Browse catalog
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <GlassPanel sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  fontSize: "0.68rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "text.disabled",
                  mb: 3,
                }}>
                  Production snapshot
                </Typography>
                <Box sx={{ display: "grid", gap: 2.5 }}>
                  {stats.map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 2,
                        pb: 2,
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        "&:last-of-type": { borderBottom: 0, pb: 0 },
                      }}
                    >
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.mono,
                        color: "text.secondary",
                        fontSize: "0.76rem",
                        letterSpacing: "1.3px",
                        textTransform: "uppercase",
                      }}>
                        {stat.label}
                      </Typography>
                      <Typography sx={{
                        fontFamily: (theme) => theme.custom.fonts.display,
                        fontWeight: 800,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        lineHeight: 1,
                        color: "text.primary",
                      }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </GlassPanel>
            </Grid>
          </Grid>

          <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <StatusTicker />
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
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}>
            <Box>
              <AccentRule width={32} sx={{ mb: 2 }} />
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.mono, fontSize: "0.7rem",
                fontWeight: 500, letterSpacing: "3px",
                textTransform: "uppercase", color: "primary.main", mb: 1,
              }}>
                Fresh out the booth
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, lineHeight: 1 }}>
                Latest Releases
              </Typography>
            </Box>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => history.push("/products")}
              sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "transparent" } }}
            >
              View all
            </Button>
          </Box>

          {latestProducts.length > 0 ? (
            <Grid container spacing={3}>
              {latestProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard
                    product={product}
                    onCardClick={handleCardClick}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <GlassPanel sx={{ py: 8, px: 4, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary" }}>
                New beats are on the way — check back soon.
              </Typography>
            </GlassPanel>
          )}
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
              fontFamily: (theme) => theme.custom.fonts.mono, fontSize: "0.7rem",
              fontWeight: 500, letterSpacing: "3px",
              textTransform: "uppercase", color: "primary.main", mb: 1.5,
            }}>
              Trusted by
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
                  background: (theme) => theme.custom.clay.surface,
                  border: (theme) => theme.custom.clay.border,
                  boxShadow: (theme) => theme.custom.clay.raisedSmall,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, mt: 0.5,
                }}>
                  <Typography sx={{
                    fontSize: "1.2rem", color: "primary.main",
                    fontFamily: (theme) => theme.custom.fonts.display,
                    fontWeight: 900, lineHeight: 1,
                  }}>
                    "
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.display, fontWeight: 700,
                    fontSize: "1rem", color: "primary.main", mb: 1,
                  }}>
                    {name}
                  </Typography>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.body,
                    fontSize: { xs: "1.05rem", md: "1.2rem" },
                    color: "text.secondary",
                    fontStyle: "italic", lineHeight: 1.7,
                  }}>
                    "{quote}"
                  </Typography>
                </Box>
              </Box>

              {getYouTubeEmbedUrl(videoUrl) && (
                <Box sx={{
                  borderRadius: "20px", overflow: "hidden",
                  border: (theme) => theme.custom.clay.border,
                  boxShadow: (theme) => theme.custom.clay.raised,
                }}>
                  <iframe
                    src={`${getYouTubeEmbedUrl(videoUrl)}?rel=0&controls=1`}
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
          <GlassPanel sx={{ p: { xs: 5, md: 7 }, textAlign: "center", overflow: "hidden" }}>
            <Box sx={{ opacity: 0.5, mb: 4 }}>
              <LevelMeter bars={32} />
            </Box>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", md: "2.6rem" }, mb: 2 }}>
              Ready to Elevate Your Sound?
            </Typography>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              color: "text.secondary", fontSize: "1rem", mb: 5, lineHeight: 1.8,
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

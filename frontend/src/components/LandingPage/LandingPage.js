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

const flatPinkButtonSx = {
  background: (theme) => theme.custom.clay.surfacePink,
  backgroundImage: (theme) => theme.custom.clay.surfacePink,
  borderColor: (theme) => theme.custom.transparent(theme.custom.colors.pink, 0.5),
  color: "primary.contrastText",
  boxShadow: (theme) => theme.custom.clay.raisedSmall,
  "&:hover": {
    background: (theme) => theme.custom.gradients.brandHover,
    backgroundImage: (theme) => theme.custom.gradients.brandHover,
    borderColor: (theme) => theme.custom.transparent(theme.custom.colors.coralDark, 0.55),
  },
};

const mobileFullButtonSx = {
  width: { xs: "100%", sm: "auto" },
  justifyContent: "center",
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
      background: theme.custom.gradients.pageFade,
    })} />
    <Box sx={(theme) => ({
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.032) 0%, transparent 30%, rgba(0,0,0,0.16) 100%)",
      boxShadow:
        "inset 18px 18px 48px rgba(255,255,255,0.018), inset -30px -34px 68px rgba(0,0,0,0.24)",
      opacity: 0.82,
    })} />
    <Box sx={(theme) => ({
      position: "absolute",
      inset: 0,
      opacity: 0.2,
      backgroundImage:
        "repeating-linear-gradient(135deg, transparent 0 118px, rgba(255,255,255,0.024) 118px 119px, transparent 119px 238px)",
      maskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 64%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 64%, transparent 100%)",
    })} />
    <Box sx={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at top, rgba(255,87,159,0.075), transparent 48%), radial-gradient(ellipse at bottom, rgba(0,145,173,0.055), transparent 52%)",
      opacity: 0.68,
    }} />
  </Box>
));

const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box sx={(theme) => ({
    ...theme.custom.patterns.surface.glass,
    "&::before": {
      content: '""',
      position: "absolute", inset: 0, borderRadius: "inherit",
      background: theme.custom.gradients.shine,
      pointerEvents: "none",
    },
    ...sx,
  })} {...rest}>
    {children}
  </Box>
);

const AccentRule = ({ width = 40, sx = {} }) => (
  <Box sx={(theme) => ({
    width, height: "2px",
    background: theme.custom.gradients.brandGlow,
    borderRadius: "2px",
    boxShadow: theme.custom.effects.glow.primary,
    ...sx,
  })} />
);

const HeroArtwork = ({ product, onPlay, isPlaying }) => {
  const imageUrl = product?.imageUrl || "/placeholder.jpg";
  const title = product?.title || "Premium Beat";
  const type = product?.type || "beat";

  return (
    <Box sx={(theme) => ({
      position: "relative",
      minHeight: { xs: 430, sm: 500, md: 600 },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      isolation: "isolate",
      mt: { xs: 3, md: 0 },
      mx: "auto",
      maxWidth: { xs: 520, md: "none" },
    })}>
      <Box sx={(theme) => ({
        position: "absolute",
        width: { xs: 250, sm: 340, md: 410 },
        height: { xs: 250, sm: 340, md: 410 },
        borderRadius: "46% 54% 45% 55% / 56% 45% 55% 44%",
        background: theme.custom.clay.surfacePink,
        boxShadow: theme.custom.clay.raised,
        opacity: 0.42,
        zIndex: -1,
      })} />

      <Box sx={(theme) => ({
        position: "absolute",
        top: { xs: 18, md: 42 },
        left: { xs: 8, sm: 24, md: 10 },
        width: { xs: 150, md: 178 },
        pl: 2,
        borderLeft: `2px solid ${theme.custom.transparent(theme.palette.primary.main, 0.72)}`,
        filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.34))",
        zIndex: 2,
      })}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.mono,
          fontSize: "0.62rem",
          letterSpacing: "1.6px",
          color: "text.disabled",
          textTransform: "uppercase",
          mb: 1.2,
        }}>
          Latest drop
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontSize: { xs: "1.15rem", md: "1.35rem" },
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1,
        }}>
          New heat in rotation
        </Typography>
      </Box>

      <Box sx={(theme) => ({
        width: { xs: "78vw", sm: 360, md: 430 },
        maxWidth: 430,
        aspectRatio: "1 / 1.15",
        borderRadius: { xs: "34px", md: "44px" },
        overflow: "hidden",
        position: "relative",
        background: theme.custom.clay.surfaceBlue,
        border: theme.custom.clay.border,
        boxShadow: theme.custom.clay.raised,
        transform: "rotate(-1.5deg)",
      })}>
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box sx={(theme) => ({
          position: "absolute",
          inset: 0,
          background: theme.custom.gradients.mediaScrim,
        })} />
        <IconButton
          onClick={onPlay}
          disabled={!product?.audioPreviewUrl}
          aria-label={isPlaying ? "Pause featured beat" : "Play featured beat"}
          sx={(theme) => ({
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 68, md: 82 },
            height: { xs: 68, md: 82 },
            background: theme.custom.clay.surfaceSoft,
            border: theme.custom.clay.border,
            color: "primary.main",
            boxShadow: theme.custom.clay.raisedSmall,
            "&:hover": {
              background: theme.custom.colors.pink,
              color: "primary.contrastText",
              transform: "translate(-50%, -50%) scale(1.06)",
            },
            "&.Mui-disabled": {
              color: "text.disabled",
            },
          })}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 36 }} /> : <PlayArrowIcon sx={{ fontSize: 40, ml: 0.5 }} />}
        </IconButton>
      </Box>

      <Box sx={(theme) => ({
        position: "absolute",
        right: { xs: 8, sm: 18, md: -10 },
        top: { xs: 96, md: 118 },
        width: { xs: 158, md: 206 },
        p: 1.6,
        background: theme.custom.transparent(theme.custom.colors.clayDeep, 0.54),
        border: theme.custom.clay.hairline,
        boxShadow: theme.custom.clay.pressed,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "20px",
        zIndex: 3,
      })}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.mono,
          fontSize: "0.62rem",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "text.disabled",
          mb: 1,
        }}>
          Previewing
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 700,
          color: "text.primary",
          fontSize: { xs: "0.98rem", md: "1.15rem" },
          lineHeight: 1.15,
          mb: 1.3,
        }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.mono, color: "primary.main", fontSize: "0.68rem", textTransform: "uppercase" }}>
            {type}
          </Typography>
          <WaveformBars count={4} />
        </Box>
      </Box>

      <Box sx={(theme) => ({
        position: "absolute",
        left: { xs: 12, sm: 30, md: 28 },
        bottom: { xs: 0, md: 38 },
        width: { xs: "calc(100% - 24px)", sm: 360, md: 390 },
        px: 0.5,
        py: 1.25,
        borderTop: theme.custom.clay.hairline,
        borderBottom: theme.custom.clay.hairline,
        filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.34))",
        zIndex: 4,
      })}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
          <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.mono, color: "text.disabled", fontSize: "0.64rem", letterSpacing: "1.6px", textTransform: "uppercase" }}>
            Studio pulse
          </Typography>
          <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.mono, color: "primary.main", fontSize: "0.64rem", letterSpacing: "1.6px" }}>
            LIVE
          </Typography>
        </Box>
        <LevelMeter bars={20} />
      </Box>
    </Box>
  );
};

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
      position: "relative",
      overflow: "hidden",
      width: "100vw",
      ml: "calc(50% - 50vw)",
      mr: "calc(50% - 50vw)",
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

const PluginShowcaseCard = ({ product, onCardClick }) => (
  <Box
    onClick={() => onCardClick(product.id)}
    sx={(theme) => ({
      height: "100%",
      minWidth: 0,
      cursor: "pointer",
      display: "grid",
      gridTemplateRows: { xs: "minmax(250px, 34vw) auto", sm: "minmax(270px, 33vw) auto", lg: "390px auto" },
      gap: { xs: 2.5, md: 3.25 },
      transition: theme.custom.motion.transition.lift,
      "&:hover": {
        transform: "translateY(-6px)",
      },
      "&:hover .plugin-showcase-stage": {
        boxShadow: theme.custom.clay.floating,
        borderColor: theme.custom.transparent(theme.palette.primary.main, 0.4),
      },
    })}
  >
    <Box sx={(theme) => ({
      position: "relative",
      minWidth: 0,
      minHeight: 0,
      background: theme.custom.clay.surfaceBlue,
      border: theme.custom.clay.border,
      borderRadius: `${theme.custom.radius["4xl"]}px`,
      boxShadow: theme.custom.clay.raised,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: { xs: 2, md: 2.75 },
      transition: theme.custom.motion.transition.lift,
    })} className="plugin-showcase-stage">
      <Box
        component="img"
        src={product.imageUrl || "/placeholder.jpg"}
        alt={product.title}
        loading="lazy"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
      <Box sx={(theme) => ({
        position: "absolute",
        top: 18,
        left: 18,
        px: 1.2,
        py: 0.55,
        borderRadius: `${theme.custom.radius.pill}px`,
        background: theme.custom.clay.surfaceSoft,
        border: `1px solid ${theme.custom.transparent(theme.palette.primary.main, 0.28)}`,
        boxShadow: theme.custom.clay.raisedSmall,
      })}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.mono,
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          color: "text.primary",
        }}>
          Plugin
        </Typography>
      </Box>
    </Box>

    <Box sx={{
      px: { xs: 0.5, md: 1 },
      display: "flex",
      flexDirection: "column",
      gap: 1.7,
      minWidth: 0,
      height: "100%",
    }}>
      <Typography variant="h3" sx={{
        fontSize: { xs: "1.7rem", md: "2.1rem" },
        lineHeight: 1.05,
        color: "text.primary",
        overflowWrap: "anywhere",
      }}>
        {product.title}
      </Typography>
      {product.description && (
        <Typography sx={{
          color: "text.secondary",
          fontSize: { xs: "0.92rem", md: "1rem" },
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.description}
        </Typography>
      )}
      <Box sx={{
        mt: "auto",
        pt: 1,
        display: "flex",
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 700,
          fontSize: "1.4rem",
          color: "text.primary",
        }}>
          ${product.price}
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{ ...flatPinkButtonSx, px: 2.4, alignSelf: { xs: "flex-start", sm: "center" } }}
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(product.id);
          }}
        >
          View Plugin
        </Button>
      </Box>
    </Box>
  </Box>
);

// ─── Interactive Feature Section ──────────────────────────────────────────────
const InteractiveFeatureSection = ({ history, testimonials }) => {
  const [active, setActive] = useState("Browse Beats");

  const menuItems = [
    { title: "Browse Beats", label: "SONIC CATALOG", desc: "Access the full vault of industry-standard production.", cta: "Browse the catalog" },
    { title: "Meet the Creator", label: "THE ARCHITECT", desc: "Go behind the scenes of the signature sound design.", cta: "Meet the creator" },
    { title: "Licenses & Terms", label: "USAGE RIGHTS", desc: "Transparent, flexible legal framework for your hits.", cta: "View licensing" },
  ];
  const activeItem = menuItems.find((i) => i.title === active);

  return (
    <Box sx={{ position: "relative", zIndex: 2, py: { xs: 9, md: 13 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 7, md: 6 }} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: 520 }}>
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
                <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, lineHeight: 1.05 }}>
                  Find what you need without the maze.
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gap: 1.5, mb: 2.5 }}>
                {menuItems.map((item) => {
                  const isActive = active === item.title;
                  return (
                    <Box
                      key={item.title}
                      onMouseEnter={() => setActive(item.title)}
                      onClick={() => history.push(routeMap[item.title])}
                      sx={(theme) => ({
                        py: { xs: 2.1, md: 2.35 },
                        px: { xs: 1.5, md: 2 },
                        minHeight: { xs: 94, md: 100 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        borderRadius: `${theme.custom.radius.lg}px`,
                        cursor: "pointer",
                        border: "1px solid transparent",
                        borderLeft: isActive
                          ? `3px solid ${theme.palette.primary.main}`
                          : theme.custom.clay.hairline,
                        background: isActive
                          ? "linear-gradient(90deg, rgba(255,87,159,0.16), transparent 72%)"
                          : "transparent",
                        boxShadow: isActive ? "inset 10px 0 18px rgba(255,87,159,0.045)" : "none",
                        transition: theme.custom.motion.transition.interactive,
                        "&:hover": {
                          background: isActive
                            ? "linear-gradient(90deg, rgba(255,87,159,0.14), transparent 72%)"
                            : theme.custom.transparent(theme.custom.colors.ink, 0.035),
                        },
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
                        fontSize: { xs: "1.35rem", md: "1.5rem" },
                        color: "text.primary",
                      }}>
                        {item.title}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <GlassPanel sx={{
                mt: "auto",
                p: { xs: 3, md: 3.5 },
                overflow: "hidden",
              }}>
                <Box sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  alignItems: "flex-start",
                  mb: 3,
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

                <Typography variant="h3" sx={{ fontSize: { xs: "1.9rem", md: "2.45rem" }, mb: 1.5 }}>
                  {active}
                </Typography>
                <Typography sx={{
                  color: "text.secondary",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  mb: 3,
                  lineHeight: 1.7,
                }}>
                  {activeItem?.desc}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => history.push(routeMap[active])}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ ...flatPinkButtonSx, px: 3.5 }}
                >
                  {activeItem?.cta}
                </Button>
              </GlassPanel>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: 520 }}>
                <AccentRule width={32} sx={{ mb: 2 }} />
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "primary.main",
                  mb: 1,
                }}>
                  Trusted by
                </Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, lineHeight: 1.05 }}>
                  Heard Worldwide
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gap: { xs: 3, md: 3.5 }, flex: 1 }}>
                {testimonials.map(({ name, quote, videoUrl }, i) => (
                  <Box key={i} sx={(theme) => ({
                    py: { xs: 2.5, md: 3 },
                    borderTop: theme.custom.clay.hairline,
                    borderBottom: theme.custom.clay.hairline,
                  })}>
                    <Box sx={{
                      display: "flex",
                      gap: { xs: 2, md: 2.5 },
                      mb: getYouTubeEmbedUrl(videoUrl) ? 3 : 0,
                      alignItems: "flex-start",
                    }}>
                      <Box sx={(theme) => ({
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        background: theme.custom.transparent(theme.palette.primary.main, 0.12),
                        border: theme.custom.clay.hairline,
                        boxShadow: theme.custom.clay.pressed,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.5,
                      })}>
                        <Typography sx={{
                          fontSize: "1.2rem",
                          color: "primary.main",
                          fontFamily: (theme) => theme.custom.fonts.display,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}>
                          "
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{
                          fontFamily: (theme) => theme.custom.fonts.display,
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "primary.main",
                          mb: 1,
                        }}>
                          {name}
                        </Typography>
                        <Typography sx={{
                          fontFamily: (theme) => theme.custom.fonts.body,
                          fontSize: { xs: "1.05rem", md: "1.14rem" },
                          color: "text.secondary",
                          fontStyle: "italic",
                          lineHeight: 1.7,
                        }}>
                          "{quote}"
                        </Typography>
                      </Box>
                    </Box>

                    {getYouTubeEmbedUrl(videoUrl) && (
                      <Box sx={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: (theme) => theme.custom.clay.border,
                        boxShadow: (theme) => theme.custom.clay.raised,
                      }}>
                        <iframe
                          src={`${getYouTubeEmbedUrl(videoUrl)}?rel=0&controls=1`}
                          title={`Video by ${name}`}
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
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
  const { activeTrackId, isPlaying, toggleTrack } = useAudioPlayer();
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

  const newestBeat = useMemo(
    () => products
      .filter((product) => product.type === "beat")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0],
    [products]
  );
  const featuredPlugins = useMemo(
    () => products
      .filter((product) => product.type === "plugin")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2),
    [products]
  );
  const isFeaturedPlaying = Boolean(newestBeat && activeTrackId === newestBeat.id && isPlaying);
  const handleFeaturedPlay = useCallback((e) => {
    e.stopPropagation();
    if (!newestBeat?.audioPreviewUrl) return;
    toggleTrack({
      id: newestBeat.id,
      title: newestBeat.title,
      imageUrl: newestBeat.imageUrl,
      audioPreviewUrl: newestBeat.audioPreviewUrl,
      type: newestBeat.type,
    });
  }, [newestBeat, toggleTrack]);

  return (
    <Box sx={{
      position: "relative", minHeight: "100vh",
      backgroundColor: "background.default", color: "text.primary", overflowX: "hidden",
    }}>
      <LiquidBackground />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <Box sx={{
        position: "relative",
        zIndex: 2,
        pt: { xs: 10, md: 12 },
        pb: { xs: 7, md: 10 },
        minHeight: { md: "calc(100vh - 12px)" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}>
        <Typography
          aria-hidden="true"
          sx={(theme) => ({
            position: "absolute",
            top: { xs: 64, md: 40 },
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: theme.custom.fonts.display,
            fontWeight: 700,
            fontSize: { xs: "5.4rem", sm: "8.5rem", md: "13.8rem", lg: "17rem" },
            lineHeight: 0.78,
            letterSpacing: 0,
            color: theme.custom.transparent(theme.custom.colors.ink, 0.055),
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          })}
        >
          DOOMS
        </Typography>

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={{ xs: 5, md: 8, lg: 10 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{
                maxWidth: 610,
                position: "relative",
                zIndex: 4,
                mx: { xs: "auto", md: 0 },
                textAlign: { xs: "center", md: "left" },
              }}>
                <Box sx={(theme) => ({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.4,
                  py: 0.85,
                  mb: 2.5,
                  ...theme.custom.patterns.badge.soft,
                  maxWidth: "100%",
                })}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main", boxShadow: (theme) => theme.custom.effects.glow.primary }} />
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.mono,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "1.8px",
                    textTransform: "uppercase",
                    color: "primary.main",
                  }}>
                    Studio online / Now booking
                  </Typography>
                </Box>

                <Typography variant="h1" sx={{
                  fontSize: { xs: "3.6rem", sm: "5.2rem", md: "6.8rem", lg: "7.8rem" },
                  lineHeight: 0.86,
                  mb: 2.5,
                  maxWidth: 760,
                }}>
                 DOOMS
                </Typography>

                <Typography sx={{
                  fontSize: { xs: "1rem", md: "1.18rem" },
                  color: "text.secondary",
                  maxWidth: 550,
                  mb: 3.5,
                  lineHeight: 1.75,
                  mx: { xs: "auto", md: 0 },
                }}>
                  Hip-hop, trap & R&B instrumentals mixed, mastered, and ready for artists who want the record to hit on first play.
                </Typography>

                <Box
                  component="form"
                  onSubmit={onSearchSubmit}
                  sx={(theme) => ({
                    display: "flex",
                    maxWidth: 540,
                    mb: 3.25,
                    mx: { xs: "auto", md: 0 },
                    background: theme.custom.clay.surfaceWarm,
                    borderRadius: "24px 18px 24px 18px",
                    border: theme.custom.clay.border,
                    overflow: "hidden",
                    boxShadow: theme.custom.clay.pressed,
                    "&:focus-within": {
                      borderColor: "primary.main",
                      boxShadow: `${theme.custom.clay.pressed}, ${theme.custom.effects.focusRing}`,
                    },
                  })}
                >
                  <InputBase
                    placeholder="Search beats, kits, loops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    inputProps={{ "aria-label": "Search beats, kits, and loops" }}
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 1.45, sm: 1.35 },
                      fontSize: { xs: "1.05rem", md: "1rem" },
                      color: "text.primary",
                      "& input::placeholder": { color: "text.disabled" },
                    }}
                  />
                  <IconButton
                    type="submit"
                    aria-label="Search"
                    sx={{
                      m: 0.75,
                      width: { xs: 50, sm: 44 },
                      height: { xs: 50, sm: 44 },
                      borderRadius: (theme) => `${theme.custom.radius.md}px`,
                      background: (theme) => theme.custom.clay.surfacePink,
                      color: "primary.contrastText",
                      boxShadow: (theme) => theme.custom.clay.raisedSmall,
                      flexShrink: 0,
                      "&:hover": { background: (theme) => theme.custom.gradients.brandHover },
                    }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{
                  display: "flex",
                  gap: { xs: 1.25, sm: 1.5 },
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", md: "flex-start" },
                  alignItems: "center",
                  mb: { xs: 2, md: 0 },
                  "& .MuiButton-root": {
                    width: { xs: "100%", sm: "auto" },
                    minHeight: { xs: 52, sm: 48 },
                    fontSize: { xs: "1rem", sm: "0.98rem" },
                  },
                }}>
                  <Button variant="contained" size="large" onClick={handleContactOpen} sx={{ ...flatPinkButtonSx, ...mobileFullButtonSx }}>
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
                    sx={{ ...mobileFullButtonSx, color: "text.secondary", "&:hover": { color: "primary.main" } }}
                  >
                    Browse catalog
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <HeroArtwork product={newestBeat} onPlay={handleFeaturedPlay} isPlaying={isFeaturedPlaying} />
            </Grid>
          </Grid>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: { xs: 2, md: 2.5 },
            mt: { xs: 5, md: 7 },
            position: "relative",
            zIndex: 5,
          }}>
            {stats.map((stat) => (
              <Box
                key={stat.label}
                sx={(theme) => ({
                  p: { xs: 2.2, md: 2.8 },
                  minHeight: { xs: 106, md: 124 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textAlign: { xs: "center", sm: "left" },
                  borderTop: theme.custom.clay.hairline,
                  borderBottom: theme.custom.clay.hairline,
                  boxShadow: "inset 0 10px 22px rgba(255,255,255,0.025), inset 0 -12px 22px rgba(0,0,0,0.12)",
                  "&:not(:last-of-type)": {
                    borderRight: { sm: theme.custom.clay.hairline },
                  },
                })}
              >
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontWeight: 700,
                  fontSize: { xs: "2.15rem", md: "2.7rem" },
                  lineHeight: 0.9,
                  color: "text.primary",
                  mb: 1,
                }}>
                  {stat.value}
                </Typography>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  color: "text.secondary",
                  fontSize: "0.7rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <StatusTicker />
          </Box>
        </Container>
      </Box>

      {/* ── PLUGIN SHOWCASE ──────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 9, md: 13 } }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", mb: { xs: 5, md: 7 },
            flexWrap: "wrap", gap: { xs: 2.5, md: 3 }, pb: 4,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}>
            <Box>
              <AccentRule width={32} sx={{ mb: 2 }} />
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.mono, fontSize: "0.7rem",
                fontWeight: 500, letterSpacing: "3px",
                textTransform: "uppercase", color: "primary.main", mb: 1,
              }}>
                Tools for the session
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, lineHeight: 1 }}>
                Plugin Showcase
              </Typography>
            </Box>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => history.push("/plugins")}
              sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "transparent" } }}
            >
              View all
            </Button>
          </Box>

          {featuredPlugins.length > 0 ? (
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: { xs: 5.5, md: 5 },
              alignItems: "stretch",
            }}>
              {featuredPlugins.map((product) => (
                <PluginShowcaseCard
                  key={product.id}
                  product={product}
                  onCardClick={handleCardClick}
                />
              ))}
            </Box>
          ) : (
            <Box sx={(theme) => ({
              py: 8,
              px: 4,
              textAlign: "center",
              borderTop: theme.custom.clay.hairline,
              borderBottom: theme.custom.clay.hairline,
            })}>
              <Typography sx={{ color: "text.secondary" }}>
                Plugins are on the way — check back soon.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── FEATURE SECTION ──────────────────────────────────────────────── */}
      <InteractiveFeatureSection history={history} testimonials={testimonials} />

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 10, md: 15 } }}>
        <Container maxWidth={false} disableGutters>
          <Box sx={(theme) => ({
            py: { xs: 4, sm: 5, md: 7 },
            px: { xs: 2.5, sm: 4, md: 6 },
            textAlign: "center",
            borderTop: theme.custom.clay.hairline,
            borderBottom: theme.custom.clay.hairline,
            boxShadow: "inset 0 18px 34px rgba(255,255,255,0.026), inset 0 -18px 34px rgba(0,0,0,0.12)",
          })}>
            <Box sx={{ maxWidth: 640, mx: "auto" }}>
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
              <Box sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}>
                <Button
                  variant="contained" size="large"
                  onClick={() => history.push("/products")}
                  sx={{ ...flatPinkButtonSx, px: 5, py: 1.6, fontSize: "1rem" }}
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
            </Box>
          </Box>
        </Container>
      </Box>

      {openContactModal && (
        <ContactModal open={openContactModal} onClose={handleContactClose} />
      )}
    </Box>
  );
};

export default LandingPage;

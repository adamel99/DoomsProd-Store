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
  useTheme,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PersonIcon from "@mui/icons-material/Person";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getAllProductsThunk } from "../../store/products";
import ContactModal from "../ContactInfo/ContactInfo";
import NeumorphicCard from "../NeumorphicCard/NeumorphicCard";

const getYouTubeId = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^\s&?\/]+)/i
  );
  return match ? match[1] : null;
};

const routeMap = {
  "Browse Beats": "/products",
  "Meet the Creator": "/about",
  "Licenses and Terms": "/licenses",
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

// Simplified CSS-only animated background
const AnimatedBackground = React.memo(() => (
  <>
    <Box
      sx={{
        position: "absolute",
        top: { xs: "-100px", md: "-150px" },
        left: { xs: "-50px", md: "-100px" },
        width: { xs: 300, sm: 400, md: 600 },
        height: { xs: 300, sm: 400, md: 600 },
        bgcolor: "rgba(207, 18, 89, 0.15)",
        filter: "blur(120px)",
        borderRadius: "50%",
        zIndex: 1,
        animation: "float 20s ease-in-out infinite",
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(30px, 30px) scale(1.1)" },
        },
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: { xs: "400px", md: "600px" },
        right: { xs: "-100px", md: "-150px" },
        width: { xs: 250, sm: 350, md: 500 },
        height: { xs: 250, sm: 350, md: 500 },
        bgcolor: "rgba(28, 114, 147, 0.12)",
        filter: "blur(100px)",
        borderRadius: "50%",
        zIndex: 1,
        animation: "float 25s ease-in-out infinite reverse",
      }}
    />
  </>
));

// Highly optimized product card
const ProductCard = React.memo(({ product, playingProductId, onToggleAudio, onCardClick }) => {
  const theme = useTheme();
  const audioRef = useRef(null);
  const isPlaying = playingProductId === product.id;

  const handleClick = useCallback(() => {
    onCardClick(product.id);
  }, [product.id, onCardClick]);

  const handleAudioToggle = useCallback((e) => {
    onToggleAudio(e, product.id, audioRef);
  }, [product.id, onToggleAudio]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(207, 18, 89, 0.4)",
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "100%",
          overflow: "hidden",
          background: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <Box
          component="img"
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.title}
          loading="lazy"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Play Button */}
        {product.downloadUrls && (
          <>
            <IconButton
              onClick={handleAudioToggle}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 64,
                height: 64,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: theme.palette.primary.main,
                transition: "transform 0.2s ease",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                opacity: 0.9,
                "&:hover": {
                  backgroundColor: "#fff",
                  transform: "translate(-50%, -50%) scale(1.1)",
                  opacity: 1,
                },
              }}
            >
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: 32 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 32, ml: 0.5 }} />
              )}
            </IconButton>
            <audio
              ref={audioRef}
              src={Array.isArray(product.downloadUrls) ? product.downloadUrls[0] : product.downloadUrls}
              preload="none"
            />
          </>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "1.1rem",
            mb: 2,
            color: theme.palette.text.primary,
            lineHeight: 1.3,
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.title}
        </Typography>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            py: 1.2,
            fontWeight: 600,
            fontSize: "0.95rem",
            borderColor: "rgba(255, 255, 255, 0.15)",
            color: theme.palette.text.primary,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
            },
          }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
         prevProps.playingProductId === nextProps.playingProductId;
});

const LandingPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [openContactModal, setOpenContactModal] = useState(false);
  const [playingProductId, setPlayingProductId] = useState(null);
  const audioRefs = useRef({});

  const products = useSelector((state) =>
    Object.values(state.products.allProducts || {})
  );

  useEffect(() => {
    dispatch(getAllProductsThunk());
  }, [dispatch]);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  }, [searchTerm, history]);

  const iconMap = useMemo(() => ({
    "Browse Beats": (
      <HeadphonesIcon sx={{ fontSize: 50, mb: 1, color: theme.palette.primary.main }} />
    ),
    "Meet the Creator": (
      <PersonIcon sx={{ fontSize: 50, mb: 1, color: theme.palette.primary.main }} />
    ),
    "Licenses and Terms": (
      <LibraryMusicIcon sx={{ fontSize: 50, mb: 1, color: theme.palette.primary.main }} />
    ),
  }), [theme.palette.primary.main]);

  const toggleAudio = useCallback((e, productId, audioRef) => {
    e.stopPropagation();
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    // Pause all other audio
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio && audio !== currentAudio && !audio.paused) {
        audio.pause();
      }
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

  const handleCardClick = useCallback((id) => {
    history.push(`/products/${id}`);
  }, [history]);

  const handleContactOpen = useCallback(() => {
    setOpenContactModal(true);
  }, []);

  const handleContactClose = useCallback(() => {
    setOpenContactModal(false);
  }, []);

  const handleScrollToBeats = useCallback(() => {
    window.scrollTo({ top: 800, behavior: "smooth" });
  }, []);

  const latestProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    [products]
  );

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <AnimatedBackground />

      {/* Hero Section */}
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 2,
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          px: { xs: 2, sm: 6, md: 12 },
        }}
      >
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 1 }}>
              <Chip
                icon={<TrendingUpIcon />}
                label="Industry Standard Production"
                sx={{
                  bgcolor: "rgba(207, 18, 89, 0.15)",
                  color: theme.palette.primary.main,
                  border: `1px solid ${theme.palette.primary.main}80`,
                  fontWeight: 600,
                  mb: 3,
                }}
              />
            </Box>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontSize: { xs: "3rem", sm: "4.5rem", md: "5.5rem", lg: "7rem" },
                textAlign: { xs: "center", md: "left" },
                background: `white`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 2,
                lineHeight: 1,
              }}
            >
              idontevenknowhim
            </Typography>
            <Typography
              variant="h5"
              sx={{
                opacity: 0.9,
                textAlign: { xs: "center", md: "left" },
                mb: 4,
                fontWeight: 400,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                color: theme.palette.text.secondary,
              }}
            >
              Industry-ready beats. Instant downloads. Elevate your sound.
            </Typography>

            {/* Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                mb: 4,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {stats.map((stat, idx) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem" }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Search Bar */}
            <Box
              component="form"
              onSubmit={onSearchSubmit}
              sx={{
                display: "flex",
                mb: 4,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 6,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
                transition: "border-color 0.2s ease",
                "&:hover": {
                  borderColor: `${theme.palette.primary.main}40`,
                },
                "&:focus-within": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <InputBase
                placeholder="Search beats, kits, loops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: "1.05rem",
                }}
              />
              <IconButton
                type="submit"
                sx={{
                  px: 3,
                  borderRadius: 0,
                  bgcolor: theme.palette.primary.main,
                  color: "#fff",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>

            {/* CTA Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleContactOpen}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.05rem",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Contact Me
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://www.youtube.com/@DoomsProduction"
                target="_blank"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.05rem",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                YouTube
              </Button>
              <Button
                variant="text"
                size="large"
                onClick={handleScrollToBeats}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.05rem",
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    bgcolor: "transparent",
                  },
                }}
              >
                Explore Beats →
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Latest Products Section */}
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 2,
          py: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4, md: 8 },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Latest Releases
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1.1rem",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Fresh beats crafted with precision. Preview and download instantly.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
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

      {/* Feature Cards Section */}
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 2,
          py: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4, md: 8 },
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          {Object.keys(routeMap).map((title) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <NeumorphicCard
                onClick={() => history.push(routeMap[title])}
                sx={{
                  height: 280,
                  px: 4,
                  py: 4,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  background: `linear-gradient(145deg, rgba(26, 26, 26, 0.6), rgba(20, 20, 20, 0.8))`,
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    borderColor: `${theme.palette.primary.main}40`,
                    transform: "scale(1.02)",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.info.main}20)`,
                    border: `1px solid ${theme.palette.primary.main}40`,
                  }}
                >
                  {iconMap[title]}
                </Box>
                <Typography
                  variant="h5"
                  sx={{ mt: 2, mb: 2, fontWeight: 700, fontSize: "1.6rem" }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}
                >
                  {title === "Browse Beats"
                    ? "Exclusive beats across genres. Preview instantly."
                    : title === "Meet the Creator"
                    ? "Learn about the artist and vision."
                    : "Explore licensing options."}
                </Typography>
              </NeumorphicCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4, md: 8 },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" }, fontWeight: 700 }}
          >
            Trusted by Creators Worldwide
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1.1rem",
              maxWidth: 700,
              mx: "auto",
            }}
          >
            Join thousands of artists elevating their sound with our production
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {testimonials.map(({ name, quote, videoUrl }, index) => (
            <Grid item xs={12} md={10} lg={8} key={index}>
              <NeumorphicCard
                sx={{
                  p: { xs: 3, md: 5 },
                  background: `linear-gradient(145deg, rgba(26, 26, 26, 0.8), rgba(20, 20, 20, 0.9))`,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    textAlign: "center",
                    color: theme.palette.primary.main,
                    fontSize: { xs: "1.3rem", md: "1.6rem" },
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    fontStyle: "italic",
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    fontWeight: 400,
                  }}
                >
                  "{quote}"
                </Typography>
                {videoUrl && (
                  <Box
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.6)`,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        videoUrl
                      )}?rel=0&controls=1`}
                      title={`Testimonial video by ${name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        border: "none",
                      }}
                    />
                  </Box>
                )}
              </NeumorphicCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          textAlign: "center",
          position: "relative",
          background: `linear-gradient(180deg, transparent, rgba(207, 18, 89, 0.05))`,
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              mb: 3,
            }}
          >
            Ready to Elevate Your Sound?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1.2rem",
              mb: 5,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Browse the catalog of premium beats and start creating your next hit today
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => history.push("/products")}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              Explore Beats
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleContactOpen}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: `${theme.palette.primary.main}15`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              Get in Touch
            </Button>
          </Box>
        </Container>
      </Box>

      {openContactModal && (
        <ContactModal
          open={openContactModal}
          onClose={handleContactClose}
        />
      )}
    </Box>
  );
};

export default LandingPage;

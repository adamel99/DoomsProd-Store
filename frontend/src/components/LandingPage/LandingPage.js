import React, { useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PersonIcon from "@mui/icons-material/Person";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
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
    videoUrl:
      "https://www.youtube.com/watch?v=sBsax2S2G9s&list=RDsBsax2S2G9s&start_radio=1",
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [openContactModal, setOpenContactModal] = useState(false);

  const products = useSelector((state) =>
    Object.values(state.products.allProducts || {})
  );

  useEffect(() => {
    dispatch(getAllProductsThunk());
  }, [dispatch]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const iconMap = {
    "Browse Beats": (
      <HeadphonesIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
    ),
    "Meet the Creator": (
      <PersonIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
    ),
    "Licenses and Terms": (
      <LibraryMusicIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
    ),
  };

  const [playingProductId, setPlayingProductId] = useState(null);
  const audioRefs = useRef({});

  const toggleAudio = (e, productId) => {
    e.stopPropagation();
    const currentAudio = audioRefs.current[productId];
    if (!currentAudio) return;

    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== productId.toString() && !audio.paused) audio.pause();
    });

    if (currentAudio.paused) {
      currentAudio.play();
      setPlayingProductId(productId);
    } else {
      currentAudio.pause();
      setPlayingProductId(null);
    }
  };

  const handleAudioEnded = (productId) => {
    if (playingProductId === productId) setPlayingProductId(null);
  };

  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

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
      {/* Background blob */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "-100px", md: "-150px" },
          left: { xs: "-50px", md: "-100px" },
          width: { xs: 250, sm: 350, md: 500 },
          height: { xs: 250, sm: 350, md: 500 },
          bgcolor: "rgba(255, 80, 120, 0.3)",
          filter: "blur(180px)",
          borderRadius: "50%",
          zIndex: 1,
        }}
      />

      {/* Hero */}
      <Container maxWidth={false} sx={{ position: "relative", zIndex: 2, py: { xs: 6, md: 10 }, px: { xs: 2, sm: 6, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem", lg: "6rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              idontevenknowhim
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, textAlign: { xs: "center", md: "left" } }}>
              Industry-ready beats. Instant downloads.
            </Typography>

            {/* Search */}
            <Box component="form" onSubmit={onSearchSubmit} sx={{ display: "flex", mt: 4 }}>
              <InputBase
                placeholder="Search beats, kits, loops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{
                  bgcolor: "transparent",
                  px: 2,
                  py: 1,
                  borderRadius: theme.shape.borderRadius,
                  mr: 1,
                }}
              />
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Button variant="contained" color="primary" onClick={() => setOpenContactModal(true)}>
                Contact
              </Button>
              <Button variant="outlined" href="https://www.youtube.com/@DoomsProduction" target="_blank">
                YouTube
              </Button>
              <Button variant="outlined" onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}>
                Explore Beats
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Latest Products */}
      <Container maxWidth={false} sx={{ position: "relative", zIndex: 2, py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4, md: 8 } }}>
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
          Latest Products
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {latestProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NeumorphicCard
                  onClick={() => history.push(`/products/${product.id}`)}
                  sx={{
                    px: 3,
                    py: 3,
                    borderRadius: 2,
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {/* Image + Audio */}
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: "100%", sm: 200 },
                      height: { xs: "auto", sm: 200 },
                      borderRadius: 2,
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={product.imageUrl || "/placeholder.jpg"}
                      alt={product.title}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2 }}
                    />
                    {product.downloadUrls && (
                      <>
                        <IconButton
                          onClick={(e) => toggleAudio(e, product.id)}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            width: 60,
                            height: 60,
                          }}
                        >
                          {playingProductId === product.id ? <PauseIcon sx={{ fontSize: 40 }} /> : <PlayArrowIcon sx={{ fontSize: 40 }} />}
                        </IconButton>
                        <audio
                          ref={(el) => (audioRefs.current[product.id] = el)}
                          src={Array.isArray(product.downloadUrls) ? product.downloadUrls[0] : product.downloadUrls}
                          onEnded={() => handleAudioEnded(product.id)}
                        />
                      </>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", mb: 1 }}>
                    {product.title}
                  </Typography>

                  <Button variant="contained" fullWidth size="large" sx={{ py: 2 }}>
                    View Product
                  </Button>
                </NeumorphicCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Feature Cards */}
      <Container maxWidth={false} sx={{ position: "relative", zIndex: 2, py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4, md: 8 } }}>
        <Grid container spacing={6} justifyContent="center">
          {Object.keys(routeMap).map((title) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NeumorphicCard
                  onClick={() => history.push(routeMap[title])}
                  sx={{
                    height: 220,
                    px: 4,
                    py: 4,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  {iconMap[title]}
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    {title}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {title === "Browse Beats"
                      ? "Exclusive beats across genres. Preview instantly."
                      : title === "Meet the Creator"
                      ? "Learn about the artist and vision."
                      : "Explore licensing options."}
                  </Typography>
                </NeumorphicCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Container sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4, md: 8 } }}>
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
          Trusted by Creators Worldwide
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {testimonials.map(({ name, quote, videoUrl }, index) => (
            <Grid item xs={12} md={8} key={index}>
              <NeumorphicCard sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
                  {name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontStyle: "italic", textAlign: "center" }}>
                  "{quote}"
                </Typography>
                {videoUrl && (
                  <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&controls=1`}
                      title={`Testimonial video by ${name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: "100%", aspectRatio: "16/9", borderRadius: "12px" }}
                    />
                  </Box>
                )}
              </NeumorphicCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA */}
      <Box sx={{ py: { xs: 6, md: 10 }, textAlign: "center", borderTop: "1px solid #222" }}>
        <Typography variant="h5" gutterBottom>
          Ready 2 Work?
        </Typography>
        <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={() => history.push("/products")}>
          Explore Beats
        </Button>
        <Button variant="outlined" sx={{ mx: 1 }} onClick={() => setOpenContactModal(true)}>
          Contact Me
        </Button>
      </Box>

      {/* Floating CTA */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10,
          bgcolor: theme.palette.background.paper,
          borderRadius: 4,
          px: 3,
          py: 2,
          boxShadow: `4px 4px 12px #080808, -4px -4px 12px #181818`,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Let’s make something great
        </Typography>
        <Button size="small" variant="contained" onClick={() => history.push("/products")}>
          Explore Beats
        </Button>
      </Box>

      <ContactModal open={openContactModal} onClose={() => setOpenContactModal(false)} />
    </Box>
  );
};

export default LandingPage;

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
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^\s&?/]+)/i
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
    "Browse Beats": <HeadphonesIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />,
    "Meet the Creator": <PersonIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />,
    "Licenses and Terms": <LibraryMusicIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />,
  };

  const [playingProductId, setPlayingProductId] = useState(null);
  const audioRefs = useRef({}); // store audio elements by product id

  const toggleAudio = (e, productId) => {
    e.stopPropagation();

    const currentAudio = audioRefs.current[productId];

    if (!currentAudio) return;

    if (playingProductId && playingProductId !== productId) {
      // Pause previously playing audio
      const prevAudio = audioRefs.current[playingProductId];
      if (prevAudio) prevAudio.pause();
    }

    if (currentAudio.paused) {
      currentAudio.play();
      setPlayingProductId(productId);
    } else {
      currentAudio.pause();
      setPlayingProductId(null);
    }
  };

  const handleAudioEnded = (productId) => {
    if (playingProductId === productId) {
      setPlayingProductId(null);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        overflowX: "hidden",
        width: "100vw",
        maxWidth: "100%",
      }}
    >
      {/* Background blob */}
      <Box sx={{
        position: "absolute",
        top: "-150px",
        left: "-100px",
        width: 500,
        height: 500,
        bgcolor: "rgba(255, 80, 120, 0.3)",
        filter: "blur(180px)",
        borderRadius: "50%",
        zIndex: 1,
      }} />

      {/* Hero section */}
      <Box
        component="svg"
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          zIndex: 1,
          opacity: 0.15,
          transform: "scale(1.2)",
        }}
      >
        <path
          fill={theme.palette.primary.main}
          d="M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z;
              M580,500Q500,600,400,600Q300,600,250,525Q200,450,150,375Q100,300,160,230Q220,160,320,150Q420,140,490,200Q560,260,590,330Q620,400,580,500Z;
              M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z
            "
          />
        </path>
      </Box>

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, py: 4}}>
        <Grid container spacing={6} alignItems="center" columns={12}>
          <Grid xs={12} md={6}>
            <Typography variant="h1" gutterBottom>
              idontevenknowhim
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Industry‑ready beats. Instant downloads.
            </Typography>

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

            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
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

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: 5 }}>
  <Grid container spacing={6} justifyContent="center" columns={12}>
    {Object.keys(routeMap).map((title) => (
      <Grid item xs={12} sm={6} md={6} lg={4} key={title}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <NeumorphicCard
            onClick={() => history.push(routeMap[title])}
            sx={{
              height: 200, // increased height
              width: 400, // full width of grid cell
              px: 5,
              py: 4,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {iconMap[title]}
            <Typography
              variant="h5" // larger title
              sx={{ mt: 2, color: theme.palette.text.primary }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1" // larger body text
              sx={{ color: theme.palette.text.secondary, mt: 1 }}
            >
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


      {/* Latest Products */}
      <Container sx={{ position: "relative", zIndex: 2, py: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom>
          Latest Products
        </Typography>
        <Grid container spacing={4} justifyContent="center" columns={12}>
          {products.slice(0, 3).map((product) => (
            <Grid xs={12} sm={6} md={6} lg={4} key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <NeumorphicCard
                  onClick={() => history.push(`/products/${product.id}`)}
                  sx={{
                    px: 4,
                    py: 3,
                    borderRadius: 2,
                    minHeight: 420,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: `8px 8px 16px #0c0c0c, -8px -8px 16px transparent`,
                    transition: "all 0.3s ease-in-out",
                  }}
                >

                  <Box
                    sx={{
                      position: "relative",
                      width: 200,
                      height: 200,
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
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.8)",
                            },
                          }}
                        >
                          {playingProductId === product.id ? (
                            <PauseIcon sx={{ fontSize: 40 }} />
                          ) : (
                            <PlayArrowIcon sx={{ fontSize: 40 }} />
                          )}
                        </IconButton>
                        <audio
                          ref={(el) => (audioRefs.current[product.id] = el)}
                          src={product.downloadUrls}
                          onEnded={() => handleAudioEnded(product.id)}
                        />
                      </>
                    )}
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      color: theme.palette.text.primary,
                      mb: 1,
                      fontSize: "1.25rem",
                    }}
                  >
                    {product.title}
                  </Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      py: 2,
                      fontSize: "1rem",
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.background.main,
                      boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    }}
                  >
                    View Product
                  </Button>
                </NeumorphicCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Container sx={{ py: 10 }}>
        <Typography variant="h3" textAlign="center" gutterBottom>
          Trusted by Creators Worldwide
        </Typography>
        <Grid container spacing={4} justifyContent="center" columns={12}>
          {testimonials.map(({ name, quote, videoUrl }, index) => (
            <Grid xs={12} md={8} key={index}>
              <NeumorphicCard sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    textAlign: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontStyle: "italic",
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                  }}
                >
                  "{quote}"
                </Typography>
                {videoUrl && (
                  <Box sx={{ mt: 2, borderRadius: 2, overflow: "hidden" }}>
                    <iframe
                      width="100%"
                      height="360"
                      src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&controls=1`}
                      title={`Testimonial video by ${name}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: "12px" }}
                    />
                  </Box>
                )}
              </NeumorphicCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA */}
      <Box sx={{ py: 10, textAlign: "center", borderTop: "1px solid #222" }}>
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

      {/* Fixed CTA */}
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
        <Button
          size="small"
          variant="contained"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.background.default,
            textTransform: "none",
            boxShadow: `0 0 8px ${theme.palette.primary.main}`,
          }}
          onClick={() => history.push("/products")}
        >
          Explore Beats
        </Button>
      </Box>

      <ContactModal open={openContactModal} onClose={() => setOpenContactModal(false)} />
    </Box>
  );
};

export default LandingPage;

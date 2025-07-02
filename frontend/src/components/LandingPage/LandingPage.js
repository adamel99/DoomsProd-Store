import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, NavLink } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  IconButton,
  InputBase,
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PersonIcon from "@mui/icons-material/Person";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { getAllProductsThunk } from "../../store/products";
import ContactModal from "../ContactInfo/ContactInfo";

function getYouTubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^\s&?/]+)/i
  );
  return match ? match[1] : null;
}

const iconMap = {
  "Browse Beats": <HeadphonesIcon sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />,
  "Meet the Creator": <PersonIcon sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />,
  "Licenses and Terms": <LibraryMusicIcon sx={{ fontSize: 40, mb: 1, color: "primary.main" }} />,
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
  }
];

const LandingPage = () => {
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

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: "background.default", color: "text.primary", overflow: "hidden" }}>
      {/* Background Canvas */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: "radial-gradient(circle at top left, #0b0b0b, #000)",
        }}
      />

      {/* Glassmorphic Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-150px",
          left: "-100px",
          width: 500,
          height: 500,
          bgcolor: "rgba(255,51,102,0.15)",
          filter: "blur(180px)",
          borderRadius: "50%",
          zIndex: 1,
          animation: "pulse 12s ease-in-out infinite",
          "@keyframes pulse": {
            "0%,100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: 500,
          height: 500,
          bgcolor: "rgba(146, 254, 157, 0.1)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "pulse2 20s ease-in-out infinite",
          "@keyframes pulse2": {
            "0%,100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "35%",
          width: 300,
          height: 300,
          bgcolor: "rgba(255, 64, 129, 0.08)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "pulse3 24s ease-in-out infinite",
          "@keyframes pulse3": {
            "0%,100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.08)" },
          },
        }}
      />
      {/* Existing blobs here... */}

{/* New blob 1 */}
<Box
  sx={{
    position: "absolute",
    top: "10%",
    right: "-150px",
    width: 400,
    height: 400,
    bgcolor: "rgba(0, 255, 255, 0.1)", // cyan-ish glass
    filter: "blur(140px)",
    borderRadius: "50%",
    zIndex: 0,
    animation: "pulse4 18s ease-in-out infinite",
    "@keyframes pulse4": {
      "0%,100%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.07)" },
    },
  }}
/>

{/* New blob 2 */}
<Box
  sx={{
    position: "absolute",
    bottom: "20%",
    left: "-130px",
    width: 350,
    height: 350,
    bgcolor: "rgba(255, 165, 0, 0.12)", // soft orange glass
    filter: "blur(100px)",
    borderRadius: "50%",
    zIndex: 0,
    animation: "pulse5 22s ease-in-out infinite",
    "@keyframes pulse5": {
      "0%,100%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.06)" },
    },
  }}
/>


      {/* All content layered at zIndex 2 */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
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

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: 10 }}>
        <Grid container spacing={6} justifyContent="center">
          {["Browse Beats", "Meet the Creator", "Licenses and Terms"].map((title) => (
            <Grid item xs={12} md={4} key={title}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NavLink to={routeMap[title]} style={{ textDecoration: "none" }}>
                  <Paper elevation={3} sx={{ p: 5 }}>
                    {iconMap[title]}
                    <Typography variant="h5" gutterBottom>
                      {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {title === "Browse Beats"
                        ? "Exclusive beats across genres. Preview instantly."
                        : title === "Meet the Creator"
                          ? "Learn about the artist and vision."
                          : "Explore licencing options."}
                    </Typography>
                  </Paper>
                </NavLink>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ position: "relative", zIndex: 2, py: 8 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Latest Products
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {products.slice(0, 3).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  {product.audioPreviewUrl ? (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${getYouTubeId(product.audioPreviewUrl)}?rel=0&controls=1`}
                      title={product.title}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <Box component="img" src="/default-image.png" alt={product.title} sx={{ width: "100%", height: 200, objectFit: "cover" }} />
                  )}
                  <Typography variant="body1" sx={{ mt: 2, fontWeight: 600 }}>
                    {product.title}
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => history.push(`/products/${product.id}`)}>
                    View Product
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container sx={{ position: "relative", zIndex: 2, py: 10 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          Trusted by Creators Worldwide
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {testimonials.map(({ name, quote, videoUrl }, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  {name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
                  "{quote}"
                </Typography>
                {videoUrl && (
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "56.25%", // 16:9 aspect ratio
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&controls=1`}
                      title={`Testimonial video by ${name}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>


      <Box sx={{ position: "relative", zIndex: 2, py: 10, textAlign: "center", borderTop: "1px solid #222" }}>
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

      <ContactModal open={openContactModal} onClose={() => setOpenContactModal(false)} />
    </Box>
  );
};

export default LandingPage;

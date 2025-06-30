// LandingPage.js
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

  const productsObj = useSelector((state) => state.products.allProducts || {});
  const products = Object.values(productsObj);

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
    <Box sx={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* SVG Blob Background */}
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-120px",
          right: "-180px",
          zIndex: 0,
          width: "1400px",
          opacity: 0.5,
          pointerEvents: "none",
          filter: "blur(20px)",
          mixBlendMode: "screen",
        }}
      >
        <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
          <g transform="translate(300,300)">
            <path
              d="M145.5,-143.5C181.5,-112.2,204.2,-77.8,203.6,-44.5C203.1,-11.1,179.2,20.3,160.1,52.9C141.1,85.6,126.9,119.5,96.7,132.8C66.4,146.1,20.2,138.7,-13.7,143.6C-47.7,148.6,-78.5,165.8,-101.1,155.4C-123.6,145.1,-137.9,107.1,-142.1,70.7C-146.3,34.2,-140.4,-0.7,-129.2,-33.4C-117.9,-66.2,-101.4,-96.9,-73.8,-135.3C-46.3,-173.7,-8.7,-219.9,24.4,-232.5C57.6,-245.1,109.1,-224.1,145.5,-143.5Z"
              fill="url(#grad2)"
            />
          </g>
          <defs>
            <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00c9ff" />
              <stop offset="100%" stopColor="#92fe9d" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 }, position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: "2.2rem", md: "3rem" }, lineHeight: 1.1 }}>
              idontevenknowhim
            </Typography>
            <Typography variant="h6" sx={{ mt: 1, opacity: 0.8, fontSize: { xs: "1rem", md: "1.25rem" }, lineHeight: 1.4 }}>
              Industry-ready beats. Instant downloads.
            </Typography>

            <Box component="form" onSubmit={onSearchSubmit} sx={{ display: "flex", mt: 4, background: "#111", borderRadius: "50px", overflow: "hidden", maxWidth: 600 }}>
              <InputBase
                placeholder="Search beats, kits, loops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1, px: 3, py: 1.5, color: "#fff" }}
              />
              <IconButton type="submit" sx={{ color: "#fff", p: 2 }}>
                <SearchIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Button variant="contained" color="primary" onClick={() => setOpenContactModal(true)}>
                CONTACT
              </Button>
              <Button variant="outlined" href="https://www.youtube.com/@DoomsProduction" sx={{ color: "#fff", borderColor: "#444" }} target="_blank">
                YouTube
              </Button>
              <Button variant="outlined" onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} sx={{ borderRadius: "50px", color: "#ff4081", borderColor: "#ff4081" }}>
                Explore Beats
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>


      {/* Feature Cards */}
      <Container sx={{ py: 10 }} maxWidth="lg">
        <Grid container spacing={6} justifyContent="center">
          {["Browse Beats", "Meet the Creator", "Licenses and Terms"].map((title) => (
            <Grid item xs={12} md={4} key={title}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <NavLink
                  to={
                    title === "Browse Beats"
                      ? "/products"
                      : title === "Meet the Creator"
                      ? "/about"
                      : "/licenses"
                  }
                  style={{ textDecoration: "none" }}
                >
                  <Paper
                    elevation={10}
                    sx={{
                      p: 6,
                      borderRadius: "24px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(20px)",
                      textAlign: "center",
                      color: "text.primary",
                      boxShadow: `0 12px 40px #ff408122`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 16px 48px #ff408155`,
                      },
                    }}
                  >
                    {iconMap[title]}
                    <Typography variant="h5" gutterBottom>
                      {title}
                    </Typography>
                    <Typography color="text.secondary">
                      {title === "Browse Beats"
                        ? "Exclusive beats across genres. Preview, license, and download instantly."
                        : title === "Meet the Creator"
                        ? "Learn about the artist behind the beats and the vision behind the sound."
                        : "Explore licensing options and pick what fits your project needs."}
                    </Typography>
                  </Paper>
                </NavLink>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Latest Products */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ mb: 6, fontWeight: 900, color: "primary.main", textAlign: "center", textTransform: "uppercase", letterSpacing: 1.5 }}>
          Latest Products
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <Paper
                    elevation={10}
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "linear-gradient(145deg, #1a1a1a, #0f0f0f)",
                      boxShadow: "0 12px 40px rgba(255, 64, 129, 0.15)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 20px 50px rgba(255, 64, 129, 0.3)",
                      },
                    }}
                  >
                    <Box sx={{ width: "100%", height: 200, overflow: "hidden" }}>
                      {product.audioPreviewUrl ? (
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${getYouTubeId(product.audioPreviewUrl)}?rel=0&controls=1`}
                          title={product.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <Box component="img" src="/default-image.png" alt={product.title} sx={{ width: "100%", height: 200, objectFit: "cover" }} />
                      )}
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: "#fff" }}>
                        {product.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        {product.description?.slice(0, 80)}...
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => history.push(`/products/${product.id}`)}
                        sx={{
                          background: "linear-gradient(135deg, #ff4081, #ff6699)",
                          fontWeight: 700,
                          borderRadius: "50px",
                          "&:hover": {
                            background: "linear-gradient(135deg, #ff6699, #ff4081)",
                          },
                        }}
                      >
                        View Product
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Container sx={{ py: 10 }}>
        <Typography
          variant="h4"
          fontWeight={900}
          textAlign="center"
          color="primary.main"
          gutterBottom
        >
          Trusted by Creators Worldwide
        </Typography>
        <Grid container spacing={6} justifyContent="center">
          {testimonials.map(({ name, quote, videoUrl }) => (
            <Grid item xs={12} md={6} key={name}>
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.1)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <Typography variant="body1" fontStyle="italic" gutterBottom>
                  “{quote}”
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  — {name}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&controls=1`}
                    title={name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA */}
      <Box sx={{ py: 10, px: 4, textAlign: "center", background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)" }}>
        <Typography variant="h4" fontWeight={900} color="primary.main" gutterBottom>
          Ready 2 Work?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Browse exclusive beats or contact me to start your project today.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" onClick={() => history.push("/products")} sx={{ fontWeight: 700, borderRadius: "50px" }}>
            Explore Beats
          </Button>
          <Button variant="outlined" sx={{ color: "#fff", borderColor: "#ff4081", fontWeight: 700, borderRadius: "50px", "&:hover": { backgroundColor: "#ff408120" } }} onClick={() => setOpenContactModal(true)}>
            Contact Me
          </Button>
        </Box>
      </Box>

      {/* Contact Modal */}
      <ContactModal open={openContactModal} onClose={() => setOpenContactModal(false)} />
    </Box>
  );
};

export default LandingPage;

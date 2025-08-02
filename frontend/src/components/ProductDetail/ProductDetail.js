import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const ADMIN_EMAIL = "adamelh1999@gmail.com";

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
  const audioRef = useRef(null);

  useEffect(() => {
    dispatch(getSingleProductThunk(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product?.type === "beat") {
      dispatch(getAllLicensesThunk());
    }
  }, [dispatch, product]);

  if (!product) return null;

  const {
    title,
    description,
    imageUrl,
    youtubeLink,
    downloadUrls,
    type,
    price,
    id,
  } = product;

  // Correctly extract the MP3 URL from the downloadUrls array
  const audioUrl = Array.isArray(downloadUrls)
    ? downloadUrls.find((file) => file.type === "mp3")?.url || ""
    : "";

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

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
    } catch {
      setAddCartError("Something went wrong. Try again.");
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const videoId =
        urlObj.hostname === "youtu.be"
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get("v");

      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      console.error("Invalid YouTube URL:", url);
      return "";
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        py: 8,
        color: theme.palette.text.primary,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-150px",
          left: "-100px",
          width: 500,
          height: 500,
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          filter: "blur(180px)",
          borderRadius: "50%",
          zIndex: 0,
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
          bgcolor: alpha(theme.palette.success.main, 0.1),
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
          bgcolor: alpha(theme.palette.primary.main, 0.08),
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

      {/* Main Content */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Left: Image + audio */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={10}
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  boxShadow: theme.shadows[10],
                  cursor: audioUrl ? "pointer" : "default",
                  transition: "transform 0.3s ease",
                  userSelect: "none",
                }}
                onClick={audioUrl ? toggleAudio : undefined}
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                <Box
                  component="img"
                  src={imageUrl || "/placeholder.jpg"}
                  alt={title}
                  sx={{ width: "100%", height: 350, objectFit: "cover" }}
                />
                {audioUrl && (
                  <>
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: alpha(theme.palette.background.paper, 0.6),
                        color: theme.palette.text.primary,
                        width: 60,
                        height: 60,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAudio();
                      }}
                      aria-label={isPlaying ? "Pause preview" : "Play preview"}
                    >
                      {isPlaying ? (
                        <PauseIcon sx={{ fontSize: 40 }} />
                      ) : (
                        <PlayArrowIcon sx={{ fontSize: 40 }} />
                      )}
                    </IconButton>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      preload="auto"
                    />
                  </>
                )}
              </Paper>
            </Grid>

            {/* Right: Info */}
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight={900} sx={{ mb: 2 }}>
                {title}
              </Typography>
              <Divider sx={{ borderColor: theme.palette.divider, mb: 2 }} />
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, whiteSpace: "pre-line", mb: 3 }}
              >
                {description}
              </Typography>

              {type === "beat" && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: theme.palette.text.secondary }}>
                    Select License
                  </InputLabel>
                  <Select
                    value={selectedLicenseId}
                    onChange={handleLicenseChange}
                    sx={{
                      color: theme.palette.text.primary,
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {licenses.map((license) => (
                      <MenuItem key={license.id} value={license.id}>
                        {license.name} — ${license.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  mt: 1,
                  color: theme.palette.primary.main,
                  fontSize: isMobile ? "1.4rem" : "1.8rem",
                }}
              >
                {type === "beat" && selectedLicenseId
                  ? `$${licenses.find((l) => l.id === selectedLicenseId)?.price || "N/A"}`
                  : `$${price}`}
              </Typography>

              {addCartError && (
                <Typography color="error" fontSize="0.9rem" sx={{ mt: 1 }}>
                  {addCartError}
                </Typography>
              )}
              {success && (
                <Typography color="success.main" fontSize="0.9rem" sx={{ mt: 1 }}>
                  Added to cart!
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToCart}
                sx={{
                  mt: 3,
                  borderRadius: 30,
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Add to Cart
              </Button>

              {isAdmin && (
                <Box mt={5} display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => history.push(`/products/${productId}/edit`)}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Edit Product
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      await dispatch(deleteProductThunk(id));
                      history.push("/products");
                    }}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>

          {youtubeLink && (
            <Box mt={10}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                YouTube Preview
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: 4,
                  boxShadow: theme.shadows[8],
                }}
              >
                <iframe
                  src={getYouTubeEmbedUrl(youtubeLink)}
                  title="YouTube Preview"
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
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;

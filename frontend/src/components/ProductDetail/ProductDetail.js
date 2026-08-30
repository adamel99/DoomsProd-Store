import React, { useEffect, useState } from "react";
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
  IconButton,
} from "@mui/material";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import { getYouTubeEmbedUrl } from "../../utils/youtube";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatProductType } from "../../utils/formatProductType";
import { useAudioPlayer } from "../../context/AudioPlayer";

const DetailPanel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    ...theme.custom.patterns.surface.glass,
    ...sx,
  })}>
    {children}
  </Box>
);

const MetaPill = ({ label, value }) => {
  if (!value) return null;

  return (
    <Box sx={(theme) => ({
      px: 1.5,
      py: 0.75,
      borderRadius: "999px",
      background: (theme) => theme.custom.transparent(theme.custom.colors.cream, 0.46),
      border: theme.custom.clay.hairline,
    })}>
      <Typography sx={{
        fontFamily: (theme) => theme.custom.fonts.mono,
        fontSize: "0.64rem",
        color: "text.secondary",
        letterSpacing: "1px",
        textTransform: "uppercase",
      }}>
        {label}: {value}
      </Typography>
    </Box>
  );
};

const ProductDetailPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { productId } = useParams();
  const { activeTrackId, isPlaying, toggleTrack } = useAudioPlayer();

  const product = useSelector((state) => state.products.singleProduct);
  const currentUser = useSelector((state) => state.session.user);
  const licenses = useSelector((state) => Object.values(state.licenses.licenses || {}));

  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartError, setAddCartError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(getSingleProductThunk(productId));
    window.scrollTo(0, 0);
  }, [dispatch, productId]);

  useEffect(() => {
    if (product?.type === "beat") dispatch(getAllLicensesThunk());
  }, [dispatch, product]);

  if (!product) {
    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}>
        <Typography sx={{ color: "text.secondary" }}>Loading product...</Typography>
      </Box>
    );
  }

  const { title, description, imageUrl, youtubeLink, audioPreviewUrl, type, price, id, genre, bpm, key: productKey, artistTags } = product;
  const isAdmin = currentUser?.role === "admin";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeLink);
  const selectedLicense = licenses.find((license) => license.id === selectedLicenseId);
  const displayPrice = type === "beat" && selectedLicense ? selectedLicense.price : price;
  const isCurrentTrackPlaying = activeTrackId === id && isPlaying;

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
      setTimeout(() => setSuccess(false), 3500);
    } catch {
      setAddCartError("Something went wrong. Try again.");
    }
  };

  const toggleAudio = () => {
    toggleTrack({
      id,
      title,
      imageUrl,
      audioPreviewUrl,
      type,
    });
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${title}"?`)) {
      await dispatch(deleteProductThunk(id));
      history.push("/products");
    }
  };

  return (
    <Box sx={{
      backgroundColor: "background.default",
      pt: { xs: 7, md: 10 },
      pb: { xs: 8, md: 12 },
      color: "text.primary",
      minHeight: "100vh",
    }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push("/products")}
          variant="text"
          sx={{ mb: 4, color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          Back to collection
        </Button>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="start">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
              <DetailPanel sx={{ overflow: "hidden" }}>
                <Box sx={{ position: "relative", aspectRatio: "1 / 1", background: "background.paper" }}>
                  <Box
                    component="img"
                    src={imageUrl || "/placeholder.jpg"}
                    alt={title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box sx={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--image-scrim, linear-gradient(to top, rgba(54,36,23,0.62) 0%, rgba(54,36,23,0.12) 48%, transparent 100%))",
                    pointerEvents: "none",
                  }} />

                  <Box sx={(theme) => ({
                    position: "absolute",
                    top: 16,
                    left: 16,
                    px: 1.6,
                    py: 0.65,
                    borderRadius: "999px",
                    background: (theme) => theme.custom.transparent(theme.custom.colors.cream, 0.92),
                    border: theme.custom.clay.border,
                    boxShadow: theme.custom.clay.raisedSmall,
                  })}>
                    <Typography sx={{
                      fontFamily: (theme) => theme.custom.fonts.mono,
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase",
                      color: "text.primary",
                    }}>
                      {formatProductType(type)}
                    </Typography>
                  </Box>

                  {audioPreviewUrl && (
                    <>
                      <IconButton
                        onClick={toggleAudio}
                        aria-label={isCurrentTrackPlaying ? "Pause preview" : "Play preview"}
                        sx={(theme) => ({
                          position: "absolute",
                          left: 20,
                          bottom: 20,
                          width: { xs: 58, md: 68 },
                          height: { xs: 58, md: 68 },
                          color: "primary.main",
                          background: theme.custom.clay.surfaceSoft,
                          border: theme.custom.clay.border,
                          boxShadow: theme.custom.clay.raisedSmall,
                          "&:hover": {
                            color: "primary.contrastText",
                            background: "primary.main",
                          },
                        })}
                      >
                        {isCurrentTrackPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 34, ml: 0.4 }} />}
                      </IconButton>
                    </>
                  )}
                </Box>
              </DetailPanel>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                <MetaPill label="Genre" value={genre} />
                <MetaPill label="BPM" value={bpm} />
                <MetaPill label="Key" value={productKey} />
                <MetaPill label="Tags" value={artistTags} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 1.5,
            }}>
              Product detail
            </Typography>

            <Typography variant="h1" sx={{
              fontSize: { xs: "2.7rem", md: "4.8rem" },
              lineHeight: 0.95,
              mb: 3,
            }}>
              {title}
            </Typography>

            <Typography sx={{
              color: "text.secondary",
              whiteSpace: "pre-line",
              lineHeight: 1.75,
              fontSize: "1rem",
              mb: 4,
              maxWidth: 620,
            }}>
              {description || "No description available."}
            </Typography>

            <DetailPanel sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
              {type === "beat" && licenses.length > 0 && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select License</InputLabel>
                  <Select
                    value={selectedLicenseId}
                    label="Select License"
                    onChange={(e) => {
                      setSelectedLicenseId(e.target.value);
                      setAddCartError(null);
                    }}
                  >
                    <MenuItem value=""><em>Choose a license</em></MenuItem>
                    {licenses.map((license) => (
                      <MenuItem key={license.id} value={license.id}>
                        {license.name} - ${license.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Box sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
              }}>
                <Box>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.mono,
                    color: "text.disabled",
                    fontSize: "0.68rem",
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                    mb: 0.6,
                  }}>
                    {selectedLicense ? selectedLicense.name : "Price"}
                  </Typography>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.display,
                    fontWeight: 800,
                    fontSize: { xs: "2.4rem", md: "3rem" },
                    color: "text.primary",
                    lineHeight: 1,
                  }}>
                    ${displayPrice}
                  </Typography>
                </Box>
              </Box>

              {addCartError && (
                <Typography sx={{ color: "primary.dark", fontSize: "0.9rem", mb: 2 }}>
                  {addCartError}
                </Typography>
              )}

              {success && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CheckCircleIcon sx={{ color: "success.main", fontSize: 19 }} />
                  <Typography sx={{ color: "success.main", fontWeight: 700, fontSize: "0.9rem" }}>
                    Added to cart successfully.
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                sx={{ py: 1.7 }}
              >
                Add to Cart
              </Button>
            </DetailPanel>

            {isAdmin && (
              <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => history.push(`/products/${productId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ color: "primary.dark" }}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>

        {youtubeEmbedUrl && (
          <Box sx={{ mt: { xs: 7, md: 10 } }}>
            <Box sx={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
              pb: 2,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}>
              <Box>
                <Typography sx={{
                  fontFamily: (theme) => theme.custom.fonts.mono,
                  color: "primary.main",
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  mb: 1,
                }}>
                  Preview
                </Typography>
                <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", md: "2.6rem" } }}>
                  YouTube Preview
                </Typography>
              </Box>
            </Box>

            <DetailPanel sx={{ p: { xs: 1.5, md: 2 } }}>
              <Box sx={{
                position: "relative",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                border: "var(--clay-border)",
              }}>
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube Preview"
                  frameBorder="0"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
              </Box>
            </DetailPanel>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;

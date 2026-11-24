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
  Chip,
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
import DownloadIcon from "@mui/icons-material/Download";
import { formatProductType } from "../../utils/formatProductType";
import { useAudioPlayer } from "../../context/AudioPlayer";
import { csrfFetch } from "../../store/csrf";

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
  const [freeDownloadState, setFreeDownloadState] = useState({ loading: false, error: null, success: null });

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
  const lowestLicensePrice = licenses.reduce((lowest, license) => (
    lowest === null || Number(license.price) < lowest ? Number(license.price) : lowest
  ), null);
  const displayPrice = type === "beat"
    ? selectedLicense?.price ?? lowestLicensePrice
    : price;
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

  const handleFreeMp3Download = async () => {
    setFreeDownloadState({ loading: true, error: null, success: null });
    try {
      const response = await csrfFetch(`/api/downloads/free-mp3/${id}`, { method: "POST" });
      const data = await response.json();
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName || `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFreeDownloadState({ loading: false, error: null, success: data.message || "Your MP3 and license terms were emailed to you." });
    } catch (errorResponse) {
      const data = await errorResponse.json?.().catch(() => null);
      setFreeDownloadState({ loading: false, error: data?.message || "Could not prepare the free MP3. Please try again.", success: null });
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/products")}
            variant="text"
            sx={{ color: "text.secondary", flexShrink: 0, "&:hover": { color: "primary.main" } }}
          >
            Back to collection
          </Button>
          {type === "beat" && product.hasFreeMp3 && (
            <Chip
              icon={<DownloadIcon sx={{ fontSize: "16px !important" }} />}
              label="Free MP3 version available"
              size="small"
              sx={(theme) => ({
                fontSize: { xs: "0.58rem", sm: "0.7rem" },
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: theme.palette.success.dark,
                backgroundColor: theme.custom.transparent(theme.palette.success.main, 0.1),
                border: `1px solid ${theme.custom.transparent(theme.palette.success.main, 0.28)}`,
                "& .MuiChip-icon": { color: "inherit" },
              })}
            />
          )}
        </Box>

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="start">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
              <DetailPanel sx={{ overflow: "hidden", width: "100%" }}>
                <Box sx={(theme) => ({
                  position: "relative",
                  aspectRatio: "1 / 1",
                  width: "100%",
                  maxHeight: { md: 560 },
                  background: theme.custom.clay.surfaceSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}>
                  <Box
                    component="img"
                    src={imageUrl || "/placeholder.jpg"}
                    alt={title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                      p: { xs: 1.25, md: 1.75 },
                    }}
                  />
                  <Box sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(54,36,23,0.36) 0%, rgba(54,36,23,0.08) 38%, transparent 72%)",
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

              <Box sx={{ display: "flex", gap: 0.85, flexWrap: "wrap", mt: 1.5 }}>
                <MetaPill label="Genre" value={genre} />
                <MetaPill label="BPM" value={bpm} />
                <MetaPill label="Key" value={productKey} />
                <MetaPill label="Tags" value={artistTags} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.25, mb: 1.5 }}>
              <Typography sx={{
                fontFamily: (theme) => theme.custom.fonts.mono,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "2.4px",
                textTransform: "uppercase",
                color: "primary.main",
              }}>
                {formatProductType(type)}
              </Typography>
            </Box>

            <Typography variant="h1" sx={{
              fontSize: { xs: "2.35rem", md: "3.45rem" },
              lineHeight: 1,
              mb: 2,
              overflowWrap: "anywhere",
            }}>
              {title}
            </Typography>

            <Typography sx={{
              color: "text.secondary",
              whiteSpace: "pre-line",
              lineHeight: 1.75,
              fontSize: "1rem",
              mb: 3,
              maxWidth: 620,
            }}>
              {description || "No description available."}
            </Typography>

            <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.55rem" }, mb: 1.5 }}>
              {type === "beat" ? "License & purchase" : "Purchase"}
            </Typography>
            <DetailPanel sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>

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
                    {selectedLicense ? selectedLicense.name : type === "beat" ? "Starting at" : "Price"}
                  </Typography>
                  <Typography sx={{
                    fontFamily: (theme) => theme.custom.fonts.display,
                    fontWeight: 700,
                    fontSize: { xs: "2.4rem", md: "3rem" },
                    color: "text.primary",
                    lineHeight: 1,
                  }}>
                    {displayPrice === null || displayPrice === undefined ? "Choose a license" : `$${displayPrice}`}
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

            {type === "beat" && product.hasFreeMp3 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.55rem" }, mb: 1 }}>
                  Free MP3 for recording demos
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.7, mb: 2 }}>
                  Try the beat while you write and record. A license is required before you release, distribute, or monetize your song.
                </Typography>
                {currentUser ? (
                  <>
                    {freeDownloadState.error && <Typography role="alert" sx={{ color: "error.main", mb: 1.5 }}>{freeDownloadState.error}</Typography>}
                    {freeDownloadState.success && <Typography role="status" sx={{ color: "success.main", mb: 1.5 }}>{freeDownloadState.success}</Typography>}
                    <Button variant="outlined" size="large" onClick={handleFreeMp3Download} disabled={freeDownloadState.loading} sx={{ width: { xs: "100%", sm: "auto" }, px: 3 }}>
                      {freeDownloadState.loading ? "Preparing download…" : "Get free MP3"}
                    </Button>
                  </>
                ) : (
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    <Button onClick={() => history.push("/login")} sx={{ px: 0, minWidth: 0, mr: 0.5 }}>Log in</Button>
                    or <Button onClick={() => history.push("/signup")} sx={{ px: 0, minWidth: 0, mx: 0.5 }}>sign up</Button>
                    to download the free MP3 version.
                  </Typography>
                )}
                <Box sx={(theme) => ({
                  mt: 2.5,
                  pl: 2,
                  py: 0.25,
                  borderLeft: `2px solid ${theme.custom.transparent(theme.palette.primary.main, 0.55)}`,
                })}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.75 }}>
                    Free download terms
                  </Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.86rem" }}>
                    This MP3 is for evaluation and private recording only. Downloading it does not grant a license or transfer copyright, publishing, master, or ownership rights. You may write and record with the beat, but you must purchase and follow a valid license before releasing, distributing, monetizing, publicly performing, submitting to streaming services, or registering your song with Content ID. Do not resell, share, re-upload, or distribute the beat as a standalone file. Unauthorized use may result in takedowns and legal action; the purchased license defines your permitted use.
                  </Typography>
                  {currentUser && (
                    <Typography sx={{ color: "text.disabled", fontSize: "0.78rem", lineHeight: 1.5, mt: 1 }}>
                      We’ll email these terms with your download link, which expires after 15 minutes.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

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
                  Listen
                </Typography>
                <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
                  Full preview
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

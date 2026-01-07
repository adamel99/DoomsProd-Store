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
  Chip,
  Fade,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    dispatch(getSingleProductThunk(productId));
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, [dispatch, productId]);

  useEffect(() => {
    if (product?.type === "beat") {
      dispatch(getAllLicensesThunk());
    }
  }, [dispatch, product]);

  if (!product) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  const {
    title,
    description,
    imageUrl,
    youtubeLink,
    downloadUrls,
    type,
    price,
    id,
    genre,
    bpm,
  } = product;

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
      setTimeout(() => setSuccess(false), 4000);
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

  const selectedLicense = licenses.find((l) => l.id === selectedLicenseId);
  const displayPrice =
    type === "beat" && selectedLicense ? selectedLicense.price : price;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        pt: { xs: 4, md: 6 },
        pb: { xs: 8, md: 12 },
        color: theme.palette.text.primary,
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-150px",
          left: "-100px",
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          bgcolor: alpha(theme.palette.primary.main, 0.15),
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
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
          bottom: "-150px",
          right: "-100px",
          width: { xs: 250, md: 500 },
          height: { xs: 250, md: 500 },
          bgcolor: alpha(theme.palette.info.main, 0.1),
          filter: "blur(100px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />

      {/* Main Content */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Fade in={isVisible} timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => history.push("/products")}
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    bgcolor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                Back to Products
              </Button>
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{
                  "& .MuiBreadcrumbs-separator": {
                    color: theme.palette.text.secondary,
                  },
                }}
              >
                <Link
                  component="button"
                  onClick={() => history.push("/")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: theme.palette.text.secondary,
                    textDecoration: "none",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <HomeIcon fontSize="small" />
                  Home
                </Link>
                <Link
                  component="button"
                  onClick={() => history.push("/products")}
                  sx={{
                    color: theme.palette.text.secondary,
                    textDecoration: "none",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Products
                </Link>
                <Typography color="text.primary">{title}</Typography>
              </Breadcrumbs>
            </Box>
          </Fade>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Left: Image + Audio */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  sx={{
                    position: "sticky",
                    top: 24,
                  }}
                >
                  {/* Product Type Badge */}
                  <Chip
                    icon={<MusicNoteIcon sx={{ fontSize: 18 }} />}
                    label={type?.toUpperCase() || "PRODUCT"}
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      zIndex: 3,
                      bgcolor: "rgba(207, 18, 89, 0.95)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      px: 1,
                    }}
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: `linear-gradient(145deg, rgba(26, 26, 26, 0.8), rgba(20, 20, 20, 0.9))`,
                      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.5)`,
                      cursor: audioUrl ? "pointer" : "default",
                      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                      userSelect: "none",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: `0 16px 48px ${theme.palette.primary.main}30`,
                      },
                    }}
                    onClick={audioUrl ? toggleAudio : undefined}
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  >
                    <Box
                      component="img"
                      src={imageUrl || "/placeholder.jpg"}
                      alt={title}
                      onLoad={() => setImageLoaded(true)}
                      sx={{
                        width: "100%",
                        height: { xs: 350, md: 450 },
                        objectFit: "cover",
                        transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                        transform: isPlaying ? "scale(1.05)" : "scale(1)",
                        opacity: imageLoaded ? 1 : 0,
                      }}
                    />

                    {/* Gradient Overlay */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Play/Pause Button */}
                    {audioUrl && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <IconButton
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              backgroundColor: "rgba(207, 18, 89, 0.95)",
                              backdropFilter: "blur(10px)",
                              color: "#fff",
                              width: { xs: 70, md: 80 },
                              height: { xs: 70, md: 80 },
                              border: "2px solid rgba(255, 255, 255, 0.2)",
                              zIndex: 2,
                              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                                transform: "translate(-50%, -50%) scale(1.15)",
                                boxShadow: `0 8px 32px ${theme.palette.primary.main}90`,
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAudio();
                            }}
                            aria-label={isPlaying ? "Pause preview" : "Play preview"}
                          >
                            {isPlaying ? (
                              <PauseIcon sx={{ fontSize: { xs: 36, md: 42 } }} />
                            ) : (
                              <PlayArrowIcon sx={{ fontSize: { xs: 36, md: 42 }, ml: 0.5 }} />
                            )}
                          </IconButton>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Waveform Animation */}
                    {isPlaying && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 20,
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          gap: 0.75,
                          zIndex: 2,
                        }}
                      >
                        {[...Array(7)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 4,
                              height: 30,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: 1,
                              animation: `waveform 0.8s ease-in-out ${i * 0.1}s infinite`,
                              "@keyframes waveform": {
                                "0%, 100%": { height: "15px" },
                                "50%": { height: "35px" },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      preload="metadata"
                    />
                  </Paper>

                  {/* Product Metadata */}
                  {(genre || bpm) && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mt: 3,
                        flexWrap: "wrap",
                      }}
                    >
                      {genre && (
                        <Chip
                          label={`Genre: ${genre}`}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.05)",
                            color: theme.palette.text.secondary,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      )}
                      {bpm && (
                        <Chip
                          label={`${bpm} BPM`}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.05)",
                            color: theme.palette.text.secondary,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Grid>

            {/* Right: Product Info */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              >
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{
                      mb: 2,
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                      lineHeight: 1.2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {title}
                  </Typography>

                  <Divider
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      mb: 3,
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      whiteSpace: "pre-line",
                      mb: 4,
                      lineHeight: 1.8,
                      fontSize: "1.05rem",
                    }}
                  >
                    {description || "No description available."}
                  </Typography>

                  {/* License Selection */}
                  {type === "beat" && licenses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <FormControl
                        fullWidth
                        sx={{
                          mb: 4,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                            bgcolor: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.05)",
                              border: `1px solid ${theme.palette.primary.main}40`,
                            },
                            "&.Mui-focused": {
                              border: `1px solid ${theme.palette.primary.main}`,
                              boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                            },
                          },
                        }}
                      >
                        <InputLabel
                          sx={{
                            color: theme.palette.text.secondary,
                            "&.Mui-focused": {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          Select License
                        </InputLabel>
                        <Select
                          value={selectedLicenseId}
                          label="Select License"
                          onChange={handleLicenseChange}
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          <MenuItem value="">
                            <em>Choose a license</em>
                          </MenuItem>
                          {licenses.map((license) => (
                            <MenuItem key={license.id} value={license.id}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <Typography>{license.name}</Typography>
                                <Typography
                                  sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                  }}
                                >
                                  ${license.price}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </motion.div>
                  )}

                  {/* Price Display */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, rgba(207, 18, 89, 0.1), rgba(28, 114, 147, 0.1))`,
                        border: `1px solid ${theme.palette.primary.main}40`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: `theme.palette.text.secondary`,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          fontSize: "0.75rem",
                        }}
                      >
                        Price
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          mt: 0.5,
                          background: `white`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          fontSize: { xs: "2rem", md: "2.5rem" },
                        }}
                      >
                        ${displayPrice}
                      </Typography>
                    </Box>
                  </motion.div>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {addCartError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Box
                          sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: "rgba(244, 67, 54, 0.1)",
                            border: "1px solid rgba(244, 67, 54, 0.3)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography color="error" fontSize="0.95rem">
                            {addCartError}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            mb: 2,
                            p: 2,
                            bgcolor: "rgba(76, 175, 80, 0.15)",
                            border: "1px solid rgba(76, 175, 80, 0.3)",
                            borderRadius: 2,
                          }}
                        >
                          <CheckCircleIcon sx={{ color: "success.main", fontSize: 24 }} />
                          <Typography
                            color="success.main"
                            fontSize="0.95rem"
                            fontWeight={600}
                          >
                            Successfully added to cart!
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Add to Cart Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{
                      mb: 3,
                      borderRadius: 3,
                      px: 4,
                      py: 2,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                      transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.info.main})`,
                        transform: "translateY(-3px)",
                        boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
                      },
                    }}
                  >
                    Add to Cart
                  </Button>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          pt: 3,
                          mt: 3,
                          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<EditIcon />}
                          onClick={() => history.push(`/products/${productId}/edit`)}
                          sx={{
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            color: theme.palette.info.main,
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: theme.palette.info.main,
                              bgcolor: `${theme.palette.info.main}15`,
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<DeleteIcon />}
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete "${title}"?`
                              )
                            ) {
                              await dispatch(deleteProductThunk(id));
                              history.push("/products");
                            }
                          }}
                          sx={{
                            borderColor: "rgba(244, 67, 54, 0.5)",
                            color: "error.main",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "error.main",
                              bgcolor: "rgba(244, 67, 54, 0.1)",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* YouTube Preview Section */}
          {youtubeLink && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ mt: { xs: 8, md: 12 } }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    mb: 4,
                    fontSize: { xs: "1.75rem", md: "2.25rem" },
                  }}
                >
                  YouTube Preview
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: 4,
                    boxShadow: `0 12px 40px rgba(0, 0, 0, 0.6)`,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
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
            </motion.div>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;

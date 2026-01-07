import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleProductThunk,
  deleteProductThunk,
} from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";

import {
  Box,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Zoom,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import NeumorphicCard from "../NeumorphicCard/NeumorphicCard";

const ADMIN_EMAIL = "adamelh1999@gmail.com";

const ProductCard = ({ customProduct }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { productId } = useParams();
  const history = useHistory();

  const isStandalone = !!productId;
  const product = useSelector((state) => state.products.singleProduct);
  const currentUser = useSelector((state) => state.session.user);
  const licenses = useSelector((state) =>
    Object.values(state.licenses.licenses || {})
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [addCartError, setAddCartError] = useState(null);
  const [addCartSuccess, setAddCartSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isStandalone) dispatch(getSingleProductThunk(productId));
    setIsVisible(true);
  }, [dispatch, productId, isStandalone]);

  useEffect(() => {
    if ((isStandalone ? product?.type : customProduct?.type) === "beat") {
      dispatch(getAllLicensesThunk());
    }
  }, [dispatch, product, customProduct, isStandalone]);

  const displayedProduct = isStandalone ? product : customProduct;
  if (isStandalone && !product) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  if (!displayedProduct) return null;

  const {
    title,
    price,
    description,
    imageUrl,
    downloadUrls,
    id,
    type,
  } = displayedProduct;

  const audioUrl = Array.isArray(downloadUrls)
    ? downloadUrls.find((file) => file.type === "mp3")?.url || ""
    : "";

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const handleClick = () => {
    if (!isStandalone) history.push(`/products/${id}`);
  };

  const handleUpdate = () => history.push(`/products/${id}/edit`);
  const handleDelete = () => setDeleteDialogOpen(true);
  const cancelDelete = () => setDeleteDialogOpen(false);
  const confirmDelete = async () => {
    await dispatch(deleteProductThunk(id));
    setDeleteDialogOpen(false);
    history.push("/products");
  };

  const handleAddToCart = async () => {
    setAddCartError(null);
    setAddCartSuccess(false);
    if (type === "beat" && !selectedLicenseId) {
      setAddCartError("Please select a license to add this beat to your cart.");
      return;
    }
    setAddCartLoading(true);
    try {
      await dispatch(addToCartThunk(id, selectedLicenseId || null));
      setAddCartSuccess(true);
      setTimeout(() => setAddCartSuccess(false), 3000);
    } catch {
      setAddCartError("Failed to add to cart. Please try again.");
    } finally {
      setAddCartLoading(false);
    }
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <>
      <Box
        sx={{
          py: isStandalone ? 6 : 0,
          minHeight: isStandalone ? "100vh" : "auto",
          display: "flex",
          alignItems: isStandalone ? "center" : "stretch",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={cardVariants}
          style={{ width: "100%", maxWidth: isStandalone ? "450px" : "100%" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <NeumorphicCard
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: 350, md: isStandalone ? 450 : 400 },
              margin: isStandalone ? "auto" : "0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              cursor: !isStandalone ? "pointer" : "default",
              borderRadius: 1,
              backdropFilter: "blur(16px)",
              background: `linear-gradient(145deg, rgba(26, 26, 26, 0.8), rgba(20, 20, 20, 0.9))`,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              position: "relative",
              transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              "&:hover": {
                transform: isStandalone ? "none" : "translateY(-8px)",
                border: `1px solid ${theme.palette.primary.main}60`,
                boxShadow: `0 16px 48px ${theme.palette.primary.main}30`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.3s ease",
              },
            }}
            onClick={handleClick}
          >
            {/* Image Container with Enhanced Effects */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: isStandalone ? "100%" : "75%",
                flexShrink: 0,
                overflow: "hidden",
                backgroundColor: theme.palette.background.default,
              }}
            >
              {/* Product Type Badge */}
              <Zoom in={isVisible} style={{ transitionDelay: "200ms" }}>
                <Chip
                  icon={<MusicNoteIcon sx={{ fontSize: 16 }} />}
                  label={type?.toUpperCase() || "PRODUCT"}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    bgcolor: "rgba(207, 18, 89, 0.9)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              </Zoom>

              {/* Image with Overlay */}
              <CardMedia
                component="img"
                image={imageUrl || "/placeholder.jpg"}
                alt={`Product: ${title}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                  transform: isHovered ? "scale(1.08)" : "scale(1)",
                }}
              />

              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                  pointerEvents: "none",
                  opacity: isHovered ? 1 : 0.7,
                  transition: "opacity 0.3s ease",
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
                      onClick={toggleAudio}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(207, 18, 89, 0.95)",
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                        width: { xs: 56, sm: 64, md: 70 },
                        height: { xs: 56, sm: 64, md: 70 },
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                        zIndex: 2,
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                          transform: "translate(-50%, -50%) scale(1.15)",
                          boxShadow: `0 8px 32px ${theme.palette.primary.main}90`,
                        },
                      }}
                      aria-label={isPlaying ? "Pause preview" : "Play preview"}
                    >
                      {isPlaying ? (
                        <PauseIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }} />
                      ) : (
                        <PlayArrowIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, ml: 0.5 }} />
                      )}
                    </IconButton>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Audio Waveform Visual Indicator */}
              {isPlaying && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 0.5,
                    zIndex: 2,
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 3,
                        height: 20,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 1,
                        animation: `waveform 0.8s ease-in-out ${i * 0.1}s infinite`,
                        "@keyframes waveform": {
                          "0%, 100%": { height: "10px" },
                          "50%": { height: "25px" },
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
            </Box>

            {/* Content Section */}
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: theme.spacing(3),
                background: "transparent",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
                    mb: 1,
                    color: theme.palette.text.primary,
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {title}
                </Typography>

                {description && (
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      mt: 1,
                      mb: 2,
                      lineHeight: 1.6,
                      maxHeight: 60,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {description}
                  </Typography>
                )}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      background: `white`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: { xs: "1.5rem", sm: "1.8rem" },
                    }}
                  >
                    ${price}
                  </Typography>
                </Box>

                {/* License Selection for Beats */}
                {type === "beat" && licenses.length > 0 && (
                  <Fade in={isVisible} timeout={800}>
                    <FormControl
                      fullWidth
                      size="small"
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.05)",
                          },
                        },
                      }}
                    >
                      <InputLabel>Select License</InputLabel>
                      <Select
                        value={selectedLicenseId}
                        label="Select License"
                        onChange={(e) => setSelectedLicenseId(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Choose a license</em>
                        </MenuItem>
                        {licenses.map((license) => (
                          <MenuItem key={license.id} value={license.id}>
                            {license.name} - ${license.price}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Fade>
                )}
              </Box>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {addCartError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Typography
                      color="error"
                      sx={{
                        mt: 1,
                        mb: 1,
                        fontSize: "0.85rem",
                        textAlign: "center",
                        bgcolor: "rgba(244, 67, 54, 0.1)",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {addCartError}
                    </Typography>
                  </motion.div>
                )}
                {addCartSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        mt: 1,
                        mb: 1,
                        p: 1.5,
                        bgcolor: "rgba(76, 175, 80, 0.15)",
                        borderRadius: 1,
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                      <Typography
                        color="success.main"
                        sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        Added to cart successfully!
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add to Cart Button */}
              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={addCartLoading}
                fullWidth
                startIcon={!addCartLoading && <ShoppingCartIcon />}
                sx={{
                  mt: 1,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                  transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.info.main})`,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 28px ${theme.palette.primary.main}60`,
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                {addCartLoading ? "Adding..." : "Add to Cart"}
              </Button>

              {/* Admin Actions */}
              {isAdmin && isStandalone && (
                <Fade in={isVisible} timeout={1000}>
                  <Box
                    mt={2}
                    display="flex"
                    gap={1.5}
                    sx={{
                      pt: 2,
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleUpdate}
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.info.main,
                        "&:hover": {
                          bgcolor: theme.palette.info.dark,
                        },
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDelete}
                      fullWidth
                      sx={{
                        borderColor: "rgba(244, 67, 54, 0.5)",
                        "&:hover": {
                          borderColor: "error.main",
                          bgcolor: "rgba(244, 67, 54, 0.1)",
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </NeumorphicCard>
        </motion.div>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 1,
            background: `linear-gradient(145deg, rgba(26, 26, 26, 0.98), rgba(20, 20, 20, 0.98))`,
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary, fontSize: "1rem" }}>
            Are you sure you want to delete the product "{title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={cancelDelete}
            variant="outlined"
            sx={{
              borderColor: "rgba(255, 255, 255, 0.2)",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: `${theme.palette.primary.main}10`,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;

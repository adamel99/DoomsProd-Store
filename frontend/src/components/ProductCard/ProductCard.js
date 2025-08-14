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
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import NeumorphicCard from "../NeumorphicCard/NeumorphicCard";

const ADMIN_EMAIL = "adamel1999@gmail.com";

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
  const audioRef = useRef(null);

  useEffect(() => {
    if (isStandalone) dispatch(getSingleProductThunk(productId));
  }, [dispatch, productId, isStandalone]);

  useEffect(() => {
    if ((isStandalone ? product?.type : customProduct?.type) === "beat") {
      dispatch(getAllLicensesThunk());
    }
  }, [dispatch, product, customProduct, isStandalone]);

  const displayedProduct = isStandalone ? product : customProduct;
  if (isStandalone && !product) return <Typography>Loading...</Typography>;
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

  // Extract mp3 URL from downloadUrls array:
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
    } catch {
      setAddCartError("Failed to add to cart. Please try again.");
    } finally {
      setAddCartLoading(false);
    }
  };

  const toggleAudio = (e) => {
    e.stopPropagation(); // Prevent card click navigation when toggling audio
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <Box sx={{ py: isStandalone ? 6 : 4, minHeight: isStandalone ? "100vh" : "auto" }}>
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <NeumorphicCard
            sx={{
              maxWidth: isStandalone ? 300 : 250,
              height: "80%",
              width: "100%",
              margin: isStandalone ? `${theme.spacing(4)} auto` : undefined,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              cursor: !isStandalone ? "pointer" : "default",
              borderRadius: "20px",
              backdropFilter: "blur(8px)",
              transition: "transform 0.3s ease",
            }}
            onClick={handleClick}
          >
            {/* Image + Audio Player */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "50%",
                flexShrink: 0,
                overflow: "hidden",
                backgroundColor: theme.palette.background.default,
              }}
              onClick={audioUrl ? toggleAudio : undefined}
            >
              <CardMedia
                component="img"
                image={imageUrl || "/placeholder.jpg"}
                alt={`Product: ${title}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {audioUrl && (
                <>
                  <IconButton
                    onClick={toggleAudio}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      width: 48,
                      height: 48,
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                    }}
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  >
                    {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                  </IconButton>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    preload="auto"
                  />
                </>
              )}
            </Box>

            {/* Content Section */}
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: theme.spacing(1.2),
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ fontSize: "1.5rem" }}
                  noWrap
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.8rem",
                    mt: 0.5,
                    lineHeight: 1.4,
                    maxHeight: 36,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {description}
                </Typography>

                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight={700}
                  sx={{ mt: 0.75, fontSize: "0.95rem" }}
                >
                  ${price}
                </Typography>
              </Box>

              {addCartError && (
                <Typography color="error" sx={{ mt: 0.5, fontSize: "0.7rem" }}>
                  {addCartError}
                </Typography>
              )}
              {addCartSuccess && (
                <Typography
                  color="success.main"
                  sx={{ mt: 0.5, fontSize: "0.7rem" }}
                >
                  Added to cart!
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={addCartLoading}
                fullWidth
                sx={{
                  mt: 1,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  py: 1,
                  borderRadius: "999px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}55`,
                }}
              >
                {addCartLoading ? "Adding..." : "Add to Cart"}
              </Button>

              {isAdmin && isStandalone && (
                <Box mt={1} display="flex" gap={1} justifyContent="center">
                  <Button variant="contained" onClick={handleUpdate} size="small">
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleDelete}
                    size="small"
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </CardContent>
          </NeumorphicCard>
        </Box>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{title}"? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductCard;

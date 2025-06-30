import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import YouTubePlayer from "../YouTubePlayer/YouTubePlayer";

const ADMIN_EMAIL = "adamelh1999@gmail.com";

const ProductCard = ({ customProduct }) => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const history = useHistory();

  const isStandalone = !!productId;
  const product = useSelector((state) => state.products.singleProduct);
  const currentUser = useSelector((state) => state.session.user);
  const licenses = useSelector((state) => Object.values(state.licenses.licenses || {}));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState("");
  const [addCartLoading, setAddCartLoading] = useState(false);
  const [addCartError, setAddCartError] = useState(null);
  const [addCartSuccess, setAddCartSuccess] = useState(false);

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
    audioUrl,
    audioPreviewUrl,
    id,
    type
  } = displayedProduct;

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

  const handleLicenseChange = (e) => {
    setSelectedLicenseId(e.target.value);
    setAddCartError(null);
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

  return (
    <>
      <Box sx={{ backgroundColor: "#0d0d0d", py: isStandalone ? 6 : 2, minHeight: isStandalone ? "100vh" : "auto" }}>
        <Card
          sx={{
            maxWidth: isStandalone ? 300 : 180,
            width: "100%",
            margin: isStandalone ? "2rem auto" : undefined,
            cursor: !isStandalone ? "pointer" : "default",
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 6px 20px rgba(255, 64, 129, 0.15)",
            transition: "transform 0.2s ease",
            "&:hover": !isStandalone ? { transform: "scale(1.04)", boxShadow: "0 10px 25px rgba(255, 64, 129, 0.3)" } : {},
          }}
          onClick={handleClick}
          role={!isStandalone ? "button" : undefined}
          tabIndex={!isStandalone ? 0 : undefined}
          onKeyPress={(e) => {
            if (!isStandalone && (e.key === "Enter" || e.key === " ")) handleClick();
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl || audioUrl || "/placeholder.jpg"}
            alt={`Product: ${title}`}
            sx={{
              width: "100%",
              height: 140,
              objectFit: "cover", // <-- This ensures the image fills the container
              backgroundColor: "#1a1a1a",
              borderRadius: "8px 8px 0 0",
            }}
          />


          <CardContent sx={{ color: "#f5f5f5", px: 1, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {title}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: 30,
                fontSize: "0.7rem",
              }}
            >
              {description}
            </Typography>

            {type === "beat" && audioPreviewUrl && isStandalone && (
              <Box mt={1}>
                <YouTubePlayer url={audioPreviewUrl} />
              </Box>
            )}

            <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 0.5 }}>
              Price: $
              {type === "beat" && selectedLicenseId
                ? licenses.find((l) => l.id === selectedLicenseId)?.price || "N/A"
                : price}
            </Typography>

            {/* {type === "beat" && (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="license-select-label">License</InputLabel>
                <Select
                  labelId="license-select-label"
                  value={selectedLicenseId}
                  label="License"
                  onChange={handleLicenseChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {licenses.map((license) => (
                    <MenuItem key={license.id} value={license.id}>
                      {license.name} (${license.price})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )} */}

            {addCartError && (
              <Typography color="error" sx={{ mt: 1, fontSize: "0.7rem" }}>
                {addCartError}
              </Typography>
            )}
            {addCartSuccess && (
              <Typography color="success.main" sx={{ mt: 1, fontSize: "0.7rem" }}>
                Added to cart!
              </Typography>
            )}

            <Box mt={1}>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                disabled={addCartLoading || (type === "beat" && !selectedLicenseId)}
                fullWidth
                size="small"
                sx={{
                  fontSize: "0.75rem",
                  py: 0.5,
                  borderRadius: 20,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #ff4081, #ff6699)",
                  boxShadow: "0 5px 20px rgba(255, 64, 129, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff6699, #ff4081)",
                  },
                }}
              >
                {addCartLoading ? "Adding..." : "Add to Cart"}
              </Button>
            </Box>

            {isAdmin && isStandalone && (
              <Box mt={2} display="flex" gap={1} justifyContent="center">
                <Button variant="contained" onClick={handleUpdate} size="small">
                  Update
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleDelete} size="small">
                  Delete
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{title}"? This action cannot be undone.
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

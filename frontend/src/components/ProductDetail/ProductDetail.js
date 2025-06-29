import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductThunk, deleteProductThunk } from "../../store/products";
import { getAllLicensesThunk } from "../../store/licenses";
import { addToCartThunk } from "../../store/cartItems";
import YouTubePlayer from "../YouTubePlayer/YouTubePlayer";

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
    audioPreviewUrl,
    type,
    price,
    id,
  } = product;

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

  return (
    <Box sx={{ backgroundColor: "#0d0d0d", py: 8, color: "#fff", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left: Product Image + Audio Preview */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid #222",
                mb: 3,
                boxShadow: "0 10px 30px rgba(255,64,129,0.3)",
              }}
            >
              <Box
                component="img"
                src={imageUrl || "/placeholder.jpg"}
                alt={title}
                sx={{
                  width: "100%",
                  height: isMobile ? 300 : 450,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Paper>

            {audioPreviewUrl && (
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  backgroundColor: "#111",
                  border: "1px solid #222",
                }}
              >
                <YouTubePlayer url={audioPreviewUrl} />
              </Paper>
            )}
          </Grid>

          {/* Right: Product Details and Actions */}
          <Grid item xs={12} md={6} display="flex" flexDirection="column" justifyContent="space-between">
            <Box>
              <Typography variant="h3" fontWeight={900} gutterBottom>
                {title}
              </Typography>

              <Typography variant="body1" sx={{ color: "#ccc", mb: 4, whiteSpace: "pre-line" }}>
                {description}
              </Typography>

              {/* License selection for beats */}
              {type === "beat" && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: "#ccc" }}>Select License</InputLabel>
                  <Select
                    value={selectedLicenseId}
                    onChange={handleLicenseChange}
                    sx={{ color: "#fff", backgroundColor: "#1a1a1a" }}
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

              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                Price: $
                {type === "beat" && selectedLicenseId
                  ? licenses.find((l) => l.id === selectedLicenseId)?.price || "N/A"
                  : price}
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
                sx={{ mt: 3, borderRadius: 30, px: 5, py: 1.5, fontWeight: 700 }}
              >
                Add to Cart
              </Button>
            </Box>

            {isAdmin && (
              <Box mt={6} display="flex" gap={2} justifyContent="flex-start">
                <Button
                  variant="outlined"
                  onClick={() => history.push(`/products/${productId}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    await dispatch(deleteProductThunk(id));
                    history.push("/products");
                  }}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* License cards section */}
        {type === "beat" && licenses.length > 0 && (
          <Box mt={10}>
            <Typography variant="h5" fontWeight={900} gutterBottom textAlign="center" sx={{ mb: 5 }}>
              License Options
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {licenses.map((license) => (
                <Grid item xs={12} sm={6} md={3} key={license.id}>
                  <Paper
                    elevation={6}
                    sx={{
                      background: "#1c1c1c",
                      borderRadius: 4,
                      px: 4,
                      py: 4,
                      border: selectedLicenseId === license.id ? "3px solid #ff4081" : "1px solid #333",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#ff6699",
                        boxShadow: "0 8px 20px rgba(255, 64, 129, 0.5)",
                      },
                    }}
                    onClick={() => setSelectedLicenseId(license.id)}
                  >
                    <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">
                      {license.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Price: ${license.price}
                    </Typography>
                    {/* Add any extra license details here if needed */}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;

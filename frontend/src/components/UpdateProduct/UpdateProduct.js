import React, { useEffect, useState } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    MenuItem,
    Box,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductThunk, updateProductThunk } from "../../store/products";

const UpdateProductPage = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const history = useHistory();

    const product = useSelector((state) => state.products.singleProduct);
    const currentUser = useSelector((state) => state.session.user);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "beat",
        price: "",
        imageUrl: "",
        audioUrl: "",
        audioPreviewUrl: "",
    });

    useEffect(() => {
        dispatch(getSingleProductThunk(productId));
    }, [dispatch, productId]);

    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || "",
                description: product.description || "",
                type: product.type || "beat",
                price: product.price || "",
                imageUrl: product.imageUrl || "",
                audioUrl: product.audioUrl || "",
                audioPreviewUrl: product.audioPreviewUrl || "",
            });
        }
    }, [product]);

    const isAdmin = currentUser?.email === "adamelh1999@gmail.com";

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clone formData so we can modify it before sending
        const dataToSend = { ...formData };

        // Ensure correct type formatting
        if (!['beat', 'loop_kit', 'drum_kit'].includes(dataToSend.type)) {
          console.error("❌ Invalid product type:", dataToSend.type);
          return;
        }

        // Ensure price is null for beats (since licensing determines price)
        if (dataToSend.type === 'beat') {
          dataToSend.price = null;
        }

        // Rename audioPreviewUrl if needed (e.g., from "YouTube Preview URL")
        dataToSend.youtubeLink = dataToSend.audioPreviewUrl;
        delete dataToSend.audioPreviewUrl;

        // Optionally remove fields not handled by backend
        delete dataToSend.imageUrl;
        delete dataToSend.audioUrl;

        // Dispatch the update thunk
        const updatedProduct = await dispatch(updateProductThunk(productId, dataToSend));
        console.log("✅ Updated Product:", updatedProduct);

        if (updatedProduct) {
          history.push(`/products/${productId}`);
        }
      };


    if (!isAdmin) return <Typography>You are not authorized to edit this product.</Typography>;

    return (
        <Box sx={{ backgroundColor: "#0d0d0d", minHeight: "100vh", py: 10 }}>
            <Container maxWidth="sm">
                <Typography variant="h4" fontWeight={800} textAlign="center" color="primary.main" gutterBottom>
                    Update Product
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            label="Type"
                            onChange={handleChange}
                        >
                            <MenuItem value="beat">Beat</MenuItem>
                            <MenuItem value="loop_kit">Loop Kit</MenuItem> {/* ✅ fix */}
                            <MenuItem value="drum_kit">Drum Kit</MenuItem> {/* ✅ fix */}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        type="number"
                        label="Default Price (for non-beats)"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Image URL"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="Audio URL"
                        name="audioUrl"
                        value={formData.audioUrl}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        fullWidth
                        label="YouTube Preview URL"
                        name="audioPreviewUrl"
                        value={formData.audioPreviewUrl}
                        onChange={handleChange}
                        sx={{ mb: 4 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            py: 1.5,
                            fontWeight: 700,
                            borderRadius: "30px",
                            background: "linear-gradient(135deg, #ff4081, #ff6699)",
                            boxShadow: "0 8px 30px rgba(255, 64, 129, 0.3)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #ff6699, #ff4081)",
                            },
                        }}
                    >
                        Update Product
                    </Button>
                </form>
            </Container>
        </Box>
    );
};

export default UpdateProductPage;

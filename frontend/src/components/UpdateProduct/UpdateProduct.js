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

  // Form state for text fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "beat",
    price: "",
    audioPreviewUrl: "",
    youtubeLink: "", // optional, could be same as audioPreviewUrl
  });

  // State for file inputs
  const [imageFile, setImageFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [wavFile, setWavFile] = useState(null);

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
        audioPreviewUrl: product.youtubeLink || "", // assuming backend uses youtubeLink
        youtubeLink: product.youtubeLink || "",
      });
      // Optionally clear file inputs on product load
      setImageFile(null);
      setZipFile(null);
      setMp3File(null);
      setWavFile(null);
    }
  }, [product]);

  const isAdmin = currentUser?.email === "adamelh1999@gmail.com";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // File input handlers
  const handleImageChange = (e) => setImageFile(e.target.files[0]);
  const handleZipFileChange = (e) => setZipFile(e.target.files[0]);
  const handleMp3FileChange = (e) => setMp3File(e.target.files[0]);
  const handleWavFileChange = (e) => setWavFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build FormData since we have files
    const dataToSend = new FormData();

    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("type", formData.type);

    if (formData.type !== "beat") {
      dataToSend.append("price", formData.price);
    } else {
      dataToSend.append("price", ""); // or null - backend expects no price for beats
    }

    // Send youtubeLink as backend expects it
    dataToSend.append("youtubeLink", formData.audioPreviewUrl);

    // Append files only if new ones selected
    if (imageFile) dataToSend.append("image", imageFile);
    if (zipFile) dataToSend.append("zipFile", zipFile);
    if (mp3File) dataToSend.append("mp3File", mp3File);
    if (wavFile) dataToSend.append("wavFile", wavFile);

    const updatedProduct = await dispatch(updateProductThunk(productId, dataToSend));

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

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 3 }}
            required
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
            <Select name="type" value={formData.type} label="Type" onChange={handleChange} required>
              <MenuItem value="beat">Beat</MenuItem>
              <MenuItem value="loop_kit">Loop Kit</MenuItem>
              <MenuItem value="drum_kit">Drum Kit</MenuItem>
            </Select>
          </FormControl>
          {formData.type !== "beat" && (
            <TextField
              fullWidth
              type="number"
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              sx={{ mb: 3 }}
              required
            />
          )}

          <TextField
            fullWidth
            label="YouTube Audio Preview URL"
            name="audioPreviewUrl"
            value={formData.audioPreviewUrl}
            onChange={handleChange}
            sx={{ mb: 3 }}
            required
          />

          {/* File Inputs */}
          <label>
            Image Upload:
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          <label>
            ZIP File:
            <input type="file" accept=".zip" onChange={handleZipFileChange} />
          </label>

          <label>
            MP3 File:
            <input type="file" accept=".mp3" onChange={handleMp3FileChange} />
          </label>

          <label>
            WAV File:
            <input type="file" accept=".wav" onChange={handleWavFileChange} />
          </label>

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
              mt: 3,
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

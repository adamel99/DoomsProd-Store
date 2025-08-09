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
  Grid,
  Card,
  CardMedia,
  CardContent,
  Link,
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
    audioPreviewUrl: "",
    youtubeLink: "",
  });

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
        audioPreviewUrl: product.youtubeLink || "",
        youtubeLink: product.youtubeLink || "",
      });

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

  const handleImageChange = (e) => setImageFile(e.target.files[0]);
  const handleZipFileChange = (e) => setZipFile(e.target.files[0]);
  const handleMp3FileChange = (e) => setMp3File(e.target.files[0]);
  const handleWavFileChange = (e) => setWavFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("description", formData.description);
    dataToSend.append("type", formData.type);
    if (formData.type !== "beat") {
      dataToSend.append("price", formData.price);
    } else {
      dataToSend.append("price", "");
    }
    dataToSend.append("youtubeLink", formData.audioPreviewUrl);
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
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={800} textAlign="center" color="primary.main" gutterBottom>
          Update Product
        </Typography>

        {/* File previews */}
        {product && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {product.imageUrl && (
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardMedia component="img" height="200" image={product.imageUrl} alt="Current product image" />
                  <CardContent>
                    <Typography variant="subtitle1" textAlign="center">Current Image</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {product.downloadUrls?.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Current Files:</Typography>
                  {product.downloadUrls.map((file, i) => (
                    <Link
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener"
                      underline="hover"
                      display="block"
                      sx={{ color: "#90caf9" }}
                    >
                      {file.type.toUpperCase()} File
                    </Link>
                  ))}
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} required />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                  <MenuItem value="beat">Beat</MenuItem>
                  <MenuItem value="loop_kit">Loop Kit</MenuItem>
                  <MenuItem value="drum_kit">Drum Kit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.type !== "beat" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="YouTube Audio Preview URL"
                name="audioPreviewUrl"
                value={formData.audioPreviewUrl}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
    Replace Files (optional)
  </Typography>

  <Box sx={{ display: "grid", gap: 2 }}>
    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        Replace Image File:
      </Typography>
      <input type="file" accept="image/*" onChange={handleImageChange} />
    </Box>

    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        Replace ZIP File:
      </Typography>
      <input type="file" accept=".zip" onChange={handleZipFileChange} />
    </Box>

    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        Replace MP3 File:
      </Typography>
      <input type="file" accept=".mp3" onChange={handleMp3FileChange} />
    </Box>

    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        Replace WAV File:
      </Typography>
      <input type="file" accept=".wav" onChange={handleWavFileChange} />
    </Box>
  </Box>
</Grid>


            <Grid item xs={12}>
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
                  mt: 2,
                }}
              >
                Update Product
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
};

export default UpdateProductPage;

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

const Panel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    background: theme.custom.clay.surfaceSoft,
    border: theme.custom.clay.border,
    borderRadius: "20px",
    boxShadow: theme.custom.clay.raised,
    ...sx,
  })}>
    {children}
  </Box>
);

const uploadBoxSx = (theme) => ({
  p: 2,
  border: theme.custom.clay.hairline,
  borderRadius: "14px",
  background: "rgba(241,218,191,0.32)",
});

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
    genre: "",
    bpm: "",
    key: "",
    artistTags: "",
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
        audioPreviewUrl: product.audioPreviewUrl || "",
        youtubeLink: product.youtubeLink || "",
        genre: product.genre || "",
        bpm: product.bpm || "",
        key: product.key || "",
        artistTags: product.artistTags || "",
      });

      setImageFile(null);
      setZipFile(null);
      setMp3File(null);
      setWavFile(null);
    }
  }, [product]);

  const isAdmin = currentUser?.role === "admin";
  const isBeat = formData.type === "beat";
  const isPlugin = formData.type === "plugin";
  const needsAudioFiles = !isPlugin;

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
    dataToSend.append("genre", formData.genre);
    dataToSend.append("bpm", formData.bpm);
    dataToSend.append("key", formData.key);
    dataToSend.append("artistTags", formData.artistTags);
    if (formData.type !== "beat") {
      dataToSend.append("price", formData.price);
    } else {
      dataToSend.append("price", "");
    }
    dataToSend.append("audioPreviewUrl", formData.audioPreviewUrl);
    dataToSend.append("youtubeLink", formData.youtubeLink);
    if (imageFile) dataToSend.append("image", imageFile);
    if (zipFile) dataToSend.append("zipFile", zipFile);
    if (needsAudioFiles && mp3File) dataToSend.append("mp3File", mp3File);
    if (needsAudioFiles && wavFile) dataToSend.append("wavFile", wavFile);

    const updatedProduct = await dispatch(updateProductThunk(productId, dataToSend));
    if (updatedProduct) {
      history.push(`/products/${productId}`);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 3,
      }}>
        <Panel sx={{ p: 4, maxWidth: 520, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Access restricted
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            You are not authorized to edit this product.
          </Typography>
        </Panel>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Catalog Admin
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.35rem", md: "3.4rem" } }}>
            Update Product
          </Typography>
        </Box>

        {/* File previews */}
        {product && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {product.imageUrl && (
              <Grid item xs={12} sm={6}>
                <Card sx={(theme) => ({
                  overflow: "hidden",
                  background: theme.custom.clay.surfaceSoft,
                  border: theme.custom.clay.border,
                  boxShadow: theme.custom.clay.raised,
                })}>
                  <CardMedia component="img" height="200" image={product.imageUrl} alt="Current product image" />
                  <CardContent>
                    <Typography variant="subtitle1" textAlign="center" sx={{ fontWeight: 800 }}>
                      Current Image
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {product.downloadUrls?.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Card sx={(theme) => ({
                  p: 2.5,
                  height: "100%",
                  background: theme.custom.clay.surfaceSoft,
                  border: theme.custom.clay.border,
                  boxShadow: theme.custom.clay.raised,
                })}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    Current Files
                  </Typography>
                  {product.downloadUrls.map((file, i) => (
                    <Link
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      display="block"
                      sx={{
                        color: "primary.dark",
                        fontFamily: (theme) => theme.custom.fonts.mono,
                        fontSize: "0.82rem",
                        py: 0.4,
                      }}
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
        <Box
          component="form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          sx={(theme) => ({
            p: { xs: 2.5, md: 4 },
            background: theme.custom.clay.surfaceSoft,
            border: theme.custom.clay.border,
            borderRadius: "24px",
            boxShadow: theme.custom.clay.raised,
          })}
        >
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
                required={isPlugin}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                  <MenuItem value="beat">Beat</MenuItem>
                  <MenuItem value="loop_kit">Loop Kit</MenuItem>
                  <MenuItem value="drum_kit">Drum Kit</MenuItem>
                  <MenuItem value="plugin">Plugin</MenuItem>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                helperText={isBeat ? "" : "Optional for kits and plugins."}
                required={isBeat}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="BPM"
                name="bpm"
                value={formData.bpm}
                onChange={handleChange}
                inputProps={{ min: 1, max: 999, step: 1 }}
                helperText={isBeat ? "" : "Optional for kits and plugins."}
                required={isBeat}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                helperText={isBeat ? "" : "Optional for kits and plugins."}
                required={isBeat}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Artist / Type-Beat Tags"
                name="artistTags"
                value={formData.artistTags}
                onChange={handleChange}
                placeholder="Rylo Rodriguez, NoCap, emotional trap"
                helperText={isBeat ? "Separate tags with commas." : "Optional for kits and plugins. Separate tags with commas."}
                required={isBeat}
              />
            </Grid>

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
              <TextField
                fullWidth
                label="YouTube Full Video Link"
                name="youtubeLink"
                value={formData.youtubeLink}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Replace Files (optional)
              </Typography>

              <Box sx={{ display: "grid", gap: 2 }}>
                <Box sx={uploadBoxSx}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                    Replace Image File:
                  </Typography>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </Box>

                <Box sx={uploadBoxSx}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                    Replace ZIP File:
                  </Typography>
                  <input type="file" accept=".zip" onChange={handleZipFileChange} />
                </Box>

                {needsAudioFiles && (
                  <>
                    <Box sx={uploadBoxSx}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                        Replace MP3 File:
                      </Typography>
                      <input type="file" accept=".mp3" onChange={handleMp3FileChange} />
                    </Box>

                    <Box sx={uploadBoxSx}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                        Replace WAV File:
                      </Typography>
                      <input type="file" accept=".wav" onChange={handleWavFileChange} />
                    </Box>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={(theme) => ({
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: "30px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  border: `1px solid ${theme.palette.primary.main}66`,
                  boxShadow: theme.custom.clay.raisedSmall,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    boxShadow: theme.custom.clay.floating,
                  },
                  mt: 2,
                })}
              >
                Update Product
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default UpdateProductPage;

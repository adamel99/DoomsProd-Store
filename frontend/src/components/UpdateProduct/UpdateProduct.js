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
  FormHelperText,
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

const PRODUCT_TYPES = new Set(["beat", "loop_kit", "drum_kit", "plugin"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const ZIP_TYPES = new Set(["application/zip", "application/x-zip-compressed", "application/x-zip"]);
const MP3_TYPES = new Set(["audio/mpeg", "audio/mp3"]);
const WAV_TYPES = new Set(["audio/wav", "audio/wave", "audio/x-wav", "audio/vnd.wave"]);

const fileRules = {
  image: {
    allowedTypes: IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    invalidMessage: "Invalid type. Please upload a JPG, PNG, or WEBP image.",
  },
  zipFile: {
    allowedTypes: ZIP_TYPES,
    allowedExtensions: [".zip"],
    invalidMessage: "Invalid type. Please upload a ZIP file.",
  },
  mp3File: {
    allowedTypes: MP3_TYPES,
    allowedExtensions: [".mp3"],
    invalidMessage: "Invalid type. Please upload an MP3 file.",
  },
  wavFile: {
    allowedTypes: WAV_TYPES,
    allowedExtensions: [".wav"],
    invalidMessage: "Invalid type. Please upload a WAV file.",
  },
};

const hasAllowedExtension = (file, extensions) => {
  const name = file?.name?.toLowerCase() || "";
  return extensions.some((extension) => name.endsWith(extension));
};

const validateOptionalFile = (file, rule) => {
  if (!file) return "";
  if (!rule.allowedTypes.has(file.type) || !hasAllowedExtension(file, rule.allowedExtensions)) {
    return rule.invalidMessage;
  }
  return "";
};

const normalizeApiErrors = (err) => {
  if (Array.isArray(err?.errors)) return err.errors;
  if (err?.errors && typeof err.errors === "object") return Object.values(err.errors);
  return [err?.message || "Something went wrong"];
};

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
  const [formErrors, setFormErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (e.target.name === "type") {
      setFieldErrors((prev) => ({ ...prev, type: "" }));
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (field, setter) => (e) => {
    const file = e.target.files[0];
    const error = validateOptionalFile(file, fileRules[field]);
    setter(error ? null : file || null);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    if (error) e.target.value = "";
  };

  const handleImageChange = handleFileChange("image", setImageFile);
  const handleZipFileChange = handleFileChange("zipFile", setZipFile);
  const handleMp3FileChange = handleFileChange("mp3File", setMp3File);
  const handleWavFileChange = handleFileChange("wavFile", setWavFile);

  const validateForm = () => {
    const nextErrors = {};
    if (!PRODUCT_TYPES.has(formData.type)) nextErrors.type = "Select a product type.";
    nextErrors.image = validateOptionalFile(imageFile, fileRules.image);
    nextErrors.zipFile = validateOptionalFile(zipFile, fileRules.zipFile);
    if (needsAudioFiles) {
      nextErrors.mp3File = validateOptionalFile(mp3File, fileRules.mp3File);
      nextErrors.wavFile = validateOptionalFile(wavFile, fileRules.wavFile);
    }

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    if (!validateForm()) return;

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

    try {
      const updatedProduct = await dispatch(updateProductThunk(productId, dataToSend));
      if (updatedProduct) {
        history.push(`/products/${productId}`);
      }
    } catch (err) {
      const apiErrors = normalizeApiErrors(err);
      const message = apiErrors.join(" ");
      setFormErrors(apiErrors);
      setFieldErrors((prev) => ({
        ...prev,
        ...(message.toLowerCase().includes("product type") ? { type: "Select a valid product type." } : {}),
        ...(message.toLowerCase().includes("image") || message.toLowerCase().includes("upload")
          ? { image: message.includes("Invalid") ? "Invalid type. Please upload a JPG, PNG, or WEBP image." : message }
          : {}),
        ...(message.toLowerCase().includes("zip") ? { zipFile: message } : {}),
        ...(message.toLowerCase().includes("mp3") ? { mp3File: message } : {}),
        ...(message.toLowerCase().includes("wav") ? { wavFile: message } : {}),
      }));
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
          {formErrors.map((err, idx) => (
            <Typography key={idx} color="error" sx={{ mb: 1 }}>
              {err}
            </Typography>
          ))}

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
              <FormControl fullWidth error={Boolean(fieldErrors.type)}>
                <InputLabel>Type</InputLabel>
                <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                  <MenuItem value="beat">Beat</MenuItem>
                  <MenuItem value="loop_kit">Loop Kit</MenuItem>
                  <MenuItem value="drum_kit">Drum Kit</MenuItem>
                  <MenuItem value="plugin">Plugin</MenuItem>
                </Select>
                {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
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
                  {fieldErrors.image && (
                    <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
                      {fieldErrors.image}
                    </FormHelperText>
                  )}
                </Box>

                <Box sx={uploadBoxSx}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                    Replace ZIP File:
                  </Typography>
                  <input type="file" accept=".zip" onChange={handleZipFileChange} />
                  {fieldErrors.zipFile && (
                    <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
                      {fieldErrors.zipFile}
                    </FormHelperText>
                  )}
                </Box>

                {needsAudioFiles && (
                  <>
                    <Box sx={uploadBoxSx}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                        Replace MP3 File:
                      </Typography>
                      <input type="file" accept=".mp3" onChange={handleMp3FileChange} />
                      {fieldErrors.mp3File && (
                        <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
                          {fieldErrors.mp3File}
                        </FormHelperText>
                      )}
                    </Box>

                    <Box sx={uploadBoxSx}>
                      <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 800 }}>
                        Replace WAV File:
                      </Typography>
                      <input type="file" accept=".wav" onChange={handleWavFileChange} />
                      {fieldErrors.wavFile && (
                        <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
                          {fieldErrors.wavFile}
                        </FormHelperText>
                      )}
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

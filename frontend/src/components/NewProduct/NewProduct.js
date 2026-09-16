import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import * as productActions from "../../store/products";

const PRODUCT_TYPES = new Set(["beat", "loop_kit", "drum_kit", "plugin"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const ZIP_TYPES = new Set(["application/zip", "application/x-zip-compressed", "application/x-zip"]);
const MP3_TYPES = new Set(["audio/mpeg", "audio/mp3"]);
const WAV_TYPES = new Set(["audio/wav", "audio/wave", "audio/x-wav", "audio/vnd.wave"]);

const fileRules = {
  image: {
    label: "Image Upload",
    accept: "image/*",
    allowedTypes: IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    invalidMessage: "Invalid type. Please upload a JPG, PNG, or WEBP image.",
    requiredMessage: "Image is required.",
  },
  zipFile: {
    label: "ZIP File",
    accept: ".zip",
    allowedTypes: ZIP_TYPES,
    allowedExtensions: [".zip"],
    invalidMessage: "Invalid type. Please upload a ZIP file.",
    requiredMessage: "ZIP file is required.",
  },
  mp3File: {
    label: "MP3 File",
    accept: ".mp3",
    allowedTypes: MP3_TYPES,
    allowedExtensions: [".mp3"],
    invalidMessage: "Invalid type. Please upload an MP3 file.",
    requiredMessage: "MP3 file is required.",
  },
  wavFile: {
    label: "WAV File",
    accept: ".wav",
    allowedTypes: WAV_TYPES,
    allowedExtensions: [".wav"],
    invalidMessage: "Invalid type. Please upload a WAV file.",
    requiredMessage: "WAV file is required.",
  },
};

const hasAllowedExtension = (file, extensions) => {
  const name = file?.name?.toLowerCase() || "";
  return extensions.some((extension) => name.endsWith(extension));
};

const validateFile = (file, rule) => {
  if (!file) return rule.requiredMessage;
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

const FileInput = ({ name, rule, required, error, onChange }) => (
  <Box sx={(theme) => ({
    p: 2,
    border: error ? `1px solid ${theme.palette.error.main}` : theme.custom.clay.hairline,
    borderRadius: "14px",
    background: theme.custom.transparent(theme.custom.colors.ink, 0.035),
  })}>
    <Typography variant="body2" sx={{ mb: 0.75, color: "text.primary", fontWeight: 800 }}>
      {rule.label}{required ? " *" : ""}
    </Typography>
    <input type="file" accept={rule.accept} onChange={onChange} aria-describedby={`${name}-error`} />
    {error && (
      <FormHelperText id={`${name}-error`} error sx={{ mx: 0, mt: 0.75 }}>
        {error}
      </FormHelperText>
    )}
  </Box>
);

const NewProduct = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [songKey, setSongKey] = useState("");
  const [artistTags, setArtistTags] = useState("");
  const [type, setType] = useState("");

  const [imageFile, setImageFile] = useState(null);

  // Separate file states for each downloadable file type:
  const [zipFile, setZipFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [wavFile, setWavFile] = useState(null);

  const [formErrors, setFormErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const isKit = type === "loop_kit" || type === "drum_kit";
  const isBeat = type === "beat";
  const isPlugin = type === "plugin";
  const hasFixedPrice = isKit || isPlugin;
  const needsAudioFiles = !isPlugin;

  // Handle image file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const error = file ? validateFile(file, fileRules.image) : "";
    setImageFile(error ? null : file || null);
    setFieldErrors((prev) => ({ ...prev, image: error }));
    if (error) e.target.value = "";
  };

  // Handle each download file input change
  const handleZipFileChange = (e) => {
    const file = e.target.files[0];
    const error = file ? validateFile(file, fileRules.zipFile) : "";
    setZipFile(error ? null : file || null);
    setFieldErrors((prev) => ({ ...prev, zipFile: error }));
    if (error) e.target.value = "";
  };
  const handleMp3FileChange = (e) => {
    const file = e.target.files[0];
    const error = file ? validateFile(file, fileRules.mp3File) : "";
    setMp3File(error ? null : file || null);
    setFieldErrors((prev) => ({ ...prev, mp3File: error }));
    if (error) e.target.value = "";
  };
  const handleWavFileChange = (e) => {
    const file = e.target.files[0];
    const error = file ? validateFile(file, fileRules.wavFile) : "";
    setWavFile(error ? null : file || null);
    setFieldErrors((prev) => ({ ...prev, wavFile: error }));
    if (error) e.target.value = "";
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!PRODUCT_TYPES.has(type)) nextErrors.type = "Select a product type.";
    nextErrors.image = validateFile(imageFile, fileRules.image);
    nextErrors.zipFile = validateFile(zipFile, fileRules.zipFile);
    if (needsAudioFiles) {
      nextErrors.mp3File = validateFile(mp3File, fileRules.mp3File);
      nextErrors.wavFile = validateFile(wavFile, fileRules.wavFile);
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

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("audioPreviewUrl", audioPreviewUrl);
      formData.append("youtubeLink", youtubeLink);
      formData.append("genre", genre);
      formData.append("bpm", bpm);
      formData.append("key", songKey);
      formData.append("artistTags", artistTags);

      if (hasFixedPrice) {
        formData.append("price", price || "0");
      }

      if (imageFile) formData.append("image", imageFile);
      if (zipFile) formData.append("zipFile", zipFile);
      if (needsAudioFiles && mp3File) formData.append("mp3File", mp3File);
      if (needsAudioFiles && wavFile) formData.append("wavFile", wavFile);

      const newProduct = await dispatch(productActions.createProductThunk(formData));

      if (newProduct) {
        await dispatch(productActions.getAllProductsThunk());
        history.push("/products");
      }
    } catch (err) {
      const apiErrors = normalizeApiErrors(err);
      setFormErrors(apiErrors);

      const message = apiErrors.join(" ");
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

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
        Create New Product
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {formErrors.map((err, idx) => (
          <Typography key={idx} color="error">
            {err}
          </Typography>
        ))}

        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <TextField
          label="Description"
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required={isPlugin}
        />

        <TextField
          label="YouTube Audio Preview URL"
          value={audioPreviewUrl}
          onChange={(e) => setAudioPreviewUrl(e.target.value)}
          placeholder="https://youtu.be/YA-GG5AWVTs"
          helperText={isPlugin ? "Optional for plugins." : ""}
        />

        <TextField
          label="YouTube Full Video Link (Optional)"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />

        <TextField
          label="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          helperText={isBeat ? "" : "Optional for kits and plugins."}
          required={isBeat}
        />

        <TextField
          label="BPM"
          type="number"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          inputProps={{ min: 1, max: 999, step: 1 }}
          helperText={isBeat ? "" : "Optional for kits and plugins."}
          required={isBeat}
        />

        <TextField
          label="Key"
          value={songKey}
          onChange={(e) => setSongKey(e.target.value)}
          placeholder="C minor"
          helperText={isBeat ? "" : "Optional for kits and plugins."}
          required={isBeat}
        />

        <TextField
          label="Artist / Type-Beat Tags"
          value={artistTags}
          onChange={(e) => setArtistTags(e.target.value)}
          placeholder="Rylo Rodriguez, NoCap, emotional trap"
          helperText={isBeat ? "Separate tags with commas." : "Optional for kits and plugins. Separate tags with commas."}
          required={isBeat}
        />

        <FormControl fullWidth required error={Boolean(fieldErrors.type)}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => {
              const nextType = e.target.value;
              setType(nextType);
              setFieldErrors((prev) => ({ ...prev, type: "" }));
              if (nextType === "beat") setPrice("");
              if (nextType === "plugin") {
                setMp3File(null);
                setWavFile(null);
                setFieldErrors((prev) => ({ ...prev, mp3File: "", wavFile: "" }));
              }
            }}
          >
            <MenuItem value="beat">Beat</MenuItem>
            <MenuItem value="loop_kit">Loop Kit</MenuItem>
            <MenuItem value="drum_kit">Drum Kit</MenuItem>
            <MenuItem value="plugin">Plugin</MenuItem>
          </Select>
          {fieldErrors.type && <FormHelperText>{fieldErrors.type}</FormHelperText>}
        </FormControl>

        {hasFixedPrice && (
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }}
            helperText={isPlugin ? "Set the plugin price." : "Use 0 for a free kit."}
            required
          />
        )}

        <FileInput
          name="image"
          rule={fileRules.image}
          required
          error={fieldErrors.image}
          onChange={handleImageChange}
        />

        <FileInput
          name="zipFile"
          rule={fileRules.zipFile}
          required
          error={fieldErrors.zipFile}
          onChange={handleZipFileChange}
        />

        {needsAudioFiles && (
          <>
            <FileInput
              name="mp3File"
              rule={fileRules.mp3File}
              required
              error={fieldErrors.mp3File}
              onChange={handleMp3FileChange}
            />

            <FileInput
              name="wavFile"
              rule={fileRules.wavFile}
              required
              error={fieldErrors.wavFile}
              onChange={handleWavFileChange}
            />
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            mt: 2,
            fontWeight: 600,
            borderRadius: 99,
            background: "linear-gradient(135deg, #ff4081, #ff6699)",
            boxShadow: "0 8px 30px rgba(255, 64, 129, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #ff6699, #ff4081)",
            },
          }}
        >
          Create Product
        </Button>
      </Box>
    </Container>
  );
};

export default NewProduct;

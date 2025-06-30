import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "@mui/material";
import * as productActions from "../../store/products";

const NewProduct = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.session.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null); // <-- NEW STATE

  const [errors, setErrors] = useState([]);

  // Handle image file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Handle download file input
  const handleDownloadChange = (e) => {
    const file = e.target.files[0];
    setDownloadFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("audioPreviewUrl", audioPreviewUrl);
      formData.append("youtubeLink", youtubeLink);
      formData.append("genre", genre);

      if (type !== "beat") {
        formData.append("price", price);
      }

      if (imageFile) formData.append("image", imageFile);
      if (downloadFile) formData.append("downloadFile", downloadFile); // <-- NEW

      const newProduct = await dispatch(productActions.createProductThunk(formData));

      if (newProduct) {
        await dispatch(productActions.getAllProductsThunk());
        history.push("/products");
      }
    } catch (err) {
      setErrors(err.errors || ["Something went wrong"]);
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
        {errors.map((err, idx) => (
          <Typography key={idx} color="error">{err}</Typography>
        ))}

        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <TextField
          label="Description"
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {type !== "beat" && (
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        )}

        <TextField
          label="YouTube Audio Preview URL"
          value={audioPreviewUrl}
          onChange={(e) => setAudioPreviewUrl(e.target.value)}
          placeholder="https://youtu.be/YA-GG5AWVTs"
          required
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
          required
        />

        <FormControl fullWidth required>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "beat") setPrice("");
            }}
          >
            <MenuItem value="beat">Beat</MenuItem>
            <MenuItem value="loop_kit">Loop Kit</MenuItem>
            <MenuItem value="drum_kit">Drum Kit</MenuItem>
          </Select>
        </FormControl>

        {/* Upload image */}
        <label>
          Image Upload:
          <input type="file" accept="image/*" onChange={handleImageChange} required />
        </label>

        {/* Upload downloadable file */}
        <label>
          Download File (.zip, .wav, .mp3):
          <input
            type="file"
            accept=".zip,.wav,.mp3"
            onChange={handleDownloadChange}
            required
          />
        </label>

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

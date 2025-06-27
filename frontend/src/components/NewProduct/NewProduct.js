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

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("");
  const [imageFile, setImageFile] = useState(null);  // <-- Add this
  const [errors, setErrors] = useState([]);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("title", title);
      formData.append("description", description);
      if (type !== "beat") {
        formData.append("price", price);
      }
      formData.append("audioPreviewUrl", audioPreviewUrl);
      formData.append("youtubeLink", youtubeLink);
      formData.append("genre", genre);
      formData.append("type", type);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const newProduct = await dispatch(productActions.createProductThunk(formData));

      if (newProduct) {
        // ✅ Immediately refresh the full list
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
        encType="multipart/form-data" // <-- important for file upload
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {errors.map((err, idx) => (
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

        {/* Remove the manual Image URL input */}
        {/* Add file upload input instead */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <TextField label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} required />

        <FormControl fullWidth required>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "beat") setPrice(""); // reset price for beats
            }}
          >
            <MenuItem value="beat">Beat</MenuItem>
            <MenuItem value="loop_kit">Loop Kit</MenuItem>
            <MenuItem value="drum_kit">Drum Kit</MenuItem>
          </Select>
        </FormControl>

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

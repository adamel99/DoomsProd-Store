import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogActions, DialogContent, Button, Slider, Box } from "@mui/material";
import getCroppedImg from "./utils/cropImage"; // custom util to extract cropped image from canvas

const aspectRatio = 180 / 140; // Match your card preview

const ImageCropperModal = ({ open, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ height: 400, position: "relative" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Box sx={{ width: 200, mx: 2 }}>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, z) => setZoom(z)}
          />
        </Box>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCropSave} variant="contained" color="primary">
          Crop & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropperModal;

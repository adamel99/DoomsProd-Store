// components/YouTubePlayer.js
import React from "react";
import { Box } from "@mui/material";
import { getYouTubeEmbedUrl } from "../../utils/youtube";

const YouTubePlayer = ({ url }) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <iframe
        width="100%"
        height="180"
        src={embedUrl}
        title="YouTube Beat Preview"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Box>
  );
};

export default YouTubePlayer;

// components/YouTubePlayer.js
import React from "react";
import { Box } from "@mui/material";

const YouTubePlayer = ({ url }) => {
  if (!url) return null;

  // Extract the video ID from either full or short YouTube URLs
  let videoId = null;

  if (url.includes("youtu.be")) {
    videoId = url.split("youtu.be/")[1];
  } else if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  }

  if (!videoId) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <iframe
        width="100%"
        height="180"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube Beat Preview"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Box>
  );
};

export default YouTubePlayer;

import React from "react";
import { Box } from "@mui/material";

const StudioMonitor = ({ side }) => {
  const isLeft = side === "left";
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        [isLeft ? "left" : "right"]: "-180px",
        width: "360px",
        height: "844px",
        transform: `translateY(-50%) perspective(700px) rotateY(${isLeft ? "17deg" : "-17deg"})`,
        opacity: { xs: 0.035, sm: 0.07, md: 0.14, lg: 0.17 },
        filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.22))",
      }}
    >
      <Box
        component="img"
        src="/Images/studio-monitor-realistic.png"
        alt=""
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "fill",
          transform: isLeft ? "none" : "scaleX(-1)",
          userSelect: "none",
        }}
      />
    </Box>
  );
};

const StudioBackdrop = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 1,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    <StudioMonitor side="left" />
    <StudioMonitor side="right" />
  </Box>
);

export default StudioBackdrop;

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
      <svg viewBox="0 0 180 340" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`monitor-case-${side}`} x1="0" y1="0" x2="180" y2="340" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity=".12" />
            <stop offset="1" stopColor="#000000" stopOpacity=".24" />
          </linearGradient>
          <radialGradient id={`monitor-cone-${side}`} cx="0" cy="0" r="1" gradientTransform="translate(90 222) rotate(90) scale(67)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity=".14" />
            <stop offset=".72" stopColor="#000000" stopOpacity=".14" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity=".34" />
          </radialGradient>
        </defs>
        <rect x="8" y="8" width="164" height="324" rx="12" fill={`url(#monitor-case-${side})`} stroke="white" strokeOpacity=".34" strokeWidth="2" />
        <rect x="17" y="17" width="146" height="306" rx="8" stroke="white" strokeOpacity=".12" />
        <circle cx="90" cy="83" r="27" fill="#08090D" fillOpacity=".32" stroke="white" strokeOpacity=".4" strokeWidth="2" />
        <circle cx="90" cy="83" r="15" stroke="white" strokeOpacity=".3" />
        <circle cx="90" cy="83" r="5" fill="white" fillOpacity=".3" />
        <circle cx="90" cy="222" r="68" fill={`url(#monitor-cone-${side})`} stroke="white" strokeOpacity=".4" strokeWidth="2" />
        <circle cx="90" cy="222" r="53" stroke="white" strokeOpacity=".23" />
        <circle cx="90" cy="222" r="34" fill="#08090D" fillOpacity=".24" stroke="white" strokeOpacity=".3" strokeWidth="2" />
        <circle cx="90" cy="222" r="12" fill="white" fillOpacity=".22" />
        <path d="M59 299H121" stroke="white" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="299" r="3" fill="#FF579F" fillOpacity=".7" />
      </svg>
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

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Button,
  Dialog,
  DialogContent,
  Grow,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay10Icon from "@mui/icons-material/Replay10";
import StopIcon from "@mui/icons-material/Stop";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const AudioPlayerContext = createContext(null);

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playTrack = useCallback((nextTrack) => {
    if (!nextTrack?.audioPreviewUrl) return;

    setTrack(nextTrack);
    setIsPlaying(true);
  }, []);

  const toggleTrack = useCallback((nextTrack) => {
    if (!nextTrack?.audioPreviewUrl) return;

    setTrack((currentTrack) => {
      const isSameTrack = currentTrack?.id === nextTrack.id;
      setIsPlaying((wasPlaying) => (isSameTrack ? !wasPlaying : true));
      return isSameTrack ? currentTrack : nextTrack;
    });
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (track?.audioPreviewUrl) setIsPlaying(true);
  }, [track]);

  const stop = useCallback(() => {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const rewind = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const close = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((value) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioPreviewUrl) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("Failed to play product preview:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, track]);

  const value = useMemo(() => ({
    activeTrackId: track?.id || null,
    close,
    currentTime,
    duration,
    isPlaying,
    pause,
    playTrack,
    resume,
    rewind,
    seek,
    setVolume,
    stop,
    toggleTrack,
    volume,
  }), [close, currentTime, duration, isPlaying, pause, playTrack, resume, rewind, seek, stop, toggleTrack, track, volume]);

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.audioPreviewUrl || ""}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={() => setIsPlaying(false)}
      />
      <GlobalAudioPlayer track={track} />
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return context;
};

const GlobalAudioPlayer = ({ track }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    close,
    currentTime,
    duration,
    isPlaying,
    pause,
    resume,
    rewind,
    seek,
    setVolume,
    stop,
    volume,
  } = useAudioPlayer();

  if (!track) return null;

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        left: { xs: 8, md: 24 },
        right: { xs: 8, md: 24 },
        bottom: { xs: 8, md: 22 },
        zIndex: 1400,
        display: "grid",
        gridTemplateColumns: { xs: "38px minmax(0, 1fr) auto 34px 34px", md: "56px minmax(0, 1fr) 360px 48px 48px" },
        gap: { xs: 0.75, md: 2 },
        alignItems: "center",
        p: { xs: 0.75, md: 1.5 },
        borderRadius: { xs: "14px", md: "18px" },
        background: theme.custom.clay.surfaceSoft,
        border: theme.custom.clay.border,
        boxShadow: theme.custom.clay.floating,
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
      })}
    >
      <Box
        component="img"
        src={track.imageUrl || "/placeholder.jpg"}
        alt={track.title}
        sx={{
          width: { xs: 38, md: 56 },
          height: { xs: 38, md: 56 },
          borderRadius: { xs: "10px", md: "12px" },
          objectFit: "cover",
          bgcolor: "background.paper",
        }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography
          component={RouterLink}
          to={`/products/${track.id}`}
          sx={{
          fontWeight: 700,
          fontSize: { xs: "0.82rem", md: "1rem" },
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "inherit",
          textDecoration: "none",
          "&:hover": { color: "primary.main" },
        }}>
          {track.title}
        </Typography>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "40px minmax(0, 1fr) 40px" },
          gap: { xs: 0, md: 1 },
          alignItems: "center",
          mt: { xs: 0.15, md: 0.8 },
          "& .MuiSlider-root": {
            py: { xs: 0.35, md: 1 },
          },
          "& .MuiSlider-thumb": {
            width: { xs: 10, md: 12 },
            height: { xs: 10, md: 12 },
          },
        }}>
          <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono }}>
            {formatTime(currentTime)}
          </Typography>
          <Slider
            size="small"
            min={0}
            max={duration || 0}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e, value) => seek(Number(value))}
            aria-label="Audio progress"
          />
          <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono, textAlign: "right" }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        gridColumn: "auto",
        display: "flex",
        gap: { xs: 0, md: 0.75 },
        alignItems: "center",
        justifyContent: "center",
      }}>
        <IconButton aria-label="Rewind 10 seconds" onClick={rewind} sx={{ display: { xs: "none", md: "inline-flex" } }}>
          <Replay10Icon fontSize="small" />
        </IconButton>
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={isPlaying ? pause : resume}
          sx={{
            width: { xs: 38, md: 48 },
            height: { xs: 38, md: 48 },
            minWidth: { xs: 38, md: 48 },
            minHeight: { xs: 38, md: 48 },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton aria-label="Stop" onClick={stop} sx={{ display: { xs: "none", md: "inline-flex" } }}>
          <StopIcon fontSize="small" />
        </IconButton>
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, width: 150 }}>
          <VolumeDownIcon sx={{ color: "text.secondary", fontSize: 18 }} />
          <Slider
            size="small"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e, value) => setVolume(Number(value))}
            aria-label="Volume"
          />
          <VolumeUpIcon sx={{ color: "text.secondary", fontSize: 18, display: { xs: "none", sm: "block" } }} />
        </Box>
      </Box>

      <IconButton
        aria-label="Expand audio player"
        onClick={() => setIsExpanded(true)}
        sx={{
          width: { xs: 34, md: 48 },
          height: { xs: 34, md: 48 },
          minWidth: { xs: 34, md: 48 },
          minHeight: { xs: 34, md: 48 },
        }}
      >
        <OpenInFullIcon sx={{ fontSize: { xs: 17, md: 20 } }} />
      </IconButton>

      <IconButton
        aria-label="Close player"
        onClick={close}
        sx={{
          width: { xs: 34, md: 48 },
          height: { xs: 34, md: 48 },
          minWidth: { xs: 34, md: 48 },
          minHeight: { xs: 34, md: 48 },
        }}
      >
        <CloseIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
      </IconButton>

      <Dialog
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        fullScreen
        TransitionComponent={Grow}
        TransitionProps={{
          timeout: { enter: 520, exit: 360 },
          style: { transformOrigin: "50% calc(100% - 42px)" },
        }}
        sx={{ zIndex: 1600 }}
        PaperProps={{
          sx: (theme) => ({
            color: "text.primary",
            backgroundColor: theme.custom.colors.clayDeep,
            backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(255,87,159,0.2), transparent 48%), linear-gradient(145deg, rgba(255,255,255,0.04), transparent 48%)",
            transformOrigin: "50% calc(100% - 42px)",
          }),
        }}
        aria-labelledby="expanded-player-title"
      >
        <DialogContent sx={{ display: "flex", justifyContent: "center", overflowY: "auto", px: { xs: 2.5, sm: 4 }, py: { xs: 2, sm: 4 } }}>
          <Box sx={{ width: "100%", maxWidth: 520, minHeight: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 2.5, sm: 4 } }}>
              <IconButton aria-label="Collapse audio player" onClick={() => setIsExpanded(false)}>
                <KeyboardArrowDownIcon />
              </IconButton>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "text.secondary" }}>
                Now playing
              </Typography>
              <IconButton aria-label="Close player" onClick={close}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ width: "min(72vw, 360px)", aspectRatio: "1 / 1", mx: "auto", mb: { xs: 3, sm: 4 }, borderRadius: { xs: "24px", sm: "32px" }, overflow: "hidden", boxShadow: (theme) => theme.custom.clay.floating, border: (theme) => theme.custom.clay.border, bgcolor: "background.paper" }}>
              <Box component="img" src={track.imageUrl || "/placeholder.jpg"} alt={track.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </Box>

            <Box sx={{ mb: 1.25 }}>
              <Typography sx={{ fontFamily: (theme) => theme.custom.fonts.mono, fontSize: "0.68rem", letterSpacing: "1.6px", textTransform: "uppercase", color: "primary.main", mb: 0.6 }}>
                {String(track.type || "Product").replace(/_/g, " ")}
              </Typography>
              <Typography id="expanded-player-title" variant="h1" sx={{ fontSize: { xs: "1.8rem", sm: "2.25rem" }, lineHeight: 1.05, overflowWrap: "anywhere" }}>
                {track.title}
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "42px minmax(0, 1fr) 42px", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono }}>{formatTime(currentTime)}</Typography>
              <Slider min={0} max={duration || 0} value={Math.min(currentTime, duration || 0)} onChange={(e, value) => seek(Number(value))} aria-label="Audio progress" />
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono, textAlign: "right" }}>{formatTime(duration)}</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 2, sm: 3 }, mb: 2.5 }}>
              <IconButton aria-label="Rewind 10 seconds" onClick={rewind} sx={{ width: 48, height: 48 }}><Replay10Icon /></IconButton>
              <IconButton aria-label={isPlaying ? "Pause" : "Play"} onClick={isPlaying ? pause : resume} sx={(theme) => ({ width: 68, height: 68, color: "primary.contrastText", background: theme.custom.gradients.brand, boxShadow: theme.custom.clay.raisedSmall, "&:hover": { background: theme.custom.gradients.brandHover, transform: "scale(1.04)" } })}>
                {isPlaying ? <PauseIcon sx={{ fontSize: 34 }} /> : <PlayArrowIcon sx={{ fontSize: 38, ml: 0.4 }} />}
              </IconButton>
              <IconButton aria-label="Stop" onClick={stop} sx={{ width: 48, height: 48 }}><StopIcon /></IconButton>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, width: "min(100%, 280px)", mx: "auto", mb: 3 }}>
              <VolumeDownIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              <Slider min={0} max={1} step={0.01} value={volume} onChange={(e, value) => setVolume(Number(value))} aria-label="Volume" />
              <VolumeUpIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            </Box>

            <Button
              component={RouterLink}
              to={`/products/${track.id}`}
              onClick={() => setIsExpanded(false)}
              variant="outlined"
              sx={{ alignSelf: "center", px: 3, mt: "auto", mb: { xs: 1, sm: 2 } }}
            >
              View {track.type === "beat" ? "beat" : "product"} details
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

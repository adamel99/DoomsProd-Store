import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay10Icon from "@mui/icons-material/Replay10";
import StopIcon from "@mui/icons-material/Stop";
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
        left: { xs: 12, md: 24 },
        right: { xs: 12, md: 24 },
        bottom: { xs: 12, md: 22 },
        zIndex: 1400,
        display: "grid",
        gridTemplateColumns: { xs: "44px minmax(0, 1fr) auto", md: "56px minmax(0, 1fr) 360px auto" },
        gap: { xs: 1.25, md: 2 },
        alignItems: "center",
        p: { xs: 1.25, md: 1.5 },
        borderRadius: "18px",
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
          width: { xs: 44, md: 56 },
          height: { xs: 44, md: 56 },
          borderRadius: "12px",
          objectFit: "cover",
          bgcolor: "background.paper",
        }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{
          fontWeight: 800,
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {track.title}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) 40px", gap: 1, alignItems: "center", mt: 0.8 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono }}>
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
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: (theme) => theme.custom.fonts.mono, textAlign: "right" }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        gridColumn: { xs: "1 / -1", md: "auto" },
        display: "flex",
        gap: 0.75,
        alignItems: "center",
        justifyContent: { xs: "space-between", md: "center" },
      }}>
        <IconButton aria-label="Rewind 10 seconds" onClick={rewind}>
          <Replay10Icon fontSize="small" />
        </IconButton>
        <IconButton aria-label={isPlaying ? "Pause" : "Play"} onClick={isPlaying ? pause : resume}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton aria-label="Stop" onClick={stop}>
          <StopIcon fontSize="small" />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: 124, md: 150 } }}>
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

      <IconButton aria-label="Close player" onClick={close}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

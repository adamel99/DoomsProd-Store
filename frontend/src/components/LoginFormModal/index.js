import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import {
  Box, Button, TextField, Typography, Alert, IconButton, InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    color: "#FFEAEC",
    fontFamily: `"DM Sans", sans-serif`,
    backdropFilter: "blur(8px)",
    boxShadow: "4px 4px 12px rgba(0,0,0,0.4), -1px -1px 4px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(228,63,111,0.5)",
      boxShadow: "0 0 0 3px rgba(228,63,111,0.08)",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: `"DM Sans", sans-serif`,
    color: "rgba(255,234,236,0.35)",
    "&.Mui-focused": { color: "#E43F6F" },
  },
  input: { color: "#FFEAEC" },
};

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const isDisabled = credential.length < 4 || password.length < 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
      });
  };

  return (
    <Box sx={{
      width: { xs: 320, sm: 400 },
      background: "linear-gradient(160deg, rgba(28,20,24,0.97), rgba(16,11,14,0.98))",
      backdropFilter: "blur(40px)",
      WebkitBackdropFilter: "blur(40px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderTop: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "28px",
      boxShadow: [
        "0 1px 0 rgba(255,255,255,0.07) inset",
        "0 32px 80px rgba(0,0,0,0.8)",
        "10px 10px 32px rgba(0,0,0,0.5)",
        "-3px -3px 12px rgba(255,255,255,0.015)",
      ].join(", "),
      px: { xs: 3, sm: 4.5 },
      py: 5,
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Subtle top glow */}
      <Box sx={{
        position: "absolute",
        top: -60, left: "50%",
        transform: "translateX(-50%)",
        width: 200, height: 100,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(228,63,111,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo dot + title */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          width: 10, height: 10, borderRadius: "50%",
          bgcolor: "#E43F6F",
          boxShadow: "0 0 10px rgba(228,63,111,1), 0 0 24px rgba(228,63,111,0.5)",
          mx: "auto", mb: 2,
        }} />
        <Typography sx={{
          fontFamily: `"Syne", sans-serif`,
          fontWeight: 900,
          fontSize: "1.75rem",
          color: "#FFEAEC",
          letterSpacing: "-0.5px",
        }}>
          Welcome back
        </Typography>
        <Typography sx={{
          fontFamily: `"DM Sans", sans-serif`,
          fontSize: "0.85rem",
          color: "rgba(255,234,236,0.35)",
          mt: 0.75,
        }}>
          Sign in to your account
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField
          label="Username or Email"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          fullWidth
          required
          sx={fieldSx}
        />
        {errors.credential && (
          <Alert severity="error" sx={{ bgcolor: "rgba(228,63,111,0.1)", color: "#E43F6F", border: "1px solid rgba(228,63,111,0.2)", borderRadius: "12px", "& .MuiAlert-icon": { color: "#E43F6F" } }}>
            {errors.credential}
          </Alert>
        )}

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small"
                  sx={{ color: "rgba(255,234,236,0.3)", "&:hover": { color: "#E43F6F" } }}>
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {errors.password && (
          <Alert severity="error" sx={{ bgcolor: "rgba(228,63,111,0.1)", color: "#E43F6F", border: "1px solid rgba(228,63,111,0.2)", borderRadius: "12px", "& .MuiAlert-icon": { color: "#E43F6F" } }}>
            {errors.password}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={isDisabled}
          sx={{
            mt: 1,
            py: 1.5,
            fontFamily: `"Syne", sans-serif`,
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.5px",
            textTransform: "none",
            borderRadius: "14px",
            background: isDisabled
              ? "rgba(255,255,255,0.04)"
              : "linear-gradient(135deg, #E43F6F, #c02d5a)",
            color: isDisabled ? "rgba(255,234,236,0.2)" : "#fff",
            border: isDisabled
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(228,63,111,0.4)",
            boxShadow: isDisabled
              ? "4px 4px 12px rgba(0,0,0,0.4)"
              : "0 6px 20px rgba(228,63,111,0.4), 4px 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.25s ease",
            "&:hover:not(:disabled)": {
              background: "linear-gradient(135deg, #f0537f, #d03568)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 28px rgba(228,63,111,0.5), 4px 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            },
          }}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
};

export default LoginFormModal;

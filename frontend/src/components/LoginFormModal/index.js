import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import {
  Box, Button, TextField, Typography, Alert, IconButton, InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const fieldSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    background: theme.custom.clay.surfaceSoft,
    borderRadius: "14px",
    color: theme.palette.text.primary,
    fontFamily: theme.custom.fonts.body,
    boxShadow: theme.custom.clay.pressed,
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: theme.palette.divider },
    "&:hover fieldset": { borderColor: `${theme.palette.primary.main}55` },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: theme.custom.fonts.body,
    color: theme.palette.text.secondary,
    "&.Mui-focused": { color: theme.palette.primary.main },
  },
  input: { color: theme.palette.text.primary },
});

const errorAlertSx = (theme) => ({
  bgcolor: `${theme.palette.primary.main}18`,
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.primary.main}44`,
  borderRadius: "12px",
  boxShadow: theme.custom.clay.raisedSmall,
  "& .MuiAlert-icon": { color: theme.palette.primary.main },
});

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
    <Box sx={(theme) => ({
      width: { xs: 320, sm: 400 },
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "28px",
      boxShadow: theme.custom.clay.floating,
      px: { xs: 3, sm: 4.5 },
      py: 5,
      position: "relative",
      overflow: "hidden",
    })}>

      {/* Subtle top glow */}
      <Box sx={{
        position: "absolute",
        top: -60, left: "50%",
        transform: "translateX(-50%)",
        width: 200, height: 100,
        borderRadius: "50%",
        background: (theme) => `radial-gradient(ellipse, ${theme.palette.primary.main}33 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Logo dot + title */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          width: 10, height: 10, borderRadius: "50%",
          bgcolor: "primary.main",
          boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}, 0 0 24px ${theme.palette.primary.main}80`,
          mx: "auto", mb: 2,
        }} />
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 900,
          fontSize: "1.75rem",
          color: "text.primary",
          letterSpacing: 0,
        }}>
          Welcome back
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.body,
          fontSize: "0.85rem",
          color: "text.secondary",
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
          <Alert severity="error" sx={errorAlertSx}>
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
                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {errors.password && (
          <Alert severity="error" sx={errorAlertSx}>
            {errors.password}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={isDisabled}
          sx={(theme) => ({
            mt: 1,
            py: 1.5,
            fontFamily: theme.custom.fonts.display,
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.5px",
            textTransform: "none",
            borderRadius: "14px",
            background: isDisabled
              ? theme.custom.clay.surfaceSoft
              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: isDisabled ? theme.palette.text.disabled : theme.palette.primary.contrastText,
            border: isDisabled
              ? theme.custom.clay.hairline
              : `1px solid ${theme.palette.primary.main}66`,
            boxShadow: isDisabled
              ? theme.custom.clay.pressed
              : theme.custom.clay.raisedSmall,
            transition: "all 0.25s ease",
            "&:hover:not(:disabled)": {
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              transform: "translateY(-1px)",
              boxShadow: theme.custom.clay.floating,
            },
          })}
        >
          Log In
        </Button>
      </Box>
    </Box>
  );
};

export default LoginFormModal;

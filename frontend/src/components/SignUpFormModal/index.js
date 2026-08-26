import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import { Box, Button, TextField, Typography, Alert, Grid, IconButton, InputAdornment } from "@mui/material";
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
  mt: 1,
  bgcolor: `${theme.palette.primary.main}18`,
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.primary.main}44`,
  borderRadius: "12px",
  boxShadow: theme.custom.clay.raisedSmall,
  "& .MuiAlert-icon": { color: theme.palette.primary.main },
});

function SignupFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [email, setEmail]                   = useState("");
  const [username, setUsername]             = useState("");
  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [errors, setErrors]                 = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return setErrors({ confirmPassword: "Passwords do not match" });
    setErrors({});
    try {
      await dispatch(sessionActions.signup({ email, username, firstName, lastName, password }));
      closeModal();
    } catch (res) {
      const data = await res.json();
      if (data?.errors) setErrors(data.errors);
    }
  };

  const fields = [
    { label: "Email",            value: email,           setter: setEmail,           error: errors.email,           half: false },
    { label: "Username",         value: username,        setter: setUsername,        error: errors.username,        half: false },
    { label: "First Name",       value: firstName,       setter: setFirstName,       error: errors.firstName,       half: true  },
    { label: "Last Name",        value: lastName,        setter: setLastName,        error: errors.lastName,        half: true  },
    { label: "Password",         value: password,        setter: setPassword,        error: errors.password,        half: false, type: "password", toggle: [showPassword, setShowPassword] },
    { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, error: errors.confirmPassword, half: false, type: "password", toggle: [showConfirm,   setShowConfirm]   },
  ];

  return (
    <Box sx={(theme) => ({
      width: { xs: 340, sm: 460 },
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "28px",
      boxShadow: theme.custom.clay.floating,
      px: { xs: 3, sm: 4.5 },
      py: 5,
      position: "relative",
      overflow: "hidden",
    })}>

      {/* Top glow */}
      <Box sx={{
        position: "absolute",
        top: -60, left: "50%",
        transform: "translateX(-50%)",
        width: 220, height: 100,
        borderRadius: "50%",
        background: (theme) => `radial-gradient(ellipse, ${theme.palette.primary.main}33 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

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
          Create Account
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.body,
          fontSize: "0.85rem",
          color: "text.secondary",
          mt: 0.75,
        }}>
          Join and start creating
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          {fields.map(({ label, value, setter, error, half, type, toggle }, i) => {
            const [show, setShow] = toggle || [];
            return (
              <Grid item xs={12} sm={half ? 6 : 12} key={i}>
                <TextField
                  label={label}
                  fullWidth
                  required
                  type={type ? (show ? "text" : "password") : "text"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  sx={fieldSx}
                  InputProps={toggle ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShow((p) => !p)} edge="end" size="small"
                          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                          {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined}
                />
                {error && (
                  <Alert severity="error" sx={errorAlertSx}>
                    {error}
                  </Alert>
                )}
              </Grid>
            );
          })}
        </Grid>

        <Button
          type="submit"
          fullWidth
          sx={(theme) => ({
            mt: 3,
            py: 1.5,
            fontFamily: theme.custom.fonts.display,
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.5px",
            textTransform: "none",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: theme.palette.primary.contrastText,
            border: `1px solid ${theme.palette.primary.main}66`,
            boxShadow: theme.custom.clay.raisedSmall,
            transition: "all 0.25s ease",
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              transform: "translateY(-1px)",
              boxShadow: theme.custom.clay.floating,
            },
          })}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  );
}

export default SignupFormModal;

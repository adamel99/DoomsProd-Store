import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import { Box, Button, TextField, Typography, Alert, Grid, IconButton, InputAdornment } from "@mui/material";
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
    <Box sx={{
      width: { xs: 340, sm: 460 },
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

      {/* Top glow */}
      <Box sx={{
        position: "absolute",
        top: -60, left: "50%",
        transform: "translateX(-50%)",
        width: 220, height: 100,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(228,63,111,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

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
          Create Account
        </Typography>
        <Typography sx={{
          fontFamily: `"DM Sans", sans-serif`,
          fontSize: "0.85rem",
          color: "rgba(255,234,236,0.35)",
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
                          sx={{ color: "rgba(255,234,236,0.3)", "&:hover": { color: "#E43F6F" } }}>
                          {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 1, bgcolor: "rgba(228,63,111,0.1)", color: "#E43F6F", border: "1px solid rgba(228,63,111,0.2)", borderRadius: "12px", "& .MuiAlert-icon": { color: "#E43F6F" } }}>
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
          sx={{
            mt: 3,
            py: 1.5,
            fontFamily: `"Syne", sans-serif`,
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.5px",
            textTransform: "none",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #E43F6F, #c02d5a)",
            color: "#fff",
            border: "1px solid rgba(228,63,111,0.4)",
            boxShadow: "0 6px 20px rgba(228,63,111,0.4), 4px 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            transition: "all 0.25s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #f0537f, #d03568)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 28px rgba(228,63,111,0.5), 4px 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            },
          }}
        >
          Create Account
        </Button>
      </Box>
    </Box>
  );
}

export default SignupFormModal;

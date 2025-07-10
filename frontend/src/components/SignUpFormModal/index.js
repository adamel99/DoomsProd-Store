import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";

import {
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  useTheme,
  Box,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

const NeonButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  fontWeight: 700,
  boxShadow: `0 5px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
  borderRadius: "30px",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

function SignupFormModal() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword: "Confirm Password field must be the same as the Password field",
      });
    }

    setErrors({});
    try {
      await dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password,
        })
      );
      closeModal();
    } catch (res) {
      const data = await res.json();
      if (data && data.errors) {
        setErrors(data.errors);
      }
    }
  };

  return (
    <Box
      sx={{
        minWidth: 380,
        background: alpha(theme.palette.background.paper, 0.05),
        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        borderRadius: 4,
        boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        px: 4,
        py: 5,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
        }}
      >
        Create Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {[
            { label: "Email", value: email, setter: setEmail, error: errors.email },
            { label: "Username", value: username, setter: setUsername, error: errors.username },
            { label: "First Name", value: firstName, setter: setFirstName, error: errors.firstName },
            { label: "Last Name", value: lastName, setter: setLastName, error: errors.lastName },
            { label: "Password", value: password, setter: setPassword, error: errors.password, type: "password" },
            { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, error: errors.confirmPassword, type: "password" },
          ].map(({ label, value, setter, error, type }, i) => (
            <Grid item xs={label.includes("Name") ? 6 : 12} key={i}>
              <TextField
                fullWidth
                required
                type={type || "text"}
                label={label}
                value={value}
                onChange={(e) => setter(e.target.value)}
                InputLabelProps={{
                  sx: { color: theme.palette.text.secondary },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.05),
                    borderRadius: "12px",
                    input: { color: theme.palette.text.primary },
                    "& fieldset": { borderColor: theme.palette.grey[700] },
                    "&:hover fieldset": { borderColor: theme.palette.primary.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                  },
                }}
              />
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                    color: theme.palette.error.main,
                    mt: 1,
                  }}
                >
                  {error}
                </Alert>
              )}
            </Grid>
          ))}
        </Grid>

        <NeonButton type="submit" fullWidth>
          Sign Up
        </NeonButton>
      </Box>
    </Box>
  );
}

export default SignupFormModal;

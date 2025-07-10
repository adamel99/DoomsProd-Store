import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  useTheme,
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
  "&:disabled": {
    opacity: 0.4,
    boxShadow: "none",
    background: `linear-gradient(135deg, ${theme.palette.grey[700]}, ${theme.palette.grey[900]})`,
  },
}));

const LoginFormModal = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const user = useSelector((state) => state.session.user);

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const minUsernameLength = 4;
  const minPasswordLength = 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) setErrors(data.errors);
      });
  };

  const isButtonDisabled =
    credential.length < minUsernameLength || password.length < minPasswordLength;

  return (
    <Box
      sx={{
        minWidth: 350,
        background: alpha(theme.palette.background.paper, 0.05),
        border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
        borderRadius: 4,
        boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflow: "hidden",
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
        Log In
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          mt: 2,
        }}
      >
        <TextField
          label="Username or Email"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          fullWidth
          required
          InputLabelProps={{
            sx: {
              color: theme.palette.text.secondary,
            },
          }}
          sx={{
            input: { color: theme.palette.text.primary },
            "& .MuiOutlinedInput-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.05),
              borderRadius: "12px",
              "& fieldset": { borderColor: theme.palette.grey[700] },
              "&:hover fieldset": { borderColor: theme.palette.primary.main },
              "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
            },
          }}
        />
        {errors.credential && (
          <Alert
            severity="error"
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
            }}
          >
            {errors.credential}
          </Alert>
        )}

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          InputLabelProps={{
            sx: {
              color: theme.palette.text.secondary,
            },
          }}
          sx={{
            input: { color: theme.palette.text.primary },
            "& .MuiOutlinedInput-root": {
              backgroundColor: alpha(theme.palette.background.paper, 0.05),
              borderRadius: "12px",
              "& fieldset": { borderColor: theme.palette.grey[700] },
              "&:hover fieldset": { borderColor: theme.palette.primary.main },
              "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
            },
          }}
        />
        {errors.password && (
          <Alert
            severity="error"
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
            }}
          >
            {errors.password}
          </Alert>
        )}

        <NeonButton type="submit" fullWidth disabled={isButtonDisabled}>
          Log In
        </NeonButton>
      </Box>
    </Box>
  );
};

export default LoginFormModal;

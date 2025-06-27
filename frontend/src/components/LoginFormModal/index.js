import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as sessionActions from "../../store/session";
import { useModal } from "../../context/Modal";

import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  useTheme,
} from "@mui/material";

import { styled } from "@mui/material/styles";

// Neon gradient button on top of your theme's button styles
const NeonButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  background: `linear-gradient(90deg, #00e5ff, ${theme.palette.primary.main})`,
  color: theme.palette.text.primary,
  fontWeight: 700,
  boxShadow: `0 0 8px #00e5ffaa, 0 0 20px ${theme.palette.primary.main}aa`,
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  "&:hover": {
    background: `linear-gradient(90deg, #00bcd4, ${theme.palette.primary.dark})`,
    boxShadow: `0 0 14px #00bcd4cc, 0 0 30px ${theme.palette.primary.dark}cc`,
  },
}));

function LoginFormModal() {
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
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  const isButtonDisabled =
    credential.length < minUsernameLength || password.length < minPasswordLength;

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: theme.palette.primary.main,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Log In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Username or Email"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ sx: { color: theme.palette.secondary.main } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              input: { color: theme.palette.text.primary },
            }}
          />
          {errors.credential && (
            <Alert
              severity="error"
              sx={{
                backgroundColor: "rgba(255,0,0,0.12)",
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
            InputLabelProps={{ sx: { color: theme.palette.secondary.main } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              input: { color: theme.palette.text.primary },
            }}
          />
          {errors.password && (
            <Alert
              severity="error"
              sx={{
                backgroundColor: "rgba(255,0,0,0.12)",
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
      </CardContent>
    </Card>
  );
}

export default LoginFormModal;

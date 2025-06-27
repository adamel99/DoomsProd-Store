import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  useTheme,
  Box
} from "@mui/material";

import { styled } from "@mui/material/styles";

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
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
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
                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      backgroundColor: "rgba(255,0,0,0.12)",
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
      </CardContent>
    </Card>
  );
}

export default SignupFormModal;

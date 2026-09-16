import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useModal } from "../../context/Modal";
import * as sessionActions from "../../store/session";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const fieldSx = (theme) => ({
  width: "100%",
  "& .MuiInputBase-input": {
    height: 20,
    py: 0,
    display: "flex",
    alignItems: "center",
    lineHeight: "20px",
  },
  "& .MuiOutlinedInput-root": {
    height: 48,
    alignItems: "center",
    background: theme.custom.clay.surfaceSoft,
    borderRadius: "var(--radius-md)",
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
    transform: "translate(14px, 13px) scale(1)",
    "&.Mui-focused": { color: theme.palette.primary.main },
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)",
    },
  },
  "& .MuiInputAdornment-root": {
    height: "100%",
    maxHeight: "none",
    alignItems: "center",
  },
  input: { color: theme.palette.text.primary },
});

const errorAlertSx = (theme) => ({
  mt: 0.75,
  bgcolor: `${theme.palette.primary.main}18`,
  color: theme.palette.primary.dark,
  border: `1px solid ${theme.palette.primary.main}44`,
  borderRadius: "12px",
    boxShadow: "none",
    py: 0.45,
    fontSize: "0.76rem",
  "& .MuiAlert-icon": { color: theme.palette.primary.main },
});

const FieldSlot = ({ children }) => (
  <Box sx={{
    minWidth: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
  }}>
    {children}
  </Box>
);

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
  const [isSubscribedToEmails, setIsSubscribedToEmails] = useState(false);
  const [errors, setErrors]                 = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return setErrors({ confirmPassword: "Passwords do not match" });
    if (password.length < 12 || password.length > 128)
      return setErrors({ password: "Password must be between 12 and 128 characters." });
    if (!/[a-z]/.test(password))
      return setErrors({ password: "Password must include at least one lowercase letter." });
    if (!/[A-Z]/.test(password))
      return setErrors({ password: "Password must include at least one uppercase letter." });
    if (!/\d/.test(password))
      return setErrors({ password: "Password must include at least one number." });
    if (!/[^A-Za-z0-9]/.test(password))
      return setErrors({ password: "Password must include at least one symbol." });
    setErrors({});
    try {
      await dispatch(sessionActions.signup({
        email,
        username,
        firstName,
        lastName,
        password,
        isSubscribedToEmails,
      }));
      closeModal();
    } catch (res) {
      const data = await res.json();
      if (data?.errors) setErrors(data.errors);
    }
  };

  const fields = [
    { label: "Email",            value: email,           setter: setEmail,           error: errors.email },
    { label: "Username",         value: username,        setter: setUsername,        error: errors.username },
    { label: "First Name",       value: firstName,       setter: setFirstName,       error: errors.firstName },
    { label: "Last Name",        value: lastName,        setter: setLastName,        error: errors.lastName },
    { label: "Password",         value: password,        setter: setPassword,        error: errors.password,        type: "password", toggle: [showPassword, setShowPassword] },
    { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, error: errors.confirmPassword, type: "password", toggle: [showConfirm,   setShowConfirm] },
  ];

  return (
    <Box sx={(theme) => ({
      width: { xs: "min(92vw, 360px)", sm: 560, md: 640 },
      maxHeight: "min(88vh, 760px)",
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.border,
      borderRadius: "var(--radius-panel)",
      boxShadow: theme.custom.clay.floating,
      px: { xs: 2.5, sm: 3.5, md: 4 },
      py: { xs: 3, sm: 3.5 },
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
    })}>

      {/* Soft top rim */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 18,
        right: 18,
        height: 3,
        borderRadius: "0 0 999px 999px",
        background: (theme) =>
          `linear-gradient(90deg, transparent, ${theme.custom.transparent(theme.palette.primary.main, 0.72)} 28%, ${theme.custom.transparent(theme.custom.colors.ink, 0.58)} 50%, ${theme.custom.transparent(theme.palette.primary.main, 0.72)} 72%, transparent)`,
        opacity: 0.9,
        pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 92,
        background: (theme) =>
          `linear-gradient(180deg, ${theme.custom.transparent(theme.palette.primary.main, 0.12)}, transparent 78%)`,
        pointerEvents: "none",
      }} />

      <Box sx={{ textAlign: "center", mb: 2.5, position: "relative", zIndex: 1 }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: "50%",
          bgcolor: "primary.main",
          boxShadow: (theme) => `0 0 10px ${theme.custom.transparent(theme.palette.primary.main, 0.48)}`,
          mx: "auto", mb: 1.25,
        }} />
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 700,
          fontSize: { xs: "1.45rem", sm: "1.65rem" },
          color: "text.primary",
          letterSpacing: 0,
        }}>
          Create Account
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.body,
          fontSize: "0.85rem",
          color: "text.secondary",
          mt: 0.35,
        }}>
          Join and start creating
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          columnGap: 1.5,
          rowGap: 1.5,
          alignItems: "start",
          justifyItems: "stretch",
          width: "100%",
        }}>
          {fields.map(({ label, value, setter, error, type, toggle }, i) => {
            const [show, setShow] = toggle || [];
            return (
              <FieldSlot key={i}>
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
              </FieldSlot>
            );
          })}
        </Box>

        <Box sx={{ mt: 1.75 }}>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.body,
            fontSize: "0.72rem",
            color: "text.secondary",
            lineHeight: 1.45,
            mb: 1,
          }}>
            We collect account details, security cookies, cart activity, and order history to run your account, process purchases, send receipts, and deliver downloads. Payments use Stripe, emails use Resend, and product files use AWS S3. By creating an account, you agree to the{" "}
            <Link component={RouterLink} to="/terms" onClick={closeModal} sx={{ color: "primary.main", fontWeight: 700 }}>
              Terms
            </Link>
            {" "}and{" "}
            <Link component={RouterLink} to="/privacy-policy" onClick={closeModal} sx={{ color: "primary.main", fontWeight: 700 }}>
              Privacy Policy
            </Link>
            .
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={isSubscribedToEmails}
                onChange={(e) => setIsSubscribedToEmails(e.target.checked)}
                sx={{
                  color: "text.secondary",
                  "&.Mui-checked": { color: "primary.main" },
                }}
              />
            }
            label="Send me occasional doomsprod updates and offers."
            sx={{
              alignItems: "flex-start",
              color: "text.secondary",
              m: 0,
              "& .MuiFormControlLabel-label": {
                fontFamily: (theme) => theme.custom.fonts.body,
                fontSize: "0.74rem",
                lineHeight: 1.35,
                pt: "10px",
              },
            }}
          />
        </Box>

        <Button
          type="submit"
          fullWidth
          sx={(theme) => ({
            mt: 2,
            py: 1.25,
            fontFamily: theme.custom.fonts.display,
            fontWeight: 700,
            fontSize: "0.9rem",
            letterSpacing: "0.5px",
            textTransform: "none",
            borderRadius: "var(--radius-md)",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: theme.palette.primary.contrastText,
            border: `1px solid ${theme.palette.primary.main}66`,
            boxShadow: theme.custom.clay.raisedSmall,
            transition: "var(--motion-interactive)",
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

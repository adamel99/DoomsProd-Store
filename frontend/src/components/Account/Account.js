import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useHistory } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LockResetIcon from "@mui/icons-material/LockReset";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { getUserOrdersThunk } from "../../store/orders";
import { csrfFetch } from "../../store/csrf";
import { updatePassword, updateProfile } from "../../store/session";
import { formatProductType } from "../../utils/formatProductType";
import { formatDate, formatDateTime, formatMoney } from "../../utils/formatters";

const Panel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    background: theme.palette.background.paper,
    border: theme.custom.clay.hairline,
    borderRadius: "18px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
    ...sx,
  })}>
    {children}
  </Box>
);

const getStatusMeta = (status) => {
  if (status === "completed") {
    return {
      label: "Completed",
      message: "Your receipt and downloads are ready.",
      color: "success",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Cancelled",
      message: "This order was cancelled and downloads are not available.",
      color: "default",
    };
  }

  return {
    label: "Pending",
    message: "Payment is still being confirmed. Downloads unlock when the order completes.",
    color: "warning",
  };
};

const getLicenseTerms = (item) => {
  const type = item.Product?.type;

  if (type === "loop_kit") {
    return "Not royalty-free. You may use the sounds in your own music, but producer credit and royalty/publishing splits are still required for placements, major releases, sync, sample clearances, or commercial opportunities. Do not resell, repackage, redistribute, or upload the raw loops as a competing kit.";
  }

  if (type === "drum_kit") {
    return "Royalty-free for use in your own music productions. You may not resell, share, repackage, redistribute, or upload the raw drum sounds as a sample pack, drum kit, or competing product.";
  }

  if (type === "beat") {
    if (String(item.License?.name || "").trim().toLowerCase() === "exclusive") {
      return `${item.License?.description || "Exclusive commercial usage rights to the purchased beat."} Includes MP3, WAV, ZIP delivery and priority response for purchase questions or concerns. Copyright, publishing, and master ownership remain with doomsprod unless transferred in a separate signed agreement. Files and license rights are for the purchaser and are not transferable without written permission.`;
    }

    return `${item.License?.description || "Usage rights follow the selected beat license for this purchase."} Non-exclusive beat licenses do not transfer copyright ownership. Do not resell, redistribute, lease, share, or re-upload the beat files, trackouts, stems, WAVs, MP3s, or ZIP packages as standalone files. Content ID registration, copyright claims, and exclusive-rights claims are not allowed unless expressly included in a written exclusive agreement.`;
  }

  if (type === "plugin") {
    return "Plugin purchase includes the downloadable ZIP package and installation materials for the purchaser. Redistribution, resale, public sharing, license-key sharing, mirroring, or repackaging of the plugin files is not permitted.";
  }

  return "Usage rights apply to this digital product as purchased.";
};

const fileNameFromUrl = (url, index) => {
  const cleanUrl = String(url || "").split("?")[0];
  const name = decodeURIComponent(cleanUrl.split("/").pop() || "");
  return name || `File ${index + 1}`;
};

const normalizeDownload = (download, index) => {
  if (typeof download === "string") {
    return {
      url: download,
      label: fileNameFromUrl(download, index),
      fileName: fileNameFromUrl(download, index),
    };
  }

  return {
    url: download.url,
    label: download.type ? download.type.toUpperCase() : `File ${index + 1}`,
    fileName: download.type ? `download.${download.type}` : `file-${index + 1}`,
  };
};

const AccountPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.session.user);
  const orders = useSelector((state) => Object.values(state.orders.userOrders || {}));
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [downloadState, setDownloadState] = useState({});
  const [receiptState, setReceiptState] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isSubscribedToEmails: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileState, setProfileState] = useState({ loading: false, message: null, error: null });
  const [passwordState, setPasswordState] = useState({ loading: false, message: null, error: null });

  useEffect(() => {
    let isMounted = true;
    dispatch(getUserOrdersThunk()).finally(() => {
      if (isMounted) setLoadingOrders(false);
    });
    return () => { isMounted = false; };
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      isSubscribedToEmails: user.isSubscribedToEmails === true,
    });
  }, [user]);

  const fullName = useMemo(() => (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Account"
  ), [user]);
  const completedOrders = useMemo(() => (
    orders.filter((order) => order.status === "completed")
  ), [orders]);
  const totalSpent = useMemo(() => (
    completedOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
  ), [completedOrders]);

  const resetProfileForm = () => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      isSubscribedToEmails: user?.isSubscribedToEmails === true,
    });
  };

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const loadDownloads = async (orderId) => {
    setDownloadState((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), loading: true, error: null },
    }));

    try {
      const res = await fetch(`/api/downloads/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load downloads.");

      setDownloadState((prev) => ({
        ...prev,
        [orderId]: { loading: false, links: data.downloadLinks || [], error: null },
      }));
    } catch (err) {
      setDownloadState((prev) => ({
        ...prev,
        [orderId]: { loading: false, links: [], error: err.message },
      }));
    }
  };

  const resendReceipt = async (orderId) => {
    setReceiptState((prev) => ({
      ...prev,
      [orderId]: { loading: true, message: null, error: null },
    }));

    try {
      const res = await csrfFetch(`/api/orders/${orderId}/resend-receipt`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not resend receipt.");

      setReceiptState((prev) => ({
        ...prev,
        [orderId]: { loading: false, message: data.message || "Receipt resent.", error: null },
      }));
    } catch (err) {
      let message = "Could not resend receipt.";
      if (err?.json) {
        const data = await err.json();
        message = data.message || message;
      } else if (err?.message) {
        message = err.message;
      }

      setReceiptState((prev) => ({
        ...prev,
        [orderId]: { loading: false, message: null, error: message },
      }));
    }
  };

  const getErrorMessage = async (err, fallback) => {
    if (err?.json) {
      const data = await err.json();
      return data.errors ? Object.values(data.errors).join(" ") : data.message || fallback;
    }
    return err?.message || fallback;
  };

  const handleProfileChange = (field) => (e) => {
    const value = field === "isSubscribedToEmails" ? e.target.checked : e.target.value;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileState({ loading: true, message: null, error: null });

    try {
      await dispatch(updateProfile(profileForm));
      setProfileState({ loading: false, message: "Account details updated.", error: null });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileState({
        loading: false,
        message: null,
        error: await getErrorMessage(err, "Could not update account details."),
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordState({ loading: true, message: null, error: null });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState({ loading: false, message: null, error: "New passwords do not match." });
      return;
    }

    try {
      await dispatch(updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordState({ loading: false, message: "Password updated.", error: null });
      setIsChangingPassword(false);
    } catch (err) {
      setPasswordState({
        loading: false,
        message: null,
        error: await getErrorMessage(err, "Could not update password."),
      });
    }
  };

  const handleCancelProfileEdit = () => {
    resetProfileForm();
    setProfileState({ loading: false, message: null, error: null });
    setIsEditingProfile(false);
  };

  const handleCancelPasswordChange = () => {
    resetPasswordForm();
    setPasswordState({ loading: false, message: null, error: null });
    setIsChangingPassword(false);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      color: "text.primary",
      pt: { xs: 5, md: 7 },
      pb: { xs: 7, md: 10 },
    }}>
      <Container maxWidth="md">
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Box>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 1.5,
            }}>
              Account
            </Typography>
            <Typography variant="h1" sx={{
              fontSize: { xs: "2.35rem", md: "3.8rem" },
              lineHeight: 0.94,
            }}>
              Your Library
            </Typography>
          </Box>
          <Typography sx={{
            color: "text.secondary",
            maxWidth: 560,
            lineHeight: 1.65,
            fontSize: "0.94rem",
            mt: 1.5,
          }}>
            Manage receipts, re-download purchased files, and keep your license details close.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                <Avatar sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontFamily: (theme) => theme.custom.fonts.display,
                  fontSize: "1.45rem",
                  fontWeight: 900,
                }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ lineHeight: 1.05, overflowWrap: "anywhere" }}>
                    {fullName}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.5 }}>
                    @{user?.username || "user"} · {user?.email || "No email"}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={user?.isSubscribedToEmails ? "Release emails on" : "Release emails off"}
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Box>
          </Panel>

          <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
                  <Typography variant="h4">
                    Account Settings
                  </Typography>
                  {!isEditingProfile && (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        resetProfileForm();
                        setProfileState({ loading: false, message: null, error: null });
                        setIsEditingProfile(true);
                      }}
                    >
                      Edit Info
                    </Button>
                  )}
            </Box>

            {!isEditingProfile ? (
                  <Box sx={{ display: "grid", gap: 1.4, mb: 3.5 }}>
                    <InfoRow label="Name" value={fullName} />
                    <InfoRow label="Email" value={user?.email} />
                    <InfoRow label="Release Emails" value={user?.isSubscribedToEmails ? "Subscribed" : "Not subscribed"} />
                    {profileState.message && <Alert severity="success">{profileState.message}</Alert>}
                  </Box>
            ) : (
                  <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: "grid", gap: 2.2, mb: 3.5 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          value={profileForm.firstName}
                          onChange={handleProfileChange("firstName")}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          value={profileForm.lastName}
                          onChange={handleProfileChange("lastName")}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange("email")}
                          fullWidth
                          required
                        />
                      </Grid>
                    </Grid>

                    <FormControlLabel
                      control={(
                        <Switch
                          checked={profileForm.isSubscribedToEmails}
                          onChange={handleProfileChange("isSubscribedToEmails")}
                        />
                      )}
                      label="Send me product updates and release emails"
                      sx={{ color: "text.secondary" }}
                    />

                    {profileState.error && <Alert severity="error">{profileState.error}</Alert>}

                    <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                      <Button type="submit" variant="contained" disabled={profileState.loading}>
                        {profileState.loading ? "Saving" : "Save Account Details"}
                      </Button>
                      <Button type="button" variant="text" onClick={handleCancelProfileEdit} disabled={profileState.loading}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: isChangingPassword ? 2.2 : 0 }}>
                  <Typography variant="h5">
                    Change Password
                  </Typography>
                  {!isChangingPassword && (
                    <Button
                      variant="outlined"
                      startIcon={<LockResetIcon />}
                      onClick={() => {
                        resetPasswordForm();
                        setPasswordState({ loading: false, message: null, error: null });
                        setIsChangingPassword(true);
                      }}
                    >
                      Change Password
                    </Button>
                  )}
            </Box>

            {passwordState.message && !isChangingPassword && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {passwordState.message}
                  </Alert>
            )}

            {isChangingPassword && (
                <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: "grid", gap: 2.2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Current Password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange("currentPassword")}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New Password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm New Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>

                  {passwordState.error && <Alert severity="error">{passwordState.error}</Alert>}

                  <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                    <Button type="submit" variant="outlined" disabled={passwordState.loading}>
                      {passwordState.loading ? "Updating" : "Update Password"}
                    </Button>
                    <Button type="button" variant="text" onClick={handleCancelPasswordChange} disabled={passwordState.loading}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
            )}
          </Panel>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
            <StatCard icon={<ShoppingBagIcon />} label="Orders" value={orders.length} />
            <StatCard icon={<ReceiptLongIcon />} label="Completed" value={completedOrders.length} />
            <StatCard icon={<DownloadIcon />} label="Total Spent" value={formatMoney(totalSpent)} />
          </Box>

          <Panel sx={{ p: { xs: 2.25, md: 2.75 } }}>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
              gap: 2,
              alignItems: "center",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, minWidth: 0 }}>
                <SupportAgentIcon sx={{ color: "primary.main", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5">
                    Support
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", lineHeight: 1.55 }}>
                    Refunds, disputes, license questions, and download issues.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { sm: "flex-end" } }}>
                <Button component={Link} href="mailto:adamelh1999@gmail.com" variant="outlined" size="small">
                  Email
                </Button>
                <Button component={Link} href="https://instagram.com/vdam_" target="_blank" rel="noopener noreferrer" variant="outlined" size="small">
                  Instagram
                </Button>
                <Button component={RouterLink} to="/terms" variant="text" size="small">
                  Terms
                </Button>
              </Box>
            </Box>
          </Panel>

          <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
                    <ReceiptLongIcon sx={{ color: "primary.main" }} />
                    <Typography variant="h4">
                      Purchase History
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "text.disabled", fontSize: "0.82rem" }}>
                    Lifetime re-downloads for included files
                  </Typography>
                </Box>

                {loadingOrders ? (
                  <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : orders.length ? (
                  <Box sx={{ display: "grid", gap: 2 }}>
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        downloadInfo={downloadState[order.id]}
                        receiptInfo={receiptState[order.id]}
                        onLoadDownloads={() => loadDownloads(order.id)}
                        onResendReceipt={() => resendReceipt(order.id)}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ py: { xs: 5, md: 7 }, textAlign: "center" }}>
                    <Inventory2Icon sx={{ fontSize: 42, color: "primary.main", mb: 2 }} />
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      No purchases yet
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 3 }}>
                      Anything you buy will show up here with re-download links.
                    </Typography>
                    <Button variant="contained" onClick={() => history.push("/products")}>
                      Browse Products
                    </Button>
                  </Box>
                )}
          </Panel>
        </Box>
      </Container>
    </Box>
  );
};

const StatCard = ({ icon, label, value }) => (
  <Panel sx={{ p: 2.4 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
      <Box>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.mono,
          fontSize: "0.64rem",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "text.disabled",
          mb: 0.75,
        }}>
          {label}
        </Typography>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 900,
          fontSize: { xs: "1.45rem", sm: "1.6rem" },
          lineHeight: 1,
          color: "text.primary",
        }}>
          {value}
        </Typography>
      </Box>
      <Box sx={(theme) => ({
        width: 38,
        height: 38,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "primary.main",
        background: theme.custom.transparent(theme.palette.primary.main, 0.14),
        border: theme.custom.clay.hairline,
        flexShrink: 0,
        "& svg": { fontSize: 20 },
      })}>
        {icon}
      </Box>
    </Box>
  </Panel>
);

const InfoRow = ({ label, value }) => (
  <Box sx={{ py: 1.15, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.68rem",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "text.disabled",
      mb: 0.35,
    }}>
      {label}
    </Typography>
    <Typography sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
      {value || "Not provided"}
    </Typography>
  </Box>
);

const OrderCard = ({ order, downloadInfo, receiptInfo, onLoadDownloads, onResendReceipt }) => {
  const items = order.OrderItems || [];
  const isCompleted = order.status === "completed";
  const username = useSelector((state) => state.session.user?.username);
  const statusMeta = getStatusMeta(order.status);

  return (
    <Box sx={(theme) => ({
      p: { xs: 2, md: 2.5 },
      borderRadius: "var(--radius-lg)",
      background: (theme) => theme.custom.transparent(theme.custom.colors.cream, 0.36),
      border: theme.custom.clay.hairline,
    })}>
      <Box sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 2,
      }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
            <Typography sx={{ fontWeight: 800 }}>
              Order #{order.id}
            </Typography>
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              sx={{ height: 24, fontWeight: 800 }}
            />
          </Box>
          <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>
            {formatDate(order.createdAt, "Unknown date")} · {formatMoney(order.totalPrice)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={onResendReceipt}
            disabled={!isCompleted || receiptInfo?.loading}
          >
            {receiptInfo?.loading ? "Sending" : "Resend Receipt"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onLoadDownloads}
            disabled={!isCompleted || downloadInfo?.loading}
          >
            {downloadInfo?.loading ? "Loading" : "Downloads"}
          </Button>
        </Box>
      </Box>

      <Alert severity={order.status === "pending" ? "warning" : order.status === "cancelled" ? "info" : "success"} sx={{ mb: 2 }}>
        {statusMeta.message}
      </Alert>

      <Box sx={(theme) => ({
        mb: 2,
        p: 2,
        borderRadius: "12px",
        background: theme.custom.clay.surfaceSoft,
        border: theme.custom.clay.hairline,
      })}>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}>
          <ReceiptField label="Username" value={username || "Not provided"} />
          <ReceiptField label="Purchased" value={formatDateTime(order.createdAt, "Unknown time")} />
          <ReceiptField label="Paid" value={formatMoney(order.totalPrice)} />
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: 1.2 }}>
        {items.map((item) => (
          <Box key={item.id} sx={{
            display: "grid",
            gridTemplateColumns: "48px minmax(0, 1fr) auto",
            gap: 1.4,
            alignItems: "center",
          }}>
            <Box
              component="img"
              src={item.Product?.imageUrl || "/placeholder.jpg"}
              alt={item.Product?.title || "Product"}
              sx={{ width: 48, height: 48, borderRadius: "10px", objectFit: "cover", bgcolor: "background.paper" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.Product?.title || "Deleted product"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                {formatProductType(item.Product?.type)}{item.License?.name ? ` · ${item.License.name}` : ""}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 800 }}>
              {formatMoney(item.priceAtPurchase)}
            </Typography>
            <Box sx={{ gridColumn: "2 / -1" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", lineHeight: 1.55 }}>
                {getLicenseTerms(item)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {receiptInfo?.message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {receiptInfo.message}
        </Alert>
      )}

      {receiptInfo?.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {receiptInfo.error}
        </Alert>
      )}

      {downloadInfo?.error && (
        <Typography sx={{ mt: 2, color: "primary.dark", fontSize: "0.9rem" }}>
          {downloadInfo.error}
        </Typography>
      )}

      <Divider sx={{ mt: 2, mb: downloadInfo?.links?.length ? 2 : 0 }} />

      {downloadInfo?.links?.length > 0 && (
        <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
          {downloadInfo.links.map((download, index) => {
            const { url, label, fileName } = normalizeDownload(download, index);
            return (
              <Link
                key={`${url}-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName}
                sx={(theme) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: "12px",
                  background: theme.custom.clay.surfaceSoft,
                  border: theme.custom.clay.hairline,
                  color: "primary.main",
                  fontWeight: 800,
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "&:hover": { color: "primary.dark", borderColor: theme.palette.primary.main },
                })}
              >
                <DownloadIcon fontSize="small" />
                Download {label}
              </Link>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

const ReceiptField = ({ label, value }) => (
  <Box>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.66rem",
      letterSpacing: "1.4px",
      textTransform: "uppercase",
      color: "text.disabled",
      mb: 0.35,
    }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800, color: "text.primary", overflowWrap: "anywhere" }}>
      {value}
    </Typography>
  </Box>
);

export default AccountPage;

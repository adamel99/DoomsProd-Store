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
  Grid,
  Link,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { getUserOrdersThunk } from "../../store/orders";
import { csrfFetch } from "../../store/csrf";
import { formatProductType } from "../../utils/formatProductType";

const Panel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    ...theme.custom.patterns.surface.raised,
    borderRadius: "var(--radius-panel)",
    ...sx,
  })}>
    {children}
  </Box>
);

const formatDate = (value) => {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Unknown time";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

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
      return `${item.License?.description || "Exclusive rights to the beat."} Includes MP3, WAV, ZIP delivery and priority response for purchase questions or concerns. Files and license rights are for the purchaser and are not transferable without written permission.`;
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

  useEffect(() => {
    let isMounted = true;
    dispatch(getUserOrdersThunk()).finally(() => {
      if (isMounted) setLoadingOrders(false);
    });
    return () => { isMounted = false; };
  }, [dispatch]);

  const fullName = useMemo(() => (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Account"
  ), [user]);
  const completedOrders = useMemo(() => (
    orders.filter((order) => order.status === "completed")
  ), [orders]);
  const totalSpent = useMemo(() => (
    completedOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
  ), [completedOrders]);

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

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      color: "text.primary",
      pt: { xs: 6, md: 8 },
      pb: { xs: 8, md: 11 },
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 3, md: 4 }, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
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
              fontSize: { xs: "2.7rem", md: "4.8rem" },
              lineHeight: 0.94,
            }}>
              Your Library
            </Typography>
          </Box>
          <Typography sx={{
            color: "text.secondary",
            maxWidth: 390,
            lineHeight: 1.65,
            fontSize: "0.94rem",
          }}>
            Manage receipts, re-download purchased files, and keep your license details close.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 92 }, display: "grid", gap: 2.5 }}>
              <Panel sx={{ p: { xs: 3, md: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Avatar sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontFamily: (theme) => theme.custom.fonts.display,
                    fontSize: "1.7rem",
                    fontWeight: 900,
                    boxShadow: (theme) => theme.custom.clay.raisedSmall,
                  }}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h4" sx={{ lineHeight: 1.05, overflowWrap: "anywhere" }}>
                      {fullName}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.5 }}>
                      @{user?.username || "user"}
                    </Typography>
                  </Box>
                </Box>

                <InfoRow label="Name" value={fullName} />
                <InfoRow label="Email" value={user?.email} />
              </Panel>

              <Panel sx={{ p: { xs: 3, md: 3.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                  <SupportAgentIcon sx={{ color: "primary.main" }} />
                  <Typography variant="h5">
                    Support
                  </Typography>
                </Box>
                <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.65, mb: 2 }}>
                  For refunds, disputes, license questions, or download issues, contact{" "}
                  <Link href="mailto:adamelh1999@gmail.com" sx={{ color: "primary.main", fontWeight: 800 }}>
                    email
                  </Link>
                  {" "}or{" "}
                  <Link href="https://instagram.com/vdam_" target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main", fontWeight: 800 }}>
                    Instagram
                  </Link>
                  .
                </Typography>
                <Box sx={{ display: "grid", gap: 1 }}>
                  <LegalLink to="/terms" label="Terms" />
                  <LegalLink to="/privacy-policy" label="Privacy Policy" />
                  <LegalLink to="/licenses" label="Licenses" />
                </Box>
              </Panel>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                <StatCard icon={<ShoppingBagIcon />} label="Orders" value={orders.length} />
                <StatCard icon={<ReceiptLongIcon />} label="Completed" value={completedOrders.length} />
                <StatCard icon={<DownloadIcon />} label="Total Spent" value={formatMoney(totalSpent)} />
              </Box>

              <Panel sx={{ p: { xs: 2.5, md: 3.5 } }}>
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
          </Grid>
        </Grid>
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

const LegalLink = ({ to, label }) => (
  <Link
    component={RouterLink}
    to={to}
    sx={(theme) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 1.4,
      py: 1,
      borderRadius: "12px",
      background: theme.custom.clay.surfaceSoft,
      border: theme.custom.clay.hairline,
      color: "primary.main",
      fontWeight: 800,
      fontSize: "0.86rem",
      textDecoration: "none",
      "&:hover": {
        borderColor: theme.palette.primary.main,
        color: "primary.dark",
      },
    })}
  >
    {label}
  </Link>
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
            {formatDate(order.createdAt)} · {formatMoney(order.totalPrice)}
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
          <ReceiptField label="Purchased" value={formatDateTime(order.createdAt)} />
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

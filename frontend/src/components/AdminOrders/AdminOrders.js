import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputBase,
  Typography,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { csrfFetch } from "../../store/csrf";
import { formatProductType } from "../../utils/formatProductType";

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const statusMeta = {
  completed: { label: "Completed", color: "success" },
  pending: { label: "Pending", color: "warning" },
  cancelled: { label: "Cancelled", color: "default" },
};

const Panel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    background: theme.custom.clay.surfaceSoft,
    border: theme.custom.clay.border,
    borderRadius: "20px",
    boxShadow: theme.custom.clay.raised,
    ...sx,
  })}>
    {children}
  </Box>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [receiptState, setReceiptState] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const res = await csrfFetch("/api/orders");
        const data = await res.json();
        if (isMounted) setOrders(data.orders || []);
      } catch (err) {
        let message = "Could not load admin orders.";
        if (err?.json) {
          const data = await err.json();
          message = data.message || message;
        }
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrders();
    return () => { isMounted = false; };
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      const user = order.User || {};
      const products = (order.OrderItems || [])
        .map((item) => item.Product?.title || "")
        .join(" ");

      return [
        order.id,
        order.status,
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        products,
      ].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [orders, search]);

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.status === "completed");
    const customers = new Set(orders.map((order) => order.User?.id).filter(Boolean));

    return {
      orders: orders.length,
      customers: customers.size,
      revenue: completed.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
      pending: orders.filter((order) => order.status === "pending").length,
    };
  }, [orders]);

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
      setReceiptState((prev) => ({
        ...prev,
        [orderId]: { loading: false, message: data.message || "Receipt resent.", error: null },
      }));
    } catch (err) {
      let message = "Could not resend receipt.";
      if (err?.json) {
        const data = await err.json();
        message = data.message || message;
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
      pt: { xs: 7, md: 10 },
      pb: { xs: 9, md: 12 },
    }}>
      <Container maxWidth="xl">
        <Box sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "flex-end" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: { xs: 4, md: 5 },
        }}>
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
              Admin
            </Typography>
            <Typography variant="h1" sx={{
              fontSize: { xs: "3.1rem", md: "5.2rem" },
              lineHeight: 0.94,
            }}>
              Orders
            </Typography>
          </Box>

          <Box sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", md: 360 },
            height: 42,
            px: 1.5,
            borderRadius: "12px",
            background: theme.custom.clay.surfaceSoft,
            border: theme.custom.clay.border,
            boxShadow: theme.custom.clay.pressed,
          })}>
            <SearchIcon sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
            <InputBase
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders, customers, products"
              sx={{ width: "100%", fontSize: "0.9rem" }}
            />
          </Box>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <StatCard icon={<ReceiptLongIcon />} label="Orders" value={stats.orders} />
          <StatCard icon={<AdminPanelSettingsIcon />} label="Customers" value={stats.customers} />
          <StatCard icon={<ShoppingBagIcon />} label="Revenue" value={formatMoney(stats.revenue)} />
          <StatCard icon={<ReceiptLongIcon />} label="Pending" value={stats.pending} />
        </Grid>

        <Panel sx={{ p: { xs: 2, md: 3 } }}>
          {loading ? (
            <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredOrders.length ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  receiptInfo={receiptState[order.id]}
                  onResendReceipt={() => resendReceipt(order.id)}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <ReceiptLongIcon sx={{ fontSize: 44, color: "primary.main", mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 1 }}>
                No orders found
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Try a different customer, product, or status search.
              </Typography>
            </Box>
          )}
        </Panel>
      </Container>
    </Box>
  );
};

const StatCard = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Panel sx={{ p: 2.2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
        <Box sx={(theme) => ({
          width: 38,
          height: 38,
          display: "grid",
          placeItems: "center",
          borderRadius: "12px",
          color: "primary.main",
          background: `${theme.palette.primary.main}14`,
          border: theme.custom.clay.hairline,
        })}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.mono,
            fontSize: "0.66rem",
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            color: "text.disabled",
          }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 900 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Panel>
  </Grid>
);

const OrderRow = ({ order, receiptInfo, onResendReceipt }) => {
  const user = order.User || {};
  const items = order.OrderItems || [];
  const status = statusMeta[order.status] || statusMeta.pending;
  const customerName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Customer";
  const canResend = order.status === "completed";

  return (
    <Box sx={(theme) => ({
      p: { xs: 2, md: 2.5 },
      borderRadius: "16px",
      background: "rgba(241,218,191,0.36)",
      border: theme.custom.clay.hairline,
    })}>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(220px, 0.9fr) minmax(280px, 1.4fr) auto" },
        gap: 2,
        alignItems: "start",
      }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Avatar sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: "0.78rem",
              fontWeight: 800,
            }}>
              {user.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, overflowWrap: "anywhere" }}>
                {customerName}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", overflowWrap: "anywhere" }}>
                @{user.username || "unknown"} · {user.email || "No email"}
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ color: "text.secondary", fontSize: "0.84rem" }}>
            Order #{order.id} · {formatDateTime(order.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1.1 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{
              display: "grid",
              gridTemplateColumns: "44px minmax(0, 1fr) auto",
              gap: 1.2,
              alignItems: "center",
            }}>
              <Box
                component="img"
                src={item.Product?.imageUrl || "/placeholder.jpg"}
                alt={item.Product?.title || "Product"}
                sx={{ width: 44, height: 44, borderRadius: "10px", objectFit: "cover", bgcolor: "background.paper" }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.Product?.title || "Deleted product"}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                  {formatProductType(item.Product?.type)}{item.License?.name ? ` · ${item.License.name}` : ""} · Qty {item.quantity || 1}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 900 }}>
                {formatMoney(item.priceAtPurchase)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "grid", justifyItems: { xs: "stretch", lg: "end" }, gap: 1 }}>
          <Chip
            label={status.label}
            color={status.color}
            sx={{ justifySelf: { xs: "start", lg: "end" }, fontWeight: 900 }}
          />
          <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", textAlign: { xs: "left", lg: "right" } }}>
            {formatMoney(order.totalPrice)}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={onResendReceipt}
            disabled={!canResend || receiptInfo?.loading}
            sx={{ minWidth: 164 }}
          >
            {receiptInfo?.loading ? "Sending" : "Resend Email"}
          </Button>
        </Box>
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
    </Box>
  );
};

export default AdminOrders;

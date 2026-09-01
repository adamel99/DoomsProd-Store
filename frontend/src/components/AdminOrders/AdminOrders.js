import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { csrfFetch } from "../../store/csrf";
import { formatProductType } from "../../utils/formatProductType";
import { formatDate, formatDateTime, formatMoney } from "../../utils/formatters";

const statusMeta = {
  completed: { label: "Completed", color: "success" },
  pending: { label: "Pending", color: "warning" },
  cancelled: { label: "Cancelled", color: "default" },
};

const productTypes = ["beat", "loop_kit", "drum_kit", "plugin"];
const todayIso = () => new Date().toISOString().slice(0, 10);

const getPresetRange = (preset) => {
  const end = new Date();
  const start = new Date();

  if (preset === "7d") start.setDate(end.getDate() - 6);
  if (preset === "30d") start.setDate(end.getDate() - 29);
  if (preset === "90d") start.setDate(end.getDate() - 89);
  if (preset === "year") start.setMonth(0, 1);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: todayIso(),
  };
};

const Panel = ({ children, sx = {} }) => (
  <Box sx={(theme) => ({
    background: theme.custom.clay.surfaceSoft,
    border: theme.custom.clay.border,
    borderRadius: "14px",
    boxShadow: theme.custom.clay.raisedSmall,
    ...sx,
  })}>
    {children}
  </Box>
);

const normalize = (value) => String(value || "").toLowerCase();
const getOrderItems = (order) => order.OrderItems || [];
const getCustomerName = (user = {}) => (
  [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Customer"
);
const getOrderQuantity = (order) => (
  getOrderItems(order).reduce((sum, item) => sum + (item.quantity || 1), 0)
);
const getOrderProductTypes = (order) => (
  [...new Set(getOrderItems(order).map((item) => item.Product?.type).filter(Boolean))]
);
const getOrderLicenses = (order) => (
  [...new Set(getOrderItems(order).map((item) => item.License?.name).filter(Boolean))]
);

const makeCsv = (rows) => rows
  .map((row) => row.map((cell) => {
    const value = String(cell ?? "");
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(","))
  .join("\n");

const downloadCsv = (filename, rows) => {
  const blob = new Blob([makeCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildOrderQuery = ({ page, rowsPerPage, search, statusFilter, typeFilter, sortBy, startDate, endDate }) => {
  const params = new URLSearchParams({
    page: String(page + 1),
    size: String(rowsPerPage),
    sort: sortBy,
    direction: "DESC",
  });

  if (search.trim()) params.set("search", search.trim());
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  return params.toString();
};

const buildAnalyticsQuery = ({ startDate, endDate }) => {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return params.toString();
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [orderTotalCount, setOrderTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tab, setTab] = useState("orders");
  const [expanded, setExpanded] = useState({});
  const [receiptState, setReceiptState] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        const query = buildAnalyticsQuery({ startDate, endDate });
        const summaryRes = await csrfFetch(`/api/admin/dashboard${query ? `?${query}` : ""}`);
        const summaryData = await summaryRes.json();

        if (isMounted) {
          setAnalytics(summaryData);
        }
      } catch (err) {
        let message = "Could not load admin dashboard.";
        if (err?.json) {
          const data = await err.json();
          message = data.message || message;
        }
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAdminData();
    return () => { isMounted = false; };
  }, [startDate, endDate]);

  useEffect(() => {
    if (loading) return undefined;
    let isMounted = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const query = buildOrderQuery({ page, rowsPerPage, search, statusFilter, typeFilter, sortBy, startDate, endDate });
        const res = await csrfFetch(`/api/orders?${query}`);
        const data = await res.json();

        if (isMounted) {
          setOrders(data.orders || []);
          setOrderTotalCount(data.pagination?.total || 0);
        }
      } catch (err) {
        let message = "Could not load admin orders.";
        if (err?.json) {
          const data = await err.json();
          message = data.message || message;
        }
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => { isMounted = false; };
  }, [loading, page, rowsPerPage, search, statusFilter, typeFilter, sortBy, startDate, endDate]);

  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    setPage(0);
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }
    const range = getPresetRange(preset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const filteredOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      if (sortBy === "totalPrice") return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
      if (sortBy === "customer") return getCustomerName(a.User).localeCompare(getCustomerName(b.User));
      if (sortBy === "status") return normalize(a.status).localeCompare(normalize(b.status));
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [orders, sortBy]);

  const localSummary = useMemo(() => {
    const completed = orders.filter((order) => order.status === "completed");
    const pending = orders.filter((order) => order.status === "pending");
    const cancelled = orders.filter((order) => order.status === "cancelled");
    const customers = new Set(orders.map((order) => order.User?.id).filter(Boolean));
    const completedRevenue = completed.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    return {
      totalRevenue: completedRevenue,
      completedRevenue,
      pendingRevenue: pending.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0),
      totalOrders: orders.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      cancelledOrders: cancelled.length,
      averageOrderValue: completed.length ? completedRevenue / completed.length : 0,
      uniqueCustomers: customers.size,
      totalProductsSold: completed.reduce((sum, order) => sum + getOrderQuantity(order), 0),
      bestSellingProduct: "None",
      mostCommonLicense: "None",
    };
  }, [orders]);

  const summary = analytics?.summary || localSummary;
  const customers = analytics?.customers || [];
  const products = analytics?.products || [];

  const resendReceipt = async (orderId) => {
    setReceiptState((prev) => ({
      ...prev,
      [orderId]: { loading: true, message: null, error: null },
    }));

    try {
      const res = await csrfFetch(`/api/orders/${orderId}/resend-receipt`, { method: "POST" });
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

  const exportOrders = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "Email", "Status", "Items", "Licenses", "Product Types", "Quantity", "Total", "Payment Intent"],
      ...filteredOrders.map((order) => [
        order.id,
        formatDateTime(order.createdAt),
        getCustomerName(order.User),
        order.User?.email || "",
        order.status,
        getOrderItems(order).map((item) => item.Product?.title || "Deleted product").join(" | "),
        getOrderLicenses(order).join(" | "),
        getOrderProductTypes(order).map(formatProductType).join(" | "),
        getOrderQuantity(order),
        Number(order.totalPrice || 0).toFixed(2),
        order.paymentIntentId || "",
      ]),
    ];

    downloadCsv("admin-orders.csv", rows);
  };

  const exportCustomers = () => {
    const rows = [
      ["Customer", "Username", "Email", "Orders", "Lifetime Spend", "Average Order", "Last Order", "Subscribed"],
      ...customers.map((customer) => [
        getCustomerName(customer),
        customer.username,
        customer.email,
        customer.orderCount,
        Number(customer.lifetimeSpend || 0).toFixed(2),
        Number(customer.averageOrderValue || 0).toFixed(2),
        formatDate(customer.lastOrderDate),
        customer.isSubscribedToEmails ? "Yes" : "No",
      ]),
    ];

    downloadCsv("admin-customers.csv", rows);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      color: "text.primary",
      overflowX: "hidden",
      pt: { xs: 7, md: 10 },
      pb: { xs: 9, md: 12 },
    }}>
      <Container maxWidth="xl">
        <Box sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "flex-end" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}>
          <Box>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "primary.main",
              mb: 1,
            }}>
              Admin
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: "2.7rem", md: "4.6rem" }, lineHeight: 0.95 }}>
              Dashboard
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={tab === "customers" ? exportCustomers : exportOrders}
            disabled={loading || Boolean(error)}
          >
            Export CSV
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ py: 12, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <StatCard icon={<ShoppingBagIcon />} label="Revenue" value={formatMoney(summary.totalRevenue)} />
              <StatCard icon={<ReceiptLongIcon />} label="Orders" value={summary.totalOrders} />
              <StatCard icon={<GroupsIcon />} label="Customers" value={summary.uniqueCustomers} />
              <StatCard icon={<BarChartIcon />} label="Avg Order" value={formatMoney(summary.averageOrderValue)} />
              <StatCard icon={<Inventory2Icon />} label="Products Sold" value={summary.totalProductsSold} />
              <StatCard icon={<ReceiptLongIcon />} label="Completed" value={summary.completedOrders} />
              <StatCard icon={<ReceiptLongIcon />} label="Pending" value={summary.pendingOrders} />
              <StatCard icon={<ReceiptLongIcon />} label="Cancelled" value={summary.cancelledOrders} />
            </Grid>

            <Panel sx={{ mb: 2 }}>
              <Tabs value={tab} onChange={(event, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
                <Tab value="orders" label="Orders" />
                <Tab value="customers" label="Customers" />
                <Tab value="products" label="Products" />
                <Tab value="revenue" label="Revenue" />
                <Tab value="licenses" label="Licenses" />
              </Tabs>
            </Panel>

            {tab === "orders" && (
              <>
                <FilterBar
                  search={search}
                  setSearch={(value) => {
                    setSearch(value);
                    setPage(0);
                  }}
                  statusFilter={statusFilter}
                  setStatusFilter={(value) => {
                    setStatusFilter(value);
                    setPage(0);
                  }}
                  typeFilter={typeFilter}
                  setTypeFilter={(value) => {
                    setTypeFilter(value);
                    setPage(0);
                  }}
                  sortBy={sortBy}
                  setSortBy={(value) => {
                    setSortBy(value);
                    setPage(0);
                  }}
                  datePreset={datePreset}
                  setDatePreset={applyDatePreset}
                  startDate={startDate}
                  setStartDate={(value) => {
                    setStartDate(value);
                    setDatePreset("custom");
                    setPage(0);
                  }}
                  endDate={endDate}
                  setEndDate={(value) => {
                    setEndDate(value);
                    setDatePreset("custom");
                    setPage(0);
                  }}
                />
                <OrdersTable
                  orders={filteredOrders}
                  totalCount={orderTotalCount}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  loading={ordersLoading}
                  expanded={expanded}
                  receiptState={receiptState}
                  setExpanded={setExpanded}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                  onResendReceipt={resendReceipt}
                />
              </>
            )}

            {tab === "customers" && <CustomersTable customers={customers} />}
            {tab === "products" && <ProductsTable products={products} />}
            {tab === "revenue" && <RevenuePanel summary={summary} breakdowns={analytics?.breakdowns} />}
            {tab === "licenses" && <LicensesTable licenses={analytics?.licenses || []} />}
          </>
        )}
      </Container>
    </Box>
  );
};

const StatCard = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Panel sx={{ p: 1.8 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box sx={(theme) => ({
          width: 34,
          height: 34,
          display: "grid",
          placeItems: "center",
          borderRadius: "10px",
          color: "primary.main",
          background: `${theme.palette.primary.main}14`,
          border: theme.custom.clay.hairline,
          flex: "0 0 auto",
        })}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{
            fontFamily: (theme) => theme.custom.fonts.mono,
            fontSize: "0.63rem",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "text.disabled",
          }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, overflowWrap: "anywhere" }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Panel>
  </Grid>
);

const FilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  datePreset,
  setDatePreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => (
  <Panel sx={{ p: 1.5, mb: 2 }}>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 1fr) repeat(3, 150px)" },
      gap: 1.5,
      alignItems: "center",
    }}>
      <Box sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        height: 42,
        px: 1.5,
        borderRadius: "10px",
        background: "rgba(255,255,255,0.04)",
        border: theme.custom.clay.hairline,
      })}>
        <SearchIcon sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
        <InputBase
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search orders, customers, products, payment IDs"
          sx={{ width: "100%", fontSize: "0.88rem" }}
        />
      </Box>

      <SmallSelect label="Status" value={statusFilter} onChange={setStatusFilter}>
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </SmallSelect>

      <SmallSelect label="Product Type" value={typeFilter} onChange={setTypeFilter}>
        <MenuItem value="all">All</MenuItem>
        {productTypes.map((type) => (
          <MenuItem key={type} value={type}>{formatProductType(type)}</MenuItem>
        ))}
      </SmallSelect>

      <SmallSelect label="Sort" value={sortBy} onChange={setSortBy}>
        <MenuItem value="createdAt">Newest</MenuItem>
        <MenuItem value="totalPrice">Revenue</MenuItem>
        <MenuItem value="customer">Customer</MenuItem>
        <MenuItem value="status">Status</MenuItem>
      </SmallSelect>
    </Box>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "170px 170px 170px" },
      gap: 1.5,
      alignItems: "center",
      mt: 1.5,
    }}>
      <SmallSelect label="Date Range" value={datePreset} onChange={setDatePreset}>
        <MenuItem value="all">All Time</MenuItem>
        <MenuItem value="7d">Last 7 Days</MenuItem>
        <MenuItem value="30d">Last 30 Days</MenuItem>
        <MenuItem value="90d">Last 90 Days</MenuItem>
        <MenuItem value="year">This Year</MenuItem>
        <MenuItem value="custom">Custom</MenuItem>
      </SmallSelect>
      <TextField
        label="Start"
        type="date"
        size="small"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End"
        type="date"
        size="small"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  </Panel>
);

const SmallSelect = ({ label, value, onChange, children }) => (
  <FormControl size="small" fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={(event) => onChange(event.target.value)} sx={{ borderRadius: "10px", fontSize: "0.88rem" }}>
      {children}
    </Select>
  </FormControl>
);

const OrdersTable = ({
  orders,
  totalCount,
  page,
  rowsPerPage,
  loading,
  expanded,
  receiptState,
  setExpanded,
  setPage,
  setRowsPerPage,
  onResendReceipt,
}) => (
  <Panel>
    {loading && (
      <Box sx={{ height: 3, bgcolor: "primary.main", opacity: 0.75 }} />
    )}
    <TableContainer>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <AdminHeadCell />
            <AdminHeadCell>Order</AdminHeadCell>
            <AdminHeadCell>Date</AdminHeadCell>
            <AdminHeadCell>Customer</AdminHeadCell>
            <AdminHeadCell>Email</AdminHeadCell>
            <AdminHeadCell>Status</AdminHeadCell>
            <AdminHeadCell>Items</AdminHeadCell>
            <AdminHeadCell>Licenses</AdminHeadCell>
            <AdminHeadCell>Types</AdminHeadCell>
            <AdminHeadCell align="right">Qty</AdminHeadCell>
            <AdminHeadCell align="right">Total</AdminHeadCell>
            <AdminHeadCell>Payment</AdminHeadCell>
            <AdminHeadCell align="right">Actions</AdminHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length ? orders.map((order) => (
            <Fragment key={order.id}>
              <OrderTableRow
                order={order}
                expanded={Boolean(expanded[order.id])}
                receiptInfo={receiptState[order.id]}
                onToggle={() => setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                onResendReceipt={() => onResendReceipt(order.id)}
              />
              <TableRow>
                <TableCell colSpan={13} sx={{ p: 0, borderBottom: "none" }}>
                  <Collapse in={Boolean(expanded[order.id])} timeout="auto" unmountOnExit>
                    <OrderDetails order={order} receiptInfo={receiptState[order.id]} />
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          )) : (
            <TableRow>
              <TableCell colSpan={13} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10, 25, 50, 100]}
      onPageChange={(event, nextPage) => setPage(nextPage)}
      onRowsPerPageChange={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      }}
    />
  </Panel>
);

const AdminHeadCell = ({ children, align }) => (
  <TableCell
    align={align}
    sx={(theme) => ({
      bgcolor: theme.palette.background.paper,
      color: "text.secondary",
      fontFamily: theme.custom.fonts.mono,
      fontSize: "0.68rem",
      fontWeight: 800,
      letterSpacing: "0.8px",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    })}
  >
    {children}
  </TableCell>
);

const OrderTableRow = ({ order, expanded, receiptInfo, onToggle, onResendReceipt }) => {
  const user = order.User || {};
  const status = statusMeta[order.status] || statusMeta.pending;
  const items = getOrderItems(order);
  const productNames = items.map((item) => item.Product?.title || "Deleted product").join(", ");
  const canResend = order.status === "completed";

  return (
    <TableRow hover>
      <TableCell sx={{ width: 42 }}>
        <Tooltip title={expanded ? "Collapse" : "Expand"}>
          <IconButton size="small" onClick={onToggle}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontWeight: 900 }}>#{order.id}</TableCell>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(order.createdAt)}</TableCell>
      <TableCell sx={{ minWidth: 170 }}>{getCustomerName(user)}</TableCell>
      <TableCell sx={{ minWidth: 210, color: "text.secondary" }}>{user.email || "No email"}</TableCell>
      <TableCell>
        <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 800 }} />
      </TableCell>
      <TableCell sx={{ minWidth: 240, maxWidth: 340 }}>
        <Typography sx={{ fontSize: "0.86rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {productNames || "No items"}
        </Typography>
      </TableCell>
      <TableCell sx={{ minWidth: 150 }}>{getOrderLicenses(order).join(", ") || "None"}</TableCell>
      <TableCell sx={{ minWidth: 140 }}>{getOrderProductTypes(order).map(formatProductType).join(", ") || "None"}</TableCell>
      <TableCell align="right">{getOrderQuantity(order)}</TableCell>
      <TableCell align="right" sx={{ fontWeight: 900 }}>{formatMoney(order.totalPrice)}</TableCell>
      <TableCell sx={{ maxWidth: 170 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {order.paymentIntentId || "None"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Tooltip title={canResend ? "Resend receipt" : "Completed orders only"}>
          <span>
            <IconButton size="small" onClick={onResendReceipt} disabled={!canResend || receiptInfo?.loading}>
              <EmailIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

const OrderDetails = ({ order, receiptInfo }) => (
  <Box sx={(theme) => ({
    p: 2,
    bgcolor: "rgba(255,255,255,0.035)",
    borderTop: theme.custom.clay.hairline,
    borderBottom: theme.custom.clay.hairline,
  })}>
    <Grid container spacing={2}>
      {getOrderItems(order).map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item.id}>
          <Box sx={(theme) => ({
            display: "grid",
            gridTemplateColumns: "52px minmax(0, 1fr)",
            gap: 1.4,
            p: 1.3,
            borderRadius: "10px",
            border: theme.custom.clay.hairline,
          })}>
            <Box
              component="img"
              src={item.Product?.imageUrl || "/placeholder.jpg"}
              alt={item.Product?.title || "Product"}
              sx={{ width: 52, height: 52, borderRadius: "8px", objectFit: "cover", bgcolor: "background.paper" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.Product?.title || "Deleted product"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                {formatProductType(item.Product?.type)} | {item.License?.name || "No license"} | Qty {item.quantity || 1}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                {item.Product?.genre || "No genre"} {item.Product?.bpm ? `| ${item.Product.bpm} BPM` : ""} {item.Product?.key ? `| ${item.Product.key}` : ""}
              </Typography>
              <Typography sx={{ fontWeight: 900, mt: 0.5 }}>{formatMoney(item.priceAtPurchase)}</Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>

    {receiptInfo?.message && <Alert severity="success" sx={{ mt: 2 }}>{receiptInfo.message}</Alert>}
    {receiptInfo?.error && <Alert severity="error" sx={{ mt: 2 }}>{receiptInfo.error}</Alert>}
  </Box>
);

const CustomersTable = ({ customers }) => (
  <SimpleTable
    headers={["Customer", "Email", "Orders", "Lifetime Spend", "Avg Order", "Last Order", "Subscribed"]}
    empty="No customer analytics yet."
    rows={customers.map((customer) => [
      getCustomerName(customer),
      customer.email,
      customer.orderCount,
      formatMoney(customer.lifetimeSpend),
      formatMoney(customer.averageOrderValue),
      formatDate(customer.lastOrderDate),
      customer.isSubscribedToEmails ? "Yes" : "No",
    ])}
  />
);

const ProductsTable = ({ products }) => (
  <SimpleTable
    headers={["Product", "Type", "Genre", "BPM", "Key", "Units", "Revenue", "Orders", "Avg Sale", "Rev/Order", "Top License", "First Sold", "Last Sold"]}
    empty="No product analytics yet."
    rows={products.map((product) => [
      product.title,
      formatProductType(product.type),
      product.genre || "None",
      product.bpm || "None",
      product.key || "None",
      product.unitsSold,
      formatMoney(product.grossRevenue),
      product.orderCount,
      formatMoney(product.averageSalePrice),
      formatMoney(product.revenuePerOrder),
      product.topLicense,
      formatDate(product.firstSoldAt),
      formatDate(product.lastSoldAt),
    ])}
  />
);

const LicensesTable = ({ licenses }) => (
  <SimpleTable
    headers={["License", "Units", "Revenue"]}
    empty="No license analytics yet."
    rows={licenses.map((license) => [
      license.name,
      license.unitsSold,
      formatMoney(license.grossRevenue),
    ])}
  />
);

const RevenuePanel = ({ summary, breakdowns }) => {
  const productTypeRows = (breakdowns?.revenueByProductType || []).map((row) => ({
    ...row,
    label: formatProductType(row.type),
  }));
  const customerRows = (breakdowns?.topCustomersBySpend || []).map((customer) => ({
    ...customer,
    name: getCustomerName(customer),
  }));

  return (
    <Box sx={{ display: "grid", gap: 2, minWidth: 0, width: "100%", overflow: "visible" }}>
      <Panel sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.6fr) 320px" }, gap: 2.5, minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              Net Completed Revenue
            </Typography>
            <Typography sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" }, fontWeight: 950, lineHeight: 1, mt: 0.7 }}>
              {formatMoney(summary.completedRevenue)}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              <MetricPill label="Avg Order" value={formatMoney(summary.averageOrderValue)} />
              <MetricPill label="Pending" value={formatMoney(summary.pendingRevenue)} />
              <MetricPill label="Sold" value={summary.totalProductsSold} />
            </Box>
            <MarketLineChart
              rows={breakdowns?.revenueByDay || []}
              xKey="date"
              yKey="revenue"
              formatter={formatMoney}
            />
          </Box>
          <Box sx={{ display: "grid", gap: 1.5, minWidth: 0 }}>
            <MiniInsight label="Best Seller" value={summary.bestSellingProduct} />
            <MiniInsight label="Top License" value={summary.mostCommonLicense} />
            <DonutChartPanel
              title="Order Mix"
              rows={Object.entries(breakdowns?.ordersByStatus || {}).map(([label, value]) => ({ label, value }))}
            />
          </Box>
        </Box>
      </Panel>

      <RevenueSection title="Momentum" meta="Growth and order pace across the selected range">
        <Grid container spacing={2} sx={{ minWidth: 0 }}>
          <Grid item xs={12} lg={7} sx={{ minWidth: 0 }}>
            <LineChartPanel
              title="Cumulative Revenue"
              rows={breakdowns?.cumulativeRevenue || []}
              xKey="date"
              yKey="revenue"
              formatter={formatMoney}
            />
          </Grid>
          <Grid item xs={12} lg={5} sx={{ minWidth: 0 }}>
            <BarChartPanel
              title="Daily Order Volume"
              rows={breakdowns?.ordersByDay || []}
              labelKey="date"
              valueKey="orders"
              compact
            />
          </Grid>
        </Grid>
      </RevenueSection>

      <RevenueSection title="Sales Mix" meta="Where revenue is coming from">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }, gap: 2, minWidth: 0 }}>
          <BarChartPanel
            title="Revenue By Product Type"
            rows={productTypeRows}
            labelKey="label"
            valueKey="grossRevenue"
            formatter={formatMoney}
          />
          <MixSummary rows={productTypeRows} />
        </Box>
      </RevenueSection>

      <RevenueSection title="Leaders" meta="Products and customers driving the most value">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2, minWidth: 0 }}>
          <LeaderboardGroup title="Products">
            <BarChartPanel
              title="Revenue"
              rows={breakdowns?.topProductsByRevenue || []}
              labelKey="title"
              valueKey="grossRevenue"
              formatter={formatMoney}
              compact
            />
            <BarChartPanel
              title="Units Sold"
              rows={breakdowns?.topProductsByUnits || []}
              labelKey="title"
              valueKey="unitsSold"
              compact
            />
          </LeaderboardGroup>
          <LeaderboardGroup title="Customers">
            <BarChartPanel
              title="Spend"
              rows={customerRows}
              labelKey="name"
              valueKey="lifetimeSpend"
              formatter={formatMoney}
              compact
            />
          </LeaderboardGroup>
        </Box>
      </RevenueSection>
    </Box>
  );
};

const RevenueSection = ({ title, meta, children }) => (
  <Box sx={{ display: "grid", gap: 1.2, minWidth: 0 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "end", px: 0.3 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 950 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
          {meta}
        </Typography>
      </Box>
    </Box>
    {children}
  </Box>
);

const MetricPill = ({ label, value }) => (
  <Box sx={(theme) => ({
    px: 1.2,
    py: 0.8,
    borderRadius: "999px",
    border: theme.custom.clay.hairline,
    bgcolor: "rgba(255,255,255,0.045)",
    display: "flex",
    gap: 0.8,
    alignItems: "center",
  })}>
    <Typography sx={{ color: "text.secondary", fontSize: "0.74rem", fontWeight: 800 }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.78rem", fontWeight: 950 }}>{value}</Typography>
  </Box>
);

const MiniInsight = ({ label, value }) => (
  <Box sx={(theme) => ({
    p: 1.5,
    borderRadius: "12px",
    border: theme.custom.clay.hairline,
    bgcolor: "rgba(255,255,255,0.04)",
  })}>
    <Typography sx={{ color: "text.secondary", fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "1rem", fontWeight: 950, mt: 0.5, overflowWrap: "anywhere" }}>
      {value}
    </Typography>
  </Box>
);

const LeaderboardGroup = ({ title, children }) => (
  <Panel sx={{ p: 1.5, minWidth: 0 }}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.66rem",
      fontWeight: 900,
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 1.5,
    }}>
      {title}
    </Typography>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        lg: title === "Customers" ? "1fr" : "1fr 1fr",
      },
      gap: 1.5,
      minWidth: 0,
    }}>
      {children}
    </Box>
  </Panel>
);

const MixSummary = ({ rows }) => {
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.grossRevenue || 0), 0);
  const totalUnits = rows.reduce((sum, row) => sum + Number(row.unitsSold || 0), 0);

  return (
    <Panel sx={{ p: 2.1, minWidth: 0 }}>
      <Typography sx={{
        fontFamily: (theme) => theme.custom.fonts.mono,
        fontSize: "0.68rem",
        fontWeight: 900,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "text.secondary",
        mb: 1.5,
      }}>
        Product Type Share
      </Typography>
      {rows.length ? (
        <Box sx={{ display: "grid", gap: 1.2 }}>
          {rows.map((row) => {
            const revenue = Number(row.grossRevenue || 0);
            const share = totalRevenue ? (revenue / totalRevenue) * 100 : 0;

            return (
              <Box key={row.type} sx={(theme) => ({
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 1,
                alignItems: "center",
                p: 1.2,
                borderRadius: "10px",
                bgcolor: "rgba(255,255,255,0.035)",
                border: theme.custom.clay.hairline,
              })}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900 }}>{row.label}</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                    {row.unitsSold} of {totalUnits} units
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontWeight: 950 }}>{share.toFixed(1)}%</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{formatMoney(revenue)}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <EmptyChart />
      )}
    </Panel>
  );
};

const ChartShell = ({ title, children }) => (
  <Panel sx={{ p: 2.1, minWidth: 0, overflow: "hidden" }}>
    <Typography sx={{
      fontFamily: (theme) => theme.custom.fonts.mono,
      fontSize: "0.68rem",
      fontWeight: 900,
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 1.5,
    }}>
      {title}
    </Typography>
    {children}
  </Panel>
);

const BarChartPanel = ({ title, rows, labelKey, valueKey, formatter = (value) => value, compact = false }) => {
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 0);
  const visibleRows = compact ? rows.slice(0, 6) : rows;

  return (
    <ChartShell title={title}>
      {rows.length ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {visibleRows.map((row) => {
            const value = Number(row[valueKey] || 0);
            const width = max ? `${Math.max((value / max) * 100, 3)}%` : "0%";

            return (
              <Box key={`${row[labelKey]}-${value}`}>
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) max-content",
                  gap: 1.5,
                  alignItems: "start",
                  mb: 0.55,
                }}>
                  <Typography sx={{
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    minWidth: 0,
                    overflowWrap: "anywhere",
                    lineHeight: 1.25,
                  }}>
                    {row[labelKey]}
                  </Typography>
                  <Typography sx={{
                    fontSize: "0.82rem",
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                    lineHeight: 1.25,
                  }}>
                    {formatter(value)}
                  </Typography>
                </Box>
                <Box sx={{
                  height: 8,
                  borderRadius: "999px",
                  bgcolor: "rgba(255,255,255,0.055)",
                  overflow: "hidden",
                }}>
                  <Box sx={{
                    width,
                    height: "100%",
                    borderRadius: "999px",
                    background: "linear-gradient(90deg, #FF579F 0%, #0091AD 100%)",
                    boxShadow: "0 0 18px rgba(255,87,159,0.22)",
                  }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <EmptyChart />
      )}
    </ChartShell>
  );
};

const MarketLineChart = ({ rows, xKey, yKey, formatter = (value) => value }) => {
  const values = rows.map((row) => Number(row[yKey] || 0));
  const max = Math.max(...values, 0);
  const latest = values[values.length - 1] || 0;
  const points = rows.map((row, index) => {
    const x = rows.length > 1 ? (index / (rows.length - 1)) * 100 : 50;
    const y = max ? 92 - (Number(row[yKey] || 0) / max) * 78 : 92;
    return `${x},${y}`;
  }).join(" ");

  return rows.length ? (
    <Box sx={{ mt: 2.5 }}>
      <Box sx={{ height: { xs: 260, md: 340 }, position: "relative", color: "primary.main" }}>
        <Box sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "100% 25%, 16.666% 100%",
          maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }} />
        <Box
          component="svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          sx={{ position: "relative", width: "100%", height: "100%", display: "block", filter: "drop-shadow(0 10px 24px rgba(255,87,159,0.25))" }}
        >
          <defs>
            <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF579F" />
              <stop offset="100%" stopColor="#0091AD" />
            </linearGradient>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF579F" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0091AD" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,100 ${points} 100,100`} fill="url(#revenueFill)" />
          <polyline points={points} fill="none" stroke="url(#revenueLine)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 1 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{rows[0]?.[xKey]}</Typography>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 950 }}>{formatter(latest)} latest</Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{rows[rows.length - 1]?.[xKey]}</Typography>
      </Box>
    </Box>
  ) : (
    <EmptyChart height={300} />
  );
};

const LineChartPanel = ({ title, rows, xKey, yKey, formatter = (value) => value }) => {
  const values = rows.map((row) => Number(row[yKey] || 0));
  const max = Math.max(...values, 0);
  const points = rows.map((row, index) => {
    const x = rows.length > 1 ? (index / (rows.length - 1)) * 100 : 50;
    const y = max ? 100 - ((Number(row[yKey] || 0) / max) * 86 + 7) : 93;
    return `${x},${y}`;
  }).join(" ");

  return (
    <ChartShell title={title}>
      {rows.length ? (
        <>
          <Box sx={{ height: 220, position: "relative", color: "primary.main" }}>
            <Box sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "100% 25%",
            }} />
            <Box
              component="svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              sx={{ position: "relative", width: "100%", height: "100%", display: "block" }}
            >
              <polygon points={`0,100 ${points} 100,100`} fill="currentColor" opacity="0.08" />
              <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 1 }}>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{rows[0]?.[xKey]}</Typography>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 900 }}>{formatter(max)}</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{rows[rows.length - 1]?.[xKey]}</Typography>
          </Box>
        </>
      ) : (
        <EmptyChart />
      )}
    </ChartShell>
  );
};

const DonutChartPanel = ({ title, rows }) => {
  const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const colors = ["#FF579F", "#0091AD", "#D8C6B3"];
  let cursor = 0;
  const gradient = total
    ? rows.map((row, index) => {
        const start = cursor;
        const end = cursor + (Number(row.value || 0) / total) * 100;
        cursor = end;
        return `${colors[index % colors.length]} ${start}% ${end}%`;
      }).join(", ")
    : "rgba(255,255,255,0.08) 0 100%";

  return (
    <ChartShell title={title}>
      {rows.length ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "130px minmax(0, 1fr)", lg: "1fr" }, gap: 2, alignItems: "center", justifyItems: { xs: "center", sm: "start", lg: "center" } }}>
          <Box sx={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: `conic-gradient(${gradient})`,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 16px 36px rgba(0,0,0,0.26)",
          }}>
            <Box sx={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              bgcolor: "background.paper",
              display: "grid",
              placeItems: "center",
            }}>
              <Typography sx={{ fontWeight: 900 }}>{total}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "grid", gap: 1, width: "100%" }}>
            {rows.map((row, index) => (
              <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Typography sx={{ fontSize: "0.84rem", textTransform: "capitalize" }}>
                  <Box component="span" sx={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", bgcolor: colors[index % colors.length], mr: 1 }} />
                  {row.label}
                </Typography>
                <Typography sx={{ fontSize: "0.84rem", fontWeight: 900 }}>{row.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <EmptyChart />
      )}
    </ChartShell>
  );
};

const EmptyChart = ({ height = 160 }) => (
  <Box sx={{
    height,
    display: "grid",
    placeItems: "center",
    color: "text.secondary",
    border: (theme) => theme.custom.clay.hairline,
    borderRadius: "10px",
    bgcolor: "rgba(255,255,255,0.03)",
  }}>
    No chart data yet.
  </Box>
);

const SimpleTable = ({ headers, rows, empty }) => (
  <Panel>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.map((header) => <AdminHeadCell key={header}>{header}</AdminHeadCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length ? rows.map((row, index) => (
            <TableRow hover key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <TableCell key={`${cell}-${cellIndex}`} sx={{ whiteSpace: cellIndex === 0 ? "normal" : "nowrap" }}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={headers.length} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Panel>
);

export default AdminOrders;

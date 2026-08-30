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

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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

const productTypes = ["beat", "loop_kit", "drum_kit", "plugin"];

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

const buildOrderQuery = ({ page, rowsPerPage, search, statusFilter, typeFilter, sortBy }) => {
  const params = new URLSearchParams({
    page: String(page + 1),
    size: String(rowsPerPage),
    sort: sortBy,
    direction: "DESC",
  });

  if (search.trim()) params.set("search", search.trim());
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);

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
  const [tab, setTab] = useState("orders");
  const [expanded, setExpanded] = useState({});
  const [receiptState, setReceiptState] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      try {
        const summaryRes = await csrfFetch("/api/admin/dashboard");
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
  }, []);

  useEffect(() => {
    if (loading) return undefined;
    let isMounted = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const query = buildOrderQuery({ page, rowsPerPage, search, statusFilter, typeFilter, sortBy });
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
  }, [loading, page, rowsPerPage, search, statusFilter, typeFilter, sortBy]);

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
}) => (
  <Panel sx={{ p: 1.5, mb: 2 }}>
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 1fr) 150px 170px 170px" },
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

const RevenuePanel = ({ summary, breakdowns }) => (
  <>
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      <StatCard icon={<ShoppingBagIcon />} label="Completed Revenue" value={formatMoney(summary.completedRevenue)} />
      <StatCard icon={<ShoppingBagIcon />} label="Pending Revenue" value={formatMoney(summary.pendingRevenue)} />
      <StatCard icon={<Inventory2Icon />} label="Best Seller" value={summary.bestSellingProduct} />
      <StatCard icon={<ReceiptLongIcon />} label="Top License" value={summary.mostCommonLicense} />
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <SimpleTable
          headers={["Month", "Revenue"]}
          empty="No monthly revenue yet."
          rows={(breakdowns?.revenueByMonth || []).map((row) => [row.month, formatMoney(row.revenue)])}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SimpleTable
          headers={["Product Type", "Units", "Revenue"]}
          empty="No product type revenue yet."
          rows={(breakdowns?.revenueByProductType || []).map((row) => [
            formatProductType(row.type),
            row.unitsSold,
            formatMoney(row.grossRevenue),
          ])}
        />
      </Grid>
    </Grid>
  </>
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

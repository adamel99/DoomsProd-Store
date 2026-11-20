import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import { csrfFetch } from "../../store/csrf";
import { formatDate } from "../../utils/formatters";

const emptySale = { name: "", type: "code", code: "", discountPercent: "25", minBasicBeatCount: "2", startsAt: "", endsAt: "", isIndefinite: true, isActive: true };
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";

const AdminSales = () => {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(emptySale);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      const response = await csrfFetch("/api/admin/promotions");
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (err) {
      const data = await err.json?.().catch(() => ({}));
      setError(data.message || "Could not load sales.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const reset = () => { setForm(emptySale); setEditingId(null); };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const toDate = (value, end = false) => value ? new Date(`${value}T${end ? "23:59:59" : "00:00:00"}`).toISOString() : null;
    const payload = {
      ...form,
      discountPercent: Number(form.discountPercent),
      minBasicBeatCount: Number(form.minBasicBeatCount || 2),
      startsAt: toDate(form.startsAt),
      endsAt: form.isIndefinite ? null : toDate(form.endsAt, true),
    };
    try {
      const response = await csrfFetch(editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setPromotions((current) => editingId
        ? current.map((promotion) => promotion.id === editingId ? data.promotion : promotion)
        : [data.promotion, ...current]);
      setNotice(editingId ? "Sale updated." : "Sale created.");
      reset();
    } catch (err) {
      const data = await err.json?.().catch(() => ({}));
      setError(data.message || "Could not save this sale.");
    } finally { setSaving(false); }
  };

  const edit = (sale) => {
    setEditingId(sale.id);
    setForm({ ...sale, discountPercent: String(sale.discountPercent), minBasicBeatCount: String(sale.minBasicBeatCount || 2), startsAt: dateValue(sale.startsAt), endsAt: dateValue(sale.endsAt), isIndefinite: !sale.endsAt });
    setError(""); setNotice("");
  };

  const toggle = async (sale) => {
    setError("");
    try {
      const response = await csrfFetch(`/api/admin/promotions/${sale.id}/toggle`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !sale.isActive }),
      });
      const data = await response.json();
      setPromotions((current) => current.map((item) => item.id === sale.id ? data.promotion : item));
    } catch (err) {
      const data = await err.json?.().catch(() => ({}));
      setError(data.message || "Could not change sale status.");
    }
  };

  const activeCount = promotions.filter((sale) => sale.isActive).length;
  const saleTypeLabel = (sale) => sale.type === "code"
    ? "Promo code"
    : sale.type === "first_purchase" ? "First purchase" : "Basic lease bundle";

  return (
    <Box sx={{ display: "grid", gap: { xs: 2, md: 2.5 } }}>
      {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert>}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography sx={{ color: "primary.main", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Promotion manager</Typography>
          <Typography sx={{ fontSize: { xs: "1.35rem", md: "1.55rem" }, fontWeight: 800, letterSpacing: "-0.025em", mt: 0.35 }}>Sales & promo codes</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", mt: 0.35 }}>Create offers, control when they run, and compare them with automatic sales.</Typography>
        </Box>
        <Chip icon={<LocalOfferOutlinedIcon />} label={`${activeCount} active`} sx={{ alignSelf: { xs: "flex-start", sm: "center" }, color: "success.main", bgcolor: "rgba(104,199,165,0.08)", border: "1px solid rgba(104,199,165,0.2)", boxShadow: "none" }} />
      </Box>

      <Box component="form" onSubmit={save} sx={{ position: "relative", overflow: "hidden", p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: "20px", bgcolor: "rgba(23,21,28,0.82)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 22px 52px rgba(0,0,0,0.2)", "&:before": { content: "''", position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #E42278, rgba(228,34,120,0.12) 72%, transparent)" } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.4, mb: 2.5 }}>
          <Box sx={{ width: 42, height: 42, flex: "0 0 auto", display: "grid", placeItems: "center", borderRadius: "13px", color: "primary.main", bgcolor: "rgba(228,34,120,0.1)", border: "1px solid rgba(228,34,120,0.22)" }}>
            {editingId ? <LocalOfferOutlinedIcon /> : <AddRoundedIcon />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{editingId ? "Edit promotion" : "Create a promotion"}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.3 }}>Set the offer and its eligibility. You can pause it at any time.</Typography>
          </Box>
          {editingId && <Chip size="small" label="Editing" color="primary" />}
        </Box>

        <Grid container spacing={1.6}>
          <Grid item xs={12} md={4}>
            <TextField required fullWidth size="small" label="Sale name" placeholder="e.g. First purchase" value={form.name} onChange={setField("name")} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small"><InputLabel>Promotion type</InputLabel><Select label="Promotion type" value={form.type} onChange={setField("type")}>
              <MenuItem value="code">Promo code</MenuItem><MenuItem value="first_purchase">First purchase</MenuItem><MenuItem value="bundle">Basic lease bundle</MenuItem>
            </Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField required fullWidth size="small" type="number" inputProps={{ min: 0.01, max: 100, step: 0.01 }} label="Discount percentage" value={form.discountPercent} onChange={setField("discountPercent")} InputProps={{ endAdornment: <Typography sx={{ color: "text.secondary", pr: 1, fontWeight: 700 }}>%</Typography> }} />
          </Grid>
          {form.type === "code" && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField required fullWidth size="small" label="Promo code" placeholder="e.g. WELCOME25" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
            </Grid>
          )}
          {form.type === "bundle" && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small" type="number" inputProps={{ min: 2, step: 1 }} label="Basic leases required" value={form.minBasicBeatCount} onChange={setField("minBasicBeatCount")} />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 2.6, pt: 2.2, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.35 }}>
            <CalendarMonthOutlinedIcon sx={{ color: "text.secondary", fontSize: 19 }} />
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800 }}>Offer schedule</Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "text.disabled" }}>Optional start date; choose a fixed end or indefinite.</Typography>
          </Box>
          <Grid container spacing={1.6} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Starts on" value={form.startsAt} onChange={setField("startsAt")} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Ends on" value={form.endsAt} onChange={setField("endsAt")} disabled={form.isIndefinite} required={!form.isIndefinite} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", minHeight: 48, px: 1.35, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <FormControlLabel
                  sx={{ m: 0, flex: 1, ".MuiFormControlLabel-label": { fontSize: "0.8rem", fontWeight: 650 } }}
                  control={<Checkbox checked={form.isIndefinite} onChange={(event) => setForm((current) => ({ ...current, isIndefinite: event.target.checked }))} size="small" />}
                  label="Run indefinitely"
                />
                <Typography sx={{ color: "text.disabled", fontSize: "0.7rem", display: { xs: "none", sm: "block" } }}>Turn it off manually</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, justifyContent: "space-between", gap: 1.2, mt: 2.5, pt: 2, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <Typography sx={{ alignSelf: "center", color: "text.disabled", fontSize: "0.74rem" }}>The best eligible offer is applied at checkout.</Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {editingId && <Button type="button" variant="outlined" onClick={reset}>Cancel</Button>}
            <Button type="submit" variant="contained" disabled={saving} startIcon={editingId ? <LocalOfferOutlinedIcon /> : <AddRoundedIcon />}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create sale"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gap: 1.2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>Your promotions</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.77rem", mt: 0.25 }}>Toggle active offers on or off, or edit their terms.</Typography>
          </Box>
          {!loading && <Typography sx={{ color: "text.disabled", fontSize: "0.74rem" }}>{promotions.length} total · {activeCount} active</Typography>}
        </Box>
        {loading ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            {[0, 1].map((key) => <Box key={key} sx={{ height: 86, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.05)" }} />)}
          </Box>
        ) : promotions.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, px: 2, borderRadius: "18px", border: "1px dashed rgba(255,255,255,0.15)", bgcolor: "rgba(255,255,255,0.018)" }}>
            <LocalOfferOutlinedIcon sx={{ color: "text.disabled", fontSize: 30 }} />
            <Typography sx={{ fontWeight: 750, mt: 1 }}>No promotions yet</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.4 }}>Create your first offer using the form above.</Typography>
          </Box>
        ) : promotions.map((sale) => (
          <Box key={sale.id} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1.1, md: 1.8 }, p: { xs: 1.4, md: 1.8 }, borderRadius: "16px", bgcolor: "rgba(23,21,28,0.7)", border: "1px solid rgba(255,255,255,0.075)", transition: "border-color 160ms ease, transform 160ms ease", "&:hover": { borderColor: "rgba(255,255,255,0.14)", transform: "translateY(-1px)" } }}>
            <Switch checked={sale.isActive} onChange={() => toggle(sale)} inputProps={{ "aria-label": `Turn ${sale.name} ${sale.isActive ? "off" : "on"}` }} />
            <Box sx={{ flex: 1, minWidth: { xs: "calc(100% - 64px)", sm: 250 } }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.8, mb: 0.35 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.88rem" }}>{sale.name}</Typography>
                <Chip size="small" label={saleTypeLabel(sale)} sx={{ height: 22, fontSize: "0.61rem", color: "text.secondary", bgcolor: "rgba(255,255,255,0.035)", boxShadow: "none" }} />
                {sale.type === "code" && <Chip size="small" label={sale.code} sx={{ height: 22, fontSize: "0.62rem", color: "primary.light", bgcolor: "rgba(228,34,120,0.08)", boxShadow: "none" }} />}
              </Box>
              <Typography sx={{ color: "text.secondary", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: 0.6, overflowWrap: "anywhere" }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                {sale.startsAt ? formatDate(sale.startsAt) : "Starts immediately"} · {sale.endsAt ? `Ends ${formatDate(sale.endsAt)}` : "Indefinite"}
                {sale.type === "bundle" ? ` · ${sale.minBasicBeatCount}+ paid Basic leases` : sale.type === "first_purchase" ? " · First paid purchase" : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: { xs: "auto", sm: 0 }, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "flex-end" }, minWidth: 72 }}>
              <Typography sx={{ color: "primary.main", fontWeight: 850, fontSize: "1.35rem", lineHeight: 1 }}>{Number(sale.discountPercent)}%</Typography>
              <Typography sx={{ color: "text.disabled", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", mt: 0.35 }}>discount</Typography>
              </Box>
              <Chip size="small" icon={sale.isActive ? <LocalOfferOutlinedIcon /> : <PauseCircleOutlineIcon />} label={sale.isActive ? "Active" : "Paused"} sx={{ height: 26, color: sale.isActive ? "success.main" : "text.secondary", bgcolor: sale.isActive ? "rgba(104,199,165,0.08)" : "rgba(255,255,255,0.035)", border: `1px solid ${sale.isActive ? "rgba(104,199,165,0.18)" : "rgba(255,255,255,0.07)"}`, boxShadow: "none", "& .MuiChip-icon": { color: "inherit", fontSize: 15 } }} />
              <Button size="small" variant="outlined" onClick={() => edit(sale)} sx={{ minWidth: 72, minHeight: 36, px: 1.3, bgcolor: "rgba(255,255,255,0.015)" }}>Edit</Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminSales;

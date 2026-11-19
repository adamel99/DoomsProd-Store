import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
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

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      <Box component="form" onSubmit={save} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{editingId ? "Edit sale" : "Create a sale"}</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}><TextField required fullWidth size="small" label="Sale name" value={form.name} onChange={setField("name")} /></Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small"><InputLabel>Sale type</InputLabel><Select label="Sale type" value={form.type} onChange={setField("type")}>
              <MenuItem value="code">Promo code</MenuItem><MenuItem value="first_purchase">First purchase</MenuItem><MenuItem value="bundle">2+ Basic beat leases</MenuItem>
            </Select></FormControl>
          </Grid>
          {form.type === "code" && <Grid item xs={12} sm={6} md={2}><TextField required fullWidth size="small" label="Promo code" value={form.code} onChange={setField("code")} /></Grid>}
          <Grid item xs={6} sm={3} md={2}><TextField required fullWidth size="small" type="number" inputProps={{ min: 0.01, max: 100, step: 0.01 }} label="Discount %" value={form.discountPercent} onChange={setField("discountPercent")} /></Grid>
          {form.type === "bundle" && <Grid item xs={6} sm={3} md={2}><TextField fullWidth size="small" type="number" inputProps={{ min: 2, step: 1 }} label="Basic beats required" value={form.minBasicBeatCount} onChange={setField("minBasicBeatCount")} /></Grid>}
          <Grid item xs={6} sm={6} md={3}><TextField fullWidth size="small" type="date" label="Starts" value={form.startsAt} onChange={setField("startsAt")} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={6} sm={6} md={3}><TextField fullWidth size="small" type="date" label="Ends" value={form.endsAt} onChange={setField("endsAt")} disabled={form.isIndefinite} required={!form.isIndefinite} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.isIndefinite} onChange={(event) => setForm((current) => ({ ...current, isIndefinite: event.target.checked }))} />}
              label="Indefinite (no end date; I’ll turn it off when I choose)"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create sale"}</Button>
              {editingId && <Button onClick={reset}>Cancel edit</Button>}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: "grid", gap: 1 }}>
        <Typography variant="h6">Your sales</Typography>
        {loading ? <Typography color="text.secondary">Loading sales…</Typography> : promotions.length === 0 ? <Typography color="text.secondary">No sales yet.</Typography> : promotions.map((sale) => (
          <Box key={sale.id} sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
            <Switch checked={sale.isActive} onChange={() => toggle(sale)} inputProps={{ "aria-label": `Turn ${sale.name} ${sale.isActive ? "off" : "on"}` }} />
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography fontWeight={700}>{sale.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {sale.type === "code" ? `Code: ${sale.code}` : sale.type === "first_purchase" ? "First completed purchase" : `${sale.minBasicBeatCount}+ Basic beat leases`}
                {` · ${Number(sale.discountPercent)}% off`}
                {` · ${sale.startsAt ? `Starts ${formatDate(sale.startsAt)}` : "No start date"} · ${sale.endsAt ? `Ends ${formatDate(sale.endsAt)}` : "Indefinite"}`}
              </Typography>
            </Box>
            <Chip size="small" label={sale.isActive ? "On" : "Off"} color={sale.isActive ? "success" : "default"} />
            <Button size="small" onClick={() => edit(sale)}>Edit</Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AdminSales;

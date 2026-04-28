import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  useTheme,
  InputBase,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import FilterListIcon from "@mui/icons-material/FilterList";
import ProductCard from "../ProductCard/ProductCard";
import * as productActions from "../../store/products";

// ─── Ambient Background ─────────────────────────────────────────────────────
const LiquidBackground = React.memo(() => (
  <Box sx={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <Box sx={{
      position: "absolute", top: "-15vh", left: "-10vw",
      width: { xs: "60vw", md: "45vw" }, height: { xs: "60vw", md: "45vw" },
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 40%, rgba(228,63,111,0.13) 0%, transparent 70%)",
      filter: "blur(90px)",
      animation: "orbFloat1 22s ease-in-out infinite",
      "@keyframes orbFloat1": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "33%": { transform: "translate(4vw, 6vh) scale(1.08)" },
        "66%": { transform: "translate(-3vw, 3vh) scale(0.95)" },
      },
    }} />
    <Box sx={{
      position: "absolute", bottom: "10vh", right: "-10vw",
      width: { xs: "50vw", md: "35vw" }, height: { xs: "50vw", md: "35vw" },
      borderRadius: "50%",
      background: "radial-gradient(circle at 60% 60%, rgba(150,20,60,0.10) 0%, transparent 70%)",
      filter: "blur(100px)",
      animation: "orbFloat2 28s ease-in-out infinite reverse",
      "@keyframes orbFloat2": {
        "0%,100%": { transform: "translate(0,0) scale(1)" },
        "50%": { transform: "translate(-5vw, -4vh) scale(1.1)" },
      },
    }} />
    <Box sx={{
      position: "absolute", inset: 0, opacity: 0.022,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat", backgroundSize: "128px 128px",
    }} />
  </Box>
));

// ─── Glass Panel — deep blur, layered borders ───────────────────────────────
const GlassPanel = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      background: "rgba(255,255,255,0.025)",
      backdropFilter: "blur(36px)",
      WebkitBackdropFilter: "blur(36px)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderTop: "1px solid rgba(255,255,255,0.13)",
      borderLeft: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "28px",
      boxShadow: [
        "0 1px 0 rgba(255,255,255,0.06) inset",
        "0 32px 80px rgba(0,0,0,0.65)",
        "0 2px 4px rgba(0,0,0,0.45)",
      ].join(", "),
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Neumorphic surface — for inset / pressed elements ──────────────────────
const NeumorphInset = ({ children, sx = {}, ...rest }) => (
  <Box
    sx={{
      background: "linear-gradient(145deg, #0e0b0d, #181118)",
      borderRadius: "16px",
      boxShadow: [
        "inset 4px 4px 10px rgba(0,0,0,0.7)",
        "inset -2px -2px 6px rgba(255,255,255,0.025)",
      ].join(", "),
      border: "1px solid rgba(255,255,255,0.04)",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

// ─── Liquid Orb (kept for header title flanking only) ───────────────────────
const LiquidOrb = ({ size = 80, color = "rgba(228,63,111,0.7)", sx = {} }) => (
  <Box sx={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, ${color} 45%, rgba(0,0,0,0.4) 100%)`,
    boxShadow: [
      `0 ${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.55)`,
      `inset 0 ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
    ].join(", "),
    ...sx,
  }} />
);

// ─── Accent rule ────────────────────────────────────────────────────────────
const AccentRule = ({ width = 40, sx = {} }) => (
  <Box sx={{
    width,
    height: "2px",
    background: "linear-gradient(90deg, #E43F6F, transparent)",
    borderRadius: "2px",
    boxShadow: "0 0 8px rgba(228,63,111,0.45)",
    ...sx,
  }} />
);

// ─── Query helper ────────────────────────────────────────────────────────────
const useQuery = () => new URLSearchParams(useLocation().search);

// ─── Main Component ──────────────────────────────────────────────────────────
const ProductList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const urlSearchTerm = query.get("search")?.toLowerCase() || "";

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => { dispatch(productActions.getAllProductsThunk()); }, [dispatch]);
  useEffect(() => { setSearchTerm(urlSearchTerm); }, [urlSearchTerm]);

  const allProductsArray = Object.values(allProducts || {});
  const isAdmin = sessionUser?.role === "admin" || sessionUser?.email === "adamelh1999@gmail.com";

  const filteredProducts = useMemo(() => {
    return allProductsArray.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const genre = product.genre?.toLowerCase() || "";
      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        genre.includes(searchTerm);
      const matchesType =
        filterType === "all" || product.type?.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [allProductsArray, searchTerm, filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      history.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      history.push("/products");
    }
  };

  const productTypes = useMemo(() => {
    const types = new Set(allProductsArray.map((p) => p.type).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [allProductsArray]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <Box sx={{
      background: "#0e0b0d",
      minHeight: "100vh",
      pt: { xs: 5, md: 8 },
      pb: { xs: 8, md: 14 },
      position: "relative",
      overflow: "hidden",
    }}>
      <LiquidBackground />

      {/* Parallax ambient bleeds — no orb shapes, just light */}
      <Box component={motion.div} style={{ y: y1 }} sx={{
        position: "absolute", top: "-80px", right: "10%",
        width: { xs: 180, md: 280 }, height: { xs: 180, md: 280 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(228,63,111,0.09) 0%, transparent 70%)",
        filter: "blur(70px)", zIndex: 1, pointerEvents: "none",
      }} />
      <Box component={motion.div} style={{ y: y2 }} sx={{
        position: "absolute", top: "50%", left: "-5%",
        width: { xs: 150, md: 220 }, height: { xs: 150, md: 220 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(160,20,60,0.08) 0%, transparent 70%)",
        filter: "blur(80px)", zIndex: 1, pointerEvents: "none",
      }} />

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="xl">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ textAlign: "center", mb: 8, position: "relative" }}>
              {/* Flanking orbs — kept intentionally */}
              <LiquidOrb size={40} color="rgba(228,63,111,0.65)" sx={{
                position: "absolute", left: { xs: "4%", md: "12%" }, top: "20%",
                display: { xs: "none", sm: "block" },
                animation: "orbBob 7s ease-in-out infinite",
                "@keyframes orbBob": {
                  "0%,100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }} />
              <LiquidOrb size={26} color="rgba(160,30,70,0.7)" sx={{
                position: "absolute", right: { xs: "4%", md: "14%" }, top: "10%",
                display: { xs: "none", sm: "block" },
                animation: "orbBob 9s ease-in-out infinite reverse",
              }} />

              <Typography sx={{
                fontFamily: `"DM Sans", sans-serif`,
                fontSize: "0.7rem", fontWeight: 600,
                letterSpacing: "3px", textTransform: "uppercase",
                color: "#E43F6F", mb: 1.5,
              }}>
                {searchTerm ? "Search Results" : "Full Catalog"}
              </Typography>

              <Typography variant="h1" sx={{
                fontFamily: `"Syne", sans-serif`,
                fontWeight: 800, letterSpacing: "-3px",
                fontSize: { xs: "3rem", sm: "4.5rem", md: "6.5rem" },
                background: "linear-gradient(180deg, #FFEAEC 0%, rgba(255,234,236,0.5) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 0.95, mb: 2,
              }}>
                {searchTerm ? `"${searchTerm}"` : "The Collection"}
              </Typography>

              {/* Accent rule under title */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
                <AccentRule width={48} />
              </Box>

              {/* Count — inset pill */}
              <NeumorphInset sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: "100px",
                mt: 1,
              }}>
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#E43F6F",
                  boxShadow: "0 0 6px rgba(228,63,111,0.8)",
                  flexShrink: 0,
                }} />
                <Typography sx={{
                  fontFamily: `"DM Sans", sans-serif`,
                  color: "rgba(255,234,236,0.45)",
                  fontSize: "0.85rem",
                }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} available
                </Typography>
              </NeumorphInset>
            </Box>
          </motion.div>

          {/* ── Search + Controls ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            <GlassPanel sx={{ p: { xs: 2, md: 2.5 }, mb: 4, maxWidth: 900, mx: "auto" }}>
              <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2, alignItems: "center",
              }}>
                {/* Search bar — inset neumorph style */}
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
                  sx={{
                    flex: 1, display: "flex",
                    background: "linear-gradient(145deg, #0e0b0d, #161014)",
                    borderRadius: "100px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    boxShadow: [
                      "inset 4px 4px 10px rgba(0,0,0,0.65)",
                      "inset -2px -2px 6px rgba(255,255,255,0.02)",
                    ].join(", "),
                    transition: "all 0.25s ease",
                    "&:focus-within": {
                      borderColor: "rgba(228,63,111,0.3)",
                      boxShadow: [
                        "inset 4px 4px 10px rgba(0,0,0,0.65)",
                        "inset -2px -2px 6px rgba(255,255,255,0.02)",
                        "0 0 0 2px rgba(228,63,111,0.12)",
                      ].join(", "),
                    },
                  }}
                >
                  <InputBase
                    placeholder="Search beats, kits, loops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{ px: 3, py: 1.2, fontSize: "0.95rem", color: "#FFEAEC",
                      "& input::placeholder": { color: "rgba(255,234,236,0.25)" },
                    }}
                  />
                  <IconButton
                    type="submit"
                    sx={{
                      m: 0.6, width: 40, height: 40, borderRadius: "100px",
                      bgcolor: "#E43F6F", color: "#FFEAEC", flexShrink: 0,
                      boxShadow: [
                        "0 4px 14px rgba(228,63,111,0.4)",
                        "inset 0 1px 0 rgba(255,255,255,0.2)",
                        "3px 3px 8px rgba(0,0,0,0.4)",
                      ].join(", "),
                      "&:hover": { bgcolor: "#c02d5a" },
                    }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* View toggle — neumorph raised buttons */}
                <Box sx={{ display: { xs: "none", md: "flex" }, flexShrink: 0 }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, v) => { if (v !== null) setViewMode(v); }}
                    sx={{
                      background: "linear-gradient(145deg, #1a141a, #120e12)",
                      borderRadius: "100px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      overflow: "hidden",
                      boxShadow: [
                        "5px 5px 14px rgba(0,0,0,0.6)",
                        "-2px -2px 8px rgba(255,255,255,0.02)",
                        "inset 0 1px 0 rgba(255,255,255,0.04)",
                      ].join(", "),
                      "& .MuiToggleButton-root": {
                        color: "rgba(255,234,236,0.35)",
                        border: "none",
                        px: 2, py: 1,
                        transition: "all 0.2s ease",
                        "&.Mui-selected": {
                          bgcolor: "#E43F6F",
                          color: "#fff",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(228,63,111,0.4)",
                          "&:hover": { bgcolor: "#c02d5a" },
                        },
                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)", color: "#FFEAEC" },
                      },
                    }}
                  >
                    <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </GlassPanel>
          </motion.div>

          {/* ── Filter Chips ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
          >
            <Box sx={{
              display: "flex", gap: 1.5, flexWrap: "wrap",
              justifyContent: "center", mb: 5, alignItems: "center",
            }}>
              <FilterListIcon sx={{ color: "rgba(255,234,236,0.2)", fontSize: 16 }} />
              {productTypes.map((type) => {
                const isActive = filterType === type;
                return (
                  <Box
                    key={type}
                    onClick={() => setFilterType(type)}
                    sx={{
                      px: 2.5, py: 0.85,
                      borderRadius: "100px",
                      cursor: "pointer",
                      fontFamily: `"DM Sans", sans-serif`,
                      fontSize: "0.82rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#FFEAEC" : "rgba(255,234,236,0.35)",
                      // Active = raised glass; inactive = pressed neumorph inset
                      background: isActive
                        ? "rgba(228,63,111,0.15)"
                        : "linear-gradient(145deg, #0e0b0d, #161014)",
                      border: isActive
                        ? "1px solid rgba(228,63,111,0.35)"
                        : "1px solid rgba(255,255,255,0.04)",
                      backdropFilter: isActive ? "blur(16px)" : "none",
                      boxShadow: isActive
                        ? [
                            "4px 4px 12px rgba(0,0,0,0.5)",
                            "-1px -1px 4px rgba(255,255,255,0.02)",
                            "0 0 16px rgba(228,63,111,0.12)",
                            "inset 0 1px 0 rgba(228,63,111,0.15)",
                          ].join(", ")
                        : [
                            "inset 3px 3px 8px rgba(0,0,0,0.6)",
                            "inset -1px -1px 4px rgba(255,255,255,0.02)",
                          ].join(", "),
                      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                      "&:hover": {
                        color: isActive ? "#FFEAEC" : "rgba(255,234,236,0.65)",
                        transform: isActive ? "translateY(-2px)" : "none",
                        borderColor: isActive ? "rgba(228,63,111,0.5)" : "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Box>
                );
              })}
            </Box>
          </motion.div>

          {/* ── Admin Add Button ─────────────────────────────────────────── */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <Box textAlign="center" sx={{ mb: 6 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => history.push("/products/new")}
                  sx={{ px: 4, py: 1.5, fontSize: "0.95rem" }}
                >
                  Add New Product
                </Button>
              </Box>
            </motion.div>
          )}

          {/* ── Products Grid ────────────────────────────────────────────── */}
          {filteredProducts.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Grid
                container
                spacing={3}
                justifyContent="center"
                sx={{
                  ...(viewMode === "list" && {
                    "& > .MuiGrid-item": { maxWidth: "100%", flexBasis: "100%" },
                  }),
                }}
              >
                {filteredProducts.map((product) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === "list" ? 12 : 6}
                    md={viewMode === "list" ? 12 : 4}
                    lg={viewMode === "list" ? 12 : 3}
                    key={product.id}
                    component={motion.div}
                    variants={itemVariants}
                  >
                    <ProductCard customProduct={product} />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            /* ── Empty State — no orbs, refined glass + neumorph ──────── */
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mt: 10, mb: 10 }}>
                <GlassPanel sx={{ textAlign: "center", p: { xs: 5, md: 7 }, maxWidth: 480 }}>

                  {/* Inset accent block instead of orbs */}
                  <NeumorphInset sx={{
                    width: 64, height: 64,
                    borderRadius: "20px",
                    mx: "auto",
                    mb: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(228,63,111,0.12)",
                  }}>
                    <SearchIcon sx={{ color: "rgba(228,63,111,0.5)", fontSize: 28 }} />
                  </NeumorphInset>

                  <Typography sx={{
                    fontFamily: `"Syne", sans-serif`,
                    fontWeight: 800, fontSize: "1.5rem",
                    color: "#FFEAEC", mb: 1.5,
                  }}>
                    Nothing Found
                  </Typography>

                  <AccentRule width={32} sx={{ mx: "auto", mb: 2.5 }} />

                  <Typography sx={{
                    fontFamily: `"DM Sans", sans-serif`,
                    color: "rgba(255,234,236,0.38)", fontSize: "0.92rem", mb: 4,
                    lineHeight: 1.7,
                  }}>
                    {searchTerm
                      ? `No products match "${searchTerm}"`
                      : "No products available at the moment"}
                  </Typography>

                  {searchTerm && (
                    <Button
                      variant="outlined"
                      onClick={() => { setSearchTerm(""); history.push("/products"); }}
                      sx={{ px: 3, py: 1.2 }}
                    >
                      Clear Search
                    </Button>
                  )}
                </GlassPanel>
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* ── Floating Stats Badge ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <Box sx={{
          position: "fixed", bottom: 28, right: 28, zIndex: 10,
          display: { xs: "none", md: "block" },
        }}>
          {/* Outer glass ring */}
          <GlassPanel sx={{
            px: 3, py: 2,
            borderRadius: "20px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { transform: "translateY(-4px)" },
          }}>
            <Typography sx={{
              fontFamily: `"DM Sans", sans-serif`,
              color: "rgba(255,234,236,0.3)",
              fontSize: "0.6rem", textTransform: "uppercase",
              letterSpacing: "2px", mb: 0.5,
            }}>
              Showing
            </Typography>
            {/* Inset count — neumorph pressed */}
            <NeumorphInset sx={{
              px: 1.5, py: 0.5,
              borderRadius: "10px",
              display: "inline-block",
              minWidth: 48,
              textAlign: "center",
            }}>
              <Typography sx={{
                fontFamily: `"Syne", sans-serif`,
                color: "#E43F6F", fontWeight: 800,
                fontSize: "1.8rem", lineHeight: 1,
              }}>
                {filteredProducts.length}
              </Typography>
            </NeumorphInset>
          </GlassPanel>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ProductList;

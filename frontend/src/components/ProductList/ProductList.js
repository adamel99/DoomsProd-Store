import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Button,
  InputBase,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import ProductCard from "../ProductCard/ProductCard";
import * as productActions from "../../store/products";
import { formatProductType } from "../../utils/formatProductType";

const useQuery = () => new URLSearchParams(useLocation().search);

const sortOptions = [
  { value: "newest", label: "Most recent" },
  { value: "oldest", label: "Least recent" },
  { value: "title-az", label: "Title A-Z" },
  { value: "title-za", label: "Title Z-A" },
  { value: "price-low", label: "Price low-high" },
  { value: "price-high", label: "Price high-low" },
  { value: "bpm-low", label: "BPM low-high" },
  { value: "bpm-high", label: "BPM high-low" },
];

const getTime = (product) => {
  const time = new Date(product?.createdAt || product?.updatedAt || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getProductPrice = (product) => {
  const fixedPrice = getNumber(product?.price);
  if (fixedPrice !== null && fixedPrice > 0) return fixedPrice;

  const licensePrices = (product?.licenses || [])
    .map((license) => getNumber(license.price))
    .filter((price) => price !== null);

  return licensePrices.length ? Math.min(...licensePrices) : fixedPrice;
};

const compareNullableNumbers = (a, b, direction = "asc") => {
  const aNumber = getNumber(a);
  const bNumber = getNumber(b);

  if (aNumber === null && bNumber === null) return 0;
  if (aNumber === null) return 1;
  if (bNumber === null) return -1;

  return direction === "asc" ? aNumber - bNumber : bNumber - aNumber;
};

const newestFirst = (a, b) => (
  (getTime(b) - getTime(a)) || ((b.id || 0) - (a.id || 0))
);

const SectionLabel = ({ children }) => (
  <Typography sx={{
    fontFamily: (theme) => theme.custom.fonts.mono,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "2.4px",
    textTransform: "uppercase",
    color: "primary.main",
  }}>
    {children}
  </Typography>
);

const ProductList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const urlSearchTerm = query.get("search")?.toLowerCase() || "";

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => { dispatch(productActions.getAllProductsThunk()); }, [dispatch]);
  useEffect(() => { setSearchTerm(urlSearchTerm); }, [urlSearchTerm]);

  const allProductsArray = Object.values(allProducts || {});
  const isAdmin = sessionUser?.role === "admin";
  const displaySearchTerm = searchTerm.replace(/_/g, " ");
  const activeSortLabel = sortOptions.find((option) => option.value === sortBy)?.label || "Most recent";

  const productTypes = useMemo(() => {
    const types = new Set(allProductsArray.map((p) => p.type).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [allProductsArray]);

  const filteredProducts = useMemo(() => {
    const matches = allProductsArray.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const genre = product.genre?.toLowerCase() || "";
      const productKey = product.key?.toLowerCase() || "";
      const artistTags = product.artistTags?.toLowerCase() || "";
      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        genre.includes(searchTerm) ||
        productKey.includes(searchTerm) ||
        artistTags.includes(searchTerm);
      const matchesType =
        filterType === "all" || product.type?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });

    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (getTime(a) - getTime(b)) || ((a.id || 0) - (b.id || 0));
        case "title-az":
          return (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" }) || newestFirst(a, b);
        case "title-za":
          return (b.title || "").localeCompare(a.title || "", undefined, { sensitivity: "base" }) || newestFirst(a, b);
        case "price-low":
          return compareNullableNumbers(getProductPrice(a), getProductPrice(b), "asc") || newestFirst(a, b);
        case "price-high":
          return compareNullableNumbers(getProductPrice(a), getProductPrice(b), "desc") || newestFirst(a, b);
        case "bpm-low":
          return compareNullableNumbers(a.bpm, b.bpm, "asc") || newestFirst(a, b);
        case "bpm-high":
          return compareNullableNumbers(a.bpm, b.bpm, "desc") || newestFirst(a, b);
        case "newest":
        default:
          return newestFirst(a, b);
      }
    });
  }, [allProductsArray, searchTerm, filterType, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    history.push(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
  };

  return (
    <Box sx={{
      background: "background.default",
      minHeight: "100vh",
      pt: { xs: 7, md: 10 },
      pb: { xs: 8, md: 12 },
      color: "text.primary",
    }}>
      <Container maxWidth="xl">
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
          gap: { xs: 3, md: 5 },
          alignItems: "end",
          mb: { xs: 4, md: 6 },
          pb: { xs: 3, md: 4 },
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}>
          <Box>
            <SectionLabel>{searchTerm ? "Search results" : "Full catalog"}</SectionLabel>
            <Typography variant="h1" sx={{
              mt: 1.5,
              mb: 2,
              fontSize: { xs: "3rem", sm: "4.4rem", md: "6.2rem" },
              fontWeight: 700,
              lineHeight: 0.94,
              maxWidth: 780,
            }}>
              {searchTerm ? `"${displaySearchTerm}"` : "The Collection"}
            </Typography>
            <Typography sx={{
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.08rem" },
              maxWidth: 560,
            }}>
              Browse release-ready beats, kits, plugins, and production assets from the DOOMS catalog.
            </Typography>
          </Box>

          <Box sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            gap: 2,
            alignItems: { xs: "center", md: "flex-end" },
            justifyContent: "space-between",
          }}>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              color: "text.secondary",
              fontSize: "0.76rem",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
            </Typography>
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.body,
              color: "text.disabled",
              fontSize: { xs: "0.88rem", md: "0.82rem" },
              whiteSpace: "nowrap",
            }}>
              Sorted by {activeSortLabel}
            </Typography>

            {isAdmin && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => history.push("/products/new")}>
                Add Product
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" },
          gap: { xs: 3, lg: 4 },
          alignItems: "start",
        }}>
          <Box sx={(theme) => ({
            position: { lg: "sticky" },
            top: { lg: 100 },
            p: 2,
            borderRadius: "20px",
            background: theme.custom.clay.surfaceSoft,
            border: theme.custom.clay.border,
            boxShadow: theme.custom.clay.raised,
          })}>
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={(theme) => ({
                display: "flex",
                mb: 2,
                background: "rgba(241,218,191,0.42)",
                borderRadius: "16px",
                border: theme.custom.clay.hairline,
                boxShadow: theme.custom.clay.pressed,
                overflow: "hidden",
                "&:focus-within": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `${theme.custom.clay.pressed}, 0 0 0 3px ${theme.palette.primary.main}24`,
                },
              })}
            >
              <InputBase
                placeholder="Search catalog"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                inputProps={{ "aria-label": "Search products" }}
                sx={{
                  px: { xs: 2.25, md: 2 },
                  py: { xs: 1.35, md: 1.15 },
                  fontSize: { xs: "1.05rem", md: "0.95rem" },
                }}
              />
              <IconButton
                type="submit"
                aria-label="Search"
                sx={{ m: 0.6, borderRadius: "12px", width: { xs: 50, md: 44 }, height: { xs: 50, md: 44 } }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              color: "text.disabled",
              fontSize: "0.68rem",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              mb: 1.5,
            }}>
              Product type
            </Typography>

            <Box sx={{ display: "grid", gap: 0.75, mb: 2.5 }}>
              {productTypes.map((type) => {
                const isActive = filterType === type;
                return (
                  <Button
                    key={type}
                    onClick={() => setFilterType(type)}
                    sx={(theme) => ({
                      justifyContent: "space-between",
                      minHeight: { xs: 52, md: 44 },
                      fontSize: { xs: "1rem", md: "0.9rem" },
                      px: { xs: 2, md: 1.5 },
                      color: isActive ? "primary.contrastText" : "text.secondary",
                      background: isActive ? theme.palette.primary.main : "transparent",
                      boxShadow: isActive ? theme.custom.clay.raisedSmall : "none",
                      border: isActive ? "1px solid rgba(255,255,255,0.36)" : theme.custom.clay.hairline,
                      "&:hover": {
                        color: isActive ? "primary.contrastText" : "text.primary",
                        background: isActive ? theme.palette.primary.dark : "rgba(241,218,191,0.42)",
                      },
                    })}
                  >
                    <span>{type === "all" ? "All" : formatProductType(type)}</span>
                  </Button>
                );
              })}
            </Box>

            <FormControl
              fullWidth
              size="small"
              sx={{
                mb: 2.5,
                "& .MuiInputLabel-root": {
                  color: "text.disabled",
                },
                "& .MuiSelect-select": {
                  py: { xs: 1.45, md: 1.1 },
                  fontSize: { xs: "1rem", md: "0.9rem" },
                },
              }}
            >
              <InputLabel id="product-sort-label">Sort</InputLabel>
              <Select
                labelId="product-sort-label"
                label="Sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => { if (value) setViewMode(value); }}
              fullWidth
              sx={{
                display: { xs: "none", md: "flex" },
                "& .MuiToggleButton-root": {
                  flex: 1,
                  borderRadius: "14px !important",
                  border: (theme) => theme.custom.clay.hairline,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    color: "primary.main",
                    background: "rgba(225,90,151,0.1)",
                  },
                },
              }}
            >
              <ToggleButton value="grid" aria-label="Grid view"><GridViewIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="list" aria-label="List view"><ViewListIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            {filteredProducts.length > 0 ? (
              <Box sx={{
                display: "grid",
                gap: 2.25,
                gridTemplateColumns: viewMode === "list"
                  ? "1fr"
                  : {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                    xl: "repeat(5, minmax(0, 1fr))",
                  },
                alignItems: "stretch",
              }}>
                {filteredProducts.map((product) => (
                  <Box
                    key={product.id}
                    sx={{ display: "flex", minWidth: 0, maxWidth: "100%" }}
                  >
                    <ProductCard customProduct={product} viewMode={viewMode} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={(theme) => ({
                p: { xs: 4, md: 6 },
                borderRadius: "20px",
                background: theme.custom.clay.surfaceSoft,
                border: theme.custom.clay.border,
                boxShadow: theme.custom.clay.raised,
                textAlign: "center",
              })}>
                <SearchIcon sx={{ color: "primary.main", fontSize: 34, mb: 2 }} />
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Nothing found
                </Typography>
                <Typography sx={{ color: "text.secondary", mb: 3 }}>
                  {searchTerm ? `No products match "${searchTerm}".` : "No products are available right now."}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="outlined"
                    onClick={() => { setSearchTerm(""); history.push("/products"); }}
                  >
                    Clear search
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductList;

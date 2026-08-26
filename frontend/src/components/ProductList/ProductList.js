import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  InputBase,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
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

  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => { dispatch(productActions.getAllProductsThunk()); }, [dispatch]);
  useEffect(() => { setSearchTerm(urlSearchTerm); }, [urlSearchTerm]);

  const allProductsArray = Object.values(allProducts || {});
  const isAdmin = sessionUser?.role === "admin";
  const displaySearchTerm = searchTerm.replace(/_/g, " ");

  const productTypes = useMemo(() => {
    const types = new Set(allProductsArray.map((p) => p.type).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [allProductsArray]);

  const filteredProducts = useMemo(() => {
    return allProductsArray.filter((product) => {
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
  }, [allProductsArray, searchTerm, filterType]);

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
              Browse release-ready beats, kits, and production assets from the DOOMS catalog.
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
                sx={{ px: 2, py: 1.15, fontSize: "0.95rem" }}
              />
              <IconButton type="submit" aria-label="Search" sx={{ m: 0.6, borderRadius: "12px" }}>
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
              <Grid container spacing={2.25}>
                {filteredProducts.map((product) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === "list" ? 12 : 6}
                    md={viewMode === "list" ? 12 : 4}
                    lg={viewMode === "list" ? 12 : 3}
                    xl={viewMode === "list" ? 12 : 2.4}
                    key={product.id}
                  >
                    <ProductCard customProduct={product} viewMode={viewMode} />
                  </Grid>
                ))}
              </Grid>
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

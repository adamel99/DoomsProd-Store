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
  Chip,
  Fade,
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

const useQuery = () => new URLSearchParams(useLocation().search);

const ProductList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const urlSearchTerm = query.get("search")?.toLowerCase() || "";

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [isVisible, setIsVisible] = useState(false);

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(productActions.getAllProductsThunk());
    setIsVisible(true);
  }, [dispatch]);

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  const allProductsArray = Object.values(allProducts || {});
  const isAdmin =
    sessionUser?.role === "admin" ||
    sessionUser?.email === "adamelh1999@gmail.com";

  const filteredProducts = useMemo(() => {
    let products = allProductsArray.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const genre = product.genre?.toLowerCase() || "";
      const matchesSearch =
        searchTerm === "" ||
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        genre.includes(searchTerm);

      const matchesType =
        filterType === "all" ||
        product.type?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });

    return products;
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
    const types = new Set(
      allProductsArray.map((p) => p.type).filter(Boolean)
    );
    return ["all", ...Array.from(types)];
  }, [allProductsArray]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        pt: { xs: 4, md: 6 },
        pb: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Blobs */}
      <Box
        component={motion.div}
        style={{ y: y1 }}
        sx={{
          position: "absolute",
          top: { xs: "-100px", md: "-150px" },
          left: { xs: "-50px", md: "-100px" },
          width: { xs: 300, sm: 400, md: 600 },
          height: { xs: 300, sm: 400, md: 600 },
          bgcolor: "rgba(207, 18, 89, 0.15)",
          filter: "blur(120px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "float 20s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "50%": { transform: "translate(30px, 30px) scale(1.1)" },
          },
        }}
      />

      <Box
        component={motion.div}
        style={{ y: y2 }}
        sx={{
          position: "absolute",
          top: { xs: "400px", md: "600px" },
          right: { xs: "-100px", md: "-150px" },
          width: { xs: 250, sm: 350, md: 500 },
          height: { xs: 250, sm: 350, md: 500 },
          bgcolor: "rgba(28, 114, 147, 0.12)",
          filter: "blur(100px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />

      {/* Main Content */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Fade in={isVisible} timeout={800}>
            <Box sx={{ mb: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    textAlign: "center",
                    mb: 2,
                    letterSpacing: "-1px",
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {searchTerm ? `Search: "${searchTerm}"` : "The Collection"}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                    fontSize: "1.1rem",
                    maxWidth: 600,
                    mx: "auto",
                    mb: 4,
                  }}
                >
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}{" "}
                  available
                </Typography>
              </motion.div>

              {/* Search and Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    mb: 4,
                    maxWidth: 1200,
                    mx: "auto",
                  }}
                >
                  {/* Search Bar */}
                  <Box
                    component="form"
                    onSubmit={handleSearchSubmit}
                    sx={{
                      display: "flex",
                      flex: { xs: "1", md: "0 1 500px" },
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 4,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      overflow: "hidden",
                      backdropFilter: "blur(20px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${theme.palette.primary.main}40`,
                      },
                      "&:focus-within": {
                        border: `1px solid ${theme.palette.primary.main}`,
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
                      },
                    }}
                  >
                    <InputBase
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      sx={{
                        px: 3,
                        py: 1.5,
                        fontSize: "1rem",
                      }}
                    />
                    <IconButton
                      type="submit"
                      sx={{
                        px: 3,
                        borderRadius: 0,
                        bgcolor: theme.palette.primary.main,
                        color: "#fff",
                        "&:hover": {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Box>

                  {/* View Mode Toggle (Desktop) */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => {
                        if (newMode !== null) setViewMode(newMode);
                      }}
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.03)",
                        borderRadius: 2,
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        "& .MuiToggleButton-root": {
                          color: theme.palette.text.secondary,
                          border: "none",
                          px: 2,
                          "&.Mui-selected": {
                            bgcolor: theme.palette.primary.main,
                            color: "#fff",
                            "&:hover": {
                              bgcolor: theme.palette.primary.dark,
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="grid">
                        <GridViewIcon />
                      </ToggleButton>
                      <ToggleButton value="list">
                        <ViewListIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>
              </motion.div>

              {/* Filter Chips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    mb: 4,
                  }}
                >
                  <FilterListIcon
                    sx={{
                      color: theme.palette.text.secondary,
                      alignSelf: "center",
                      mr: 1,
                    }}
                  />
                  {productTypes.map((type) => (
                    <Chip
                      key={type}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                      onClick={() => setFilterType(type)}
                      sx={{
                        bgcolor:
                          filterType === type
                            ? theme.palette.primary.main
                            : "rgba(255, 255, 255, 0.05)",
                        color:
                          filterType === type
                            ? "#fff"
                            : theme.palette.text.secondary,
                        border: `1px solid ${
                          filterType === type
                            ? theme.palette.primary.main
                            : "rgba(255, 255, 255, 0.1)"
                        }`,
                        fontWeight: filterType === type ? 700 : 500,
                        fontSize: "0.9rem",
                        px: 1,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor:
                            filterType === type
                              ? theme.palette.primary.dark
                              : "rgba(255, 255, 255, 0.08)",
                          transform: "translateY(-2px)",
                          boxShadow:
                            filterType === type
                              ? `0 4px 12px ${theme.palette.primary.main}50`
                              : "0 4px 12px rgba(0, 0, 0, 0.3)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </motion.div>

              {/* Admin Add Button */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Box textAlign="center" sx={{ mb: 5 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => history.push("/products/new")}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: "1rem",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                        "&:hover": {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.info.main})`,
                          transform: "translateY(-3px)",
                          boxShadow: `0 12px 32px ${theme.palette.primary.main}60`,
                        },
                      }}
                    >
                      Add New Product
                    </Button>
                  </Box>
                </motion.div>
              )}
            </Box>
          </Fade>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid
                container
                spacing={4}
                justifyContent="center"
                sx={{
                  // Adjust grid based on view mode
                  ...(viewMode === "list" && {
                    "& > .MuiGrid-item": {
                      maxWidth: "100%",
                      flexBasis: "100%",
                    },
                  }),
                }}
              >
                {filteredProducts.map((product, index) => (
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  mt: 10,
                  mb: 10,
                  p: 6,
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 4,
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  No Products Found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                    opacity: 0.8,
                  }}
                >
                  {searchTerm
                    ? `We couldn't find any products matching "${searchTerm}"`
                    : "No products available at the moment"}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm("");
                      history.push("/products");
                    }}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        bgcolor: `${theme.palette.primary.main}15`,
                      },
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </Box>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* Floating Stats Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10,
            background: `linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(20, 20, 20, 0.98))`,
            borderRadius: 2,
            px: 3,
            py: 2,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)`,
            backdropFilter: "blur(20px)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            gap: 0.5,
            border: `1px solid ${theme.palette.primary.main}30`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 12px 40px rgba(207, 18, 89, 0.4)`,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total Products
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {filteredProducts.length}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ProductList

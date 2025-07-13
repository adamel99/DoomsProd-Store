import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  useTheme,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import * as productActions from "../../store/products";
import { motion } from "framer-motion";

const useQuery = () => new URLSearchParams(useLocation().search);

const ProductList = () => {
  const theme = useTheme(); // <-- use theme here
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const searchTerm = query.get("search")?.toLowerCase() || "";

  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(productActions.getAllProductsThunk());
  }, [dispatch]);

  const allProductsArray = Object.values(allProducts || {});
  const isAdmin = sessionUser?.role === "admin" || sessionUser?.email === "adamelh1999@gmail.com";

  const filteredProducts = useMemo(() => {
    return allProductsArray.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const genre = product.genre?.toLowerCase() || "";
      return (
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        genre.includes(searchTerm)
      );
    });
  }, [allProductsArray, searchTerm]);


  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        py: theme.spacing(8),
        px: theme.spacing(2),
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blurry Neon Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-150px",
          left: "-100px",
          width: 500,
          height: 500,
          bgcolor: theme.palette.primary.main + "33", // Slightly transparent primary color
          filter: "blur(180px)",
          borderRadius: "50%",
          zIndex: 0,
          animation: "pulse 12s ease-in-out infinite",
          "@keyframes pulse": {
            "0%,100%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.05)" },
          },
        }}
      />

      <Box
        component="svg"
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          zIndex: 1,
          opacity: 0.15,
          transform: "scale(1.2)",
        }}
      >
        <path
          fill={theme.palette.primary.main}
          d="M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
        M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z;
        M580,500Q500,600,400,600Q300,600,250,525Q200,450,150,375Q100,300,160,230Q220,160,320,150Q420,140,490,200Q560,260,590,330Q620,400,580,500Z;
        M549.5,567Q492,634,405,647.5Q318,661,271.5,597Q225,533,175,466.5Q125,400,172.5,323Q220,246,290,203Q360,160,449,182Q538,204,568,302Q598,400,549.5,567Z
      "
          />
        </path>
      </Box>


      {/* Main content */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              color: "white",
              textAlign: "center",
              mb: theme.spacing(6),
              letterSpacing: "-0.5px",
              textShadow: `0 0 12px ${theme.palette.primary.main}80`,
            }}
          >
            {searchTerm ? `Search Results for "${searchTerm}"` : "PRODUCTS"}
          </Typography>

          {isAdmin && (
            <Box textAlign="center" sx={{ mb: theme.spacing(5) }}>
              <Button
                variant="contained"
                onClick={() => history.push("/products/new")}
                sx={{
                  px: theme.spacing(6.25), // 5 * 8px = 40px
                  py: theme.spacing(1.875), // 1.5 * 8px = 12px
                  borderRadius: theme.shape.borderRadius * 6,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                  boxShadow: `0 8px 30px ${theme.palette.primary.main}4D`, // 30% opacity
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  },
                }}
              >
                + Add New Product
              </Button>
            </Box>
          )}

          {filteredProducts.length > 0 ? (
            <Grid
              container
              spacing={4}
              justifyContent="center"
              component={motion.div}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {filteredProducts.map((product) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={product.id}
                  component={motion.div}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard customProduct={product} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: "center",
                mt: theme.spacing(10),
                fontStyle: "italic",
              }}
            >
              No beats found{searchTerm ? ` matching "${searchTerm}"` : "."}
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductList;

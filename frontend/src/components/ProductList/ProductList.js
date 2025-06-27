import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
} from "@mui/material";
import { useLocation, useHistory } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import * as productActions from "../../store/products";
import { motion } from "framer-motion";

const useQuery = () => new URLSearchParams(useLocation().search);

const ProductList = () => {
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
    return allProductsArray.filter((product) =>
      product.title?.toLowerCase().includes(searchTerm)
    );
  }, [allProductsArray, searchTerm]);

  return (
    <Box
      sx={{
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
        py: 8,
        px: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 900,
            color: "primary.main",
            textAlign: "center",
            mb: 6,
            letterSpacing: "-0.5px",
          }}
        >
          {searchTerm ? `Search Results for "${searchTerm}"` : "PRODUCTS"}
        </Typography>

        {isAdmin && (
          <Box textAlign="center" sx={{ mb: 5 }}>
            <Button
              variant="contained"
              onClick={() => history.push("/products/new")}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: "30px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #ff4081, #ff6699)",
                boxShadow: "0 8px 30px rgba(255, 64, 129, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #ff6699, #ff4081)",
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
            spacing={3}
            justifyContent="center"
            component={motion.div}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
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
                xl={2}
                key={product.id}
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ProductCard customProduct={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              mt: 10,
              fontStyle: "italic",
            }}
          >
            No beats found{searchTerm ? ` matching "${searchTerm}"` : "."}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default ProductList;

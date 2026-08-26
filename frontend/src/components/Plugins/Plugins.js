import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useHistory } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import * as productActions from "../../store/products";

const PluginsPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const allProducts = useSelector((state) => state.products.allProducts);
  const sessionUser = useSelector((state) => state.session.user);
  const isAdmin = sessionUser?.role === "admin";

  useEffect(() => {
    dispatch(productActions.getAllProductsThunk());
  }, [dispatch]);

  const plugins = useMemo(() => (
    Object.values(allProducts || {}).filter((product) => product.type === "plugin")
  ), [allProducts]);

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
            <Typography sx={{
              fontFamily: (theme) => theme.custom.fonts.mono,
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "2.4px",
              textTransform: "uppercase",
              color: "primary.main",
            }}>
              Production tools
            </Typography>
            <Typography variant="h1" sx={{
              mt: 1.5,
              mb: 2,
              fontSize: { xs: "3rem", sm: "4.4rem", md: "6.2rem" },
              lineHeight: 0.94,
              maxWidth: 780,
            }}>
              Plugins
            </Typography>
            <Typography sx={{
              color: "text.secondary",
              fontSize: { xs: "1rem", md: "1.08rem" },
              maxWidth: 560,
            }}>
              Downloadable music production plugins built for mixing, tone shaping, and faster creative decisions.
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
              {plugins.length} {plugins.length === 1 ? "plugin" : "plugins"}
            </Typography>

            {isAdmin && (
              <Button variant="contained" onClick={() => history.push("/products/new")}>
                Add Plugin
              </Button>
            )}
          </Box>
        </Box>

        {plugins.length > 0 ? (
          <Grid container spacing={2.25}>
            {plugins.map((plugin) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={plugin.id}>
                <ProductCard customProduct={plugin} />
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
            <ExtensionIcon sx={{ color: "primary.main", fontSize: 38, mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 1 }}>
              No plugins available yet
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              New production tools will show up here as soon as they are released.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PluginsPage;

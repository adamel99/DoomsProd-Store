import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Container, Typography } from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useHistory } from "react-router-dom";
import * as productActions from "../../store/products";

const pluginButtonSx = {
  background: (theme) => theme.custom.colors.pink,
  backgroundImage: "none",
  borderColor: (theme) => theme.custom.transparent(theme.custom.colors.pink, 0.5),
  color: "primary.contrastText",
  "&:hover": {
    background: (theme) => theme.custom.colors.coralDark,
    backgroundImage: "none",
    borderColor: (theme) => theme.custom.transparent(theme.custom.colors.coralDark, 0.55),
  },
};

const PluginItem = ({ plugin, onOpen }) => (
  <Box
    onClick={() => onOpen(plugin.id)}
    sx={(theme) => ({
      minWidth: 0,
      height: "100%",
      cursor: "pointer",
      display: "grid",
      gridTemplateRows: { xs: "minmax(260px, 62vw) auto", sm: "310px auto", lg: "360px auto" },
      gap: { xs: 2.25, md: 3 },
      transition: theme.custom.motion.transition.lift,
      "&:hover": {
        transform: "translateY(-6px)",
      },
      "&:hover .plugin-page-image-stage": {
        boxShadow: theme.custom.clay.floating,
        borderColor: theme.custom.transparent(theme.palette.primary.main, 0.4),
      },
    })}
  >
    <Box
      className="plugin-page-image-stage"
      sx={(theme) => ({
        minWidth: 0,
        minHeight: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 2.75 },
        borderRadius: `${theme.custom.radius["4xl"]}px`,
        background: theme.custom.gradients.surfaceCool,
        border: theme.custom.clay.border,
        boxShadow: theme.custom.clay.raised,
        overflow: "hidden",
        transition: theme.custom.motion.transition.lift,
      })}
    >
      <Box
        component="img"
        src={plugin.imageUrl || "/placeholder.jpg"}
        alt={plugin.title}
        loading="lazy"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
      <Box sx={(theme) => ({
        position: "absolute",
        top: 18,
        left: 18,
        px: 1.2,
        py: 0.55,
        borderRadius: `${theme.custom.radius.pill}px`,
        background: theme.custom.transparent(theme.custom.colors.clay, 0.9),
        border: `1px solid ${theme.custom.transparent(theme.palette.primary.main, 0.28)}`,
        boxShadow: theme.custom.clay.raisedSmall,
      })}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.mono,
          fontSize: "0.62rem",
          fontWeight: 800,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          color: "text.primary",
        }}>
          Plugin
        </Typography>
      </Box>
    </Box>

    <Box sx={{
      px: { xs: 0.5, md: 1 },
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 1.35,
    }}>
      <Typography variant="h3" sx={{
        fontSize: { xs: "1.65rem", md: "1.95rem" },
        lineHeight: 1.05,
        color: "text.primary",
        overflowWrap: "anywhere",
      }}>
        {plugin.title}
      </Typography>
      {plugin.description && (
        <Typography sx={{
          color: "text.secondary",
          fontSize: { xs: "0.92rem", md: "0.98rem" },
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {plugin.description}
        </Typography>
      )}
      <Box sx={{ mt: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{
          fontFamily: (theme) => theme.custom.fonts.display,
          fontWeight: 900,
          fontSize: "1.35rem",
          color: "text.primary",
          lineHeight: 1,
        }}>
          ${plugin.price}
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{ ...pluginButtonSx, px: 2.2 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(plugin.id);
          }}
        >
          View Plugin
        </Button>
      </Box>
    </Box>
  </Box>
);

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
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 5, md: 4 },
            alignItems: "stretch",
          }}>
            {plugins.map((plugin) => (
              <PluginItem
                key={plugin.id}
                plugin={plugin}
                onOpen={(id) => history.push(`/products/${id}`)}
              />
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

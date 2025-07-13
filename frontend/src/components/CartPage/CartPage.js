import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { fetchCartItemsThunk, deleteCartItemThunk } from "../../store/cartItems";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  useTheme,
} from "@mui/material";

const CartPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const theme = useTheme();

  const user = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) =>
    Object.values(state.cartItems?.allItems || {})
  );

  useEffect(() => {
    dispatch(fetchCartItemsThunk());
  }, [dispatch]);

  // Calculate total price from flat price property
  const totalPrice = cartItems
    .reduce((acc, item) => acc + parseFloat(item.price || 0), 0)
    .toFixed(2);

  const handleRemove = (id) => {
    dispatch(deleteCartItemThunk(id));
  };

  const handleCheckout = () => {
    if (!user) {
      history.push("/login");
      return;
    }

    // Pass cartItems to checkout via location state
    history.push({
      pathname: "/checkout",
      state: { cartItems },
    });
  };

  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: theme.palette.text.primary,
          textAlign: "center",
        }}
      >
        Your Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
          Your cart is empty.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {cartItems.map(({ id, productName, type, licenseType, price, imageUrl }) => (
              <Grid item xs={12} md={6} lg={4} key={id}>
                <Card>
                  <CardMedia
                    component="img"
                    sx={{ width: 120 }}
                    image={imageUrl || "/default-image.png"}
                    alt={productName || "Product"}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6">{productName || "Unknown"}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Type: {type || "Unknown"}
                    </Typography>
                    {licenseType && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        License: {licenseType}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                      ${parseFloat(price || 0).toFixed(2)}
                    </Typography>
                    <Button onClick={() => handleRemove(id)} size="small" color="primary">
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
              Total: ${totalPrice}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckout}
              color="primary"
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CartPage;

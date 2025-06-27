import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
} from "@mui/material";
import { useHistory } from "react-router-dom";

const CartPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) =>
    Object.values(state.cartItems?.allItems || {})
  );

  useEffect(() => {
    dispatch(fetchCartItemsThunk());
  }, [dispatch]);

  const totalPrice = cartItems
    .reduce((acc, item) => {
      const price =
        parseFloat(item?.License?.price) ||
        parseFloat(item?.Product?.price) ||
        0;
      return acc + price;
    }, 0)
    .toFixed(2);

  const handleRemove = (id) => {
    dispatch(deleteCartItemThunk(id));
  };

  const handleCheckout = () => {
    if (!user) return history.push("/login");
    history.push("/checkout");
  };

  return (
    <Box sx={{ py: 6, px: 2, backgroundColor: "#141313", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, color: "#fff", textAlign: "center" }}
      >
        Your Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography sx={{ color: "#ccc", textAlign: "center" }}>
          Your cart is empty.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {cartItems.map(({ id, Product, License }) => (
              <Grid item xs={12} md={6} lg={4} key={id}>
                <Card
                  sx={{
                    display: "flex",
                    backgroundColor: "#1e1e1e",
                    color: "#fff",
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(255, 64, 129, 0.1)",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 120 }}
                    image={Product?.imageUrl || "/default-image.png"}
                    alt={Product?.title || "Product"}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {Product?.title || "Unknown"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Type: {Product?.type || "Unknown"}
                    </Typography>
                    {License && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        License: {License.name}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      $
                      {(
                        parseFloat(License?.price) ||
                        parseFloat(Product?.price) ||
                        0
                      ).toFixed(2)}
                    </Typography>
                    <Button
                      onClick={() => handleRemove(id)}
                      size="small"
                      sx={{ mt: 1, color: "#ff4081" }}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4, borderColor: "#444" }} />

          <Box textAlign="center">
            <Typography variant="h5" sx={{ color: "#fff", mb: 2 }}>
              Total: ${totalPrice}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckout}
              sx={{
                backgroundColor: "#ff4081",
                px: 4,
                py: 1.5,
                borderRadius: "30px",
                boxShadow: "0 4px 20px #ff408122",
                "&:hover": { backgroundColor: "#f50057" },
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

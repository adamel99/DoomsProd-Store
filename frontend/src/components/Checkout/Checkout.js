import React from "react";
import { useSelector } from "react-redux";
import StripeCheckoutButton from "../StripeCheckoutButton/StripeCheckoutButton";
import { Box, Typography } from "@mui/material";

const Checkout = () => {
  const user = useSelector((state) => state.session.user);
  const cartItems = useSelector((state) =>
    Object.values(state.cartItems?.allItems || {})
  );

  console.log("Cart items in Checkout:", cartItems);

  const formattedCartItems = cartItems.map((item) => ({
    productName: item.productName || "Untitled",
    licenseType: item.licenseType || "Standard",
    price: parseFloat(item.price) || 0,
    type: item.type || "Unknown",
    image: item.imageUrl || "/default-image.png",
    downloadUrl: item.downloadUrl || "",
  }));



  console.log("Formatted items:", formattedCartItems);

  return (
    <Box sx={{ p: 4, backgroundColor: "#141313", minHeight: "100vh", color: "#fff" }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Review Your Order
      </Typography>

      {formattedCartItems.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#1e1e1e",
            p: 2,
            mb: 2,
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          <img
            src={item.image}
            alt={item.productName}
            style={{ width: "80px", height: "80px", borderRadius: "8px", marginRight: "16px" }}
          />
          <Box>
            <Typography variant="h6">{item.productName}</Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              Type: {item.type}
            </Typography>
            <Typography variant="body2" sx={{ color: "#aaa" }}>
              License: {item.licenseType}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#fff" }}>
              Price: ${item.price.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      ))}

      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Typography variant="h5" sx={{ color: "#fff" }}>
          Total: $
          {formattedCartItems
            .reduce((acc, item) => acc + item.price, 0)
            .toFixed(2)}
        </Typography>
      </Box>

      <StripeCheckoutButton cartItems={formattedCartItems} userId={user?.id} />
    </Box>
  );
};

export default Checkout;

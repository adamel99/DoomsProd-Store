import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { csrfFetch } from "../../store/csrf";

const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(publishableKey);

const StripeCheckoutButton = ({ cartItems, userId }) => {
  const handleCheckout = async () => {
    try {
      if (!cartItems.length) {
        alert("Your cart is empty.");
        return;
      }

      await csrfFetch("/api/csrf/restore");

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

      // If free, use free checkout endpoint
      if (total === 0) {
        console.log("🆓 Processing free checkout");

        const response = await csrfFetch("/api/payment/free-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems }),
        });

        const data = await response.json();

        if (data.success) {
          alert("✅ Download links have been sent to your email!");
          window.location.href = "/checkout-success";
        } else {
          throw new Error(data.message || "Free checkout failed");
        }
        return;
      }

      // Otherwise, use Stripe for paid items
      console.log("💳 Processing paid checkout with Stripe");

      const response = await csrfFetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, userId }),
      });

      const data = await response.json();
      if (!data.sessionId) throw new Error("No sessionId received");

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error("❌ Checkout failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <button
      onClick={handleCheckout}
      style={{
        backgroundColor: "#ff4081",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: "30px",
        fontSize: "16px",
        cursor: "pointer",
        marginTop: "24px",
        boxShadow: "0 4px 12px rgba(255, 64, 129, 0.3)",
      }}
    >
      {total === 0 ? "Get Free Download" : "Pay with Stripe"}
    </button>
  );
};

export default StripeCheckoutButton;

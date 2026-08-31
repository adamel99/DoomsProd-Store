import React from "react";
import { useHistory } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { csrfFetch } from "../../store/csrf";

const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(publishableKey);

const StripeCheckoutButton = ({ cartItems, userId, disabled = false }) => {
  const history = useHistory();

  const handleCheckout = async () => {
    try {
      if (!cartItems.length) {
        alert("Your cart is empty.");
        return;
      }

      await csrfFetch("/api/csrf/restore");

      const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

      if (total === 0) {
        const response = await csrfFetch("/api/payment/free-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (data.success) {
          history.push({
            pathname: "/checkout-success",
            state: { downloadLinks: data.downloadLinks, isFree: true },
          });
        } else {
          throw new Error(data.message || "Free checkout failed");
        }
        return;
      }

      const response = await csrfFetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#6f5c65" : "#ff4081",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        borderRadius: "30px",
        fontSize: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        marginTop: "24px",
        boxShadow: disabled ? "none" : "0 4px 12px rgba(255, 64, 129, 0.3)",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      {total === 0 ? "Get Free Download" : "Pay with Stripe"}
    </button>
  );
};

export default StripeCheckoutButton;

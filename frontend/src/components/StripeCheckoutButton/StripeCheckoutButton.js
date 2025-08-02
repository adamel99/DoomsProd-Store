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

      console.log("Sending cartItems to create-session:", cartItems);

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
      console.error("❌ Stripe Checkout failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

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
      Pay with Stripe
    </button>
  );
};

export default StripeCheckoutButton;

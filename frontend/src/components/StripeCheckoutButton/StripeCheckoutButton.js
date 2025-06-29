import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { csrfFetch } from "../../store/csrf"; // adjust path if needed

// Load Stripe with your publishable key
const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
console.log("Loaded Stripe Key:", publishableKey);
const stripePromise = loadStripe(publishableKey);

const StripeCheckoutButton = ({ cartItems, userId }) => {
  const handleCheckout = async () => {
    if (!publishableKey) {
      console.error("Stripe public key is missing!");
      return;
    }

    try {
      // Ensure CSRF token is restored and set in cookies
      await csrfFetch("/api/csrf/restore", { credentials: "include" });

      // Send request to backend to create Stripe checkout session
      const response = await csrfFetch("/api/payment/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems, userId }),
        credentials: "include", // send cookies for auth
      });

      const data = await response.json();

      if (!data.sessionId) {
        console.error("No sessionId returned:", data);
        alert("Checkout session creation failed.");
        return;
      }

      const stripe = await stripePromise;

      // IMPORTANT: Only pass sessionId here; do NOT pass other options
      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        console.error("Stripe redirect error:", result.error.message);
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Stripe checkout error:", error);
      alert("An unexpected error occurred. Please try again.");
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

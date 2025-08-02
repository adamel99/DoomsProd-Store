import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const location = useLocation();

  // Extract session_id from URL query params (?session_id=...)
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h1>✅ Thank you for your purchase!</h1>
      <p>
        You’ll receive an email or link to download your beats and license shortly.
      </p>
      {sessionId && (
        <p>
          Or you can{" "}
          <Link to={`/downloads/${sessionId}`} style={{ color: "#ff4081" }}>
            download your files here
          </Link>
          .
        </p>
      )}
    </div>
  );
}

const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sendProductEmail } = require("../../utils/sendProductEmail");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", bodyParser.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_details?.email || session.customer_email || 'adamelh1999@gmail.com';
      if (!email) {
        console.warn("Missing customer email in session:", session.id);
        return res.status(400).send("Missing customer email");
      }

      const fileKeysStr = session.metadata?.fileKeys || "";
      const fileKeys = fileKeysStr
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      console.log("Extracted fileKeys from session metadata:", fileKeys);

      if (fileKeys.length === 0) {
        console.warn("⚠️ No valid fileKeys found. Skipping email.");
        return res.status(200).json({ received: true }); // Don't fail webhook
      }

      try {
        await sendProductEmail(email, fileKeys);
        console.log(`Email sent to ${email} with files:`, fileKeys);
        return res.status(200).json({ received: true });
      } catch (err) {
        console.error("Error sending email:", err);
        return res.status(500).send("Webhook processing failed");
      }
    }

    return res.status(200).json({ received: true });
  });



module.exports = router;

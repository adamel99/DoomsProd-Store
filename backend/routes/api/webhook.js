const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UniqueConstraintError } = require("sequelize");
const { sendProductEmail } = require("../../utils/sendProductEmail");
const { Order, User, ProcessedStripeEvent, sequelize } = require("../../db/models");
const { clearCartForOrder, getOrderDownloadFiles, getOrderReceiptDetails } = require("../../utils/checkout");

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook signature verification failed");
  }

  console.log(`Stripe webhook received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId || session.payment_status !== "paid") {
      return res.status(200).json({ received: true });
    }

    let email;
    let files = [];
    let receipt;

    try {
      await sequelize.transaction(async (transaction) => {
        await ProcessedStripeEvent.create({ id: event.id, type: event.type }, { transaction });

        const order = await Order.findByPk(orderId, {
          include: [{ model: User, attributes: ["email", "username"] }],
          transaction,
          lock: true,
        });

        if (!order || order.status === "completed") return;
        email = order.User.email;

        if (String(order.userId) !== String(session.metadata?.userId)) {
          const err = new Error("Order metadata mismatch");
          err.status = 400;
          throw err;
        }

        files = await getOrderDownloadFiles(order.id, transaction);

        await order.update({
          status: "completed",
          paymentIntentId: session.payment_intent || session.id,
        }, { transaction });

        await clearCartForOrder(order, transaction);
        receipt = await getOrderReceiptDetails(order.id, order.User, transaction);
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return res.status(200).json({ received: true });
      }
      console.error("Stripe checkout.session.completed handling failed:", err);
      if (err.status === 400) return res.status(400).send(err.message);
      throw err;
    }

    if (email && files.length) {
      try {
        await sendProductEmail(email, files, receipt);
      } catch (err) {
        console.error("Stripe paid checkout email failed:", err);
      }
    }
  }

  return res.status(200).json({ received: true });
});

module.exports = router;

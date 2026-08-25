const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { UniqueConstraintError } = require("sequelize");
const { sendProductEmail } = require("../../utils/sendProductEmail");
const { Order, User, ProcessedStripeEvent, sequelize } = require("../../db/models");
const { clearCartForOrder, getOrderFileKeys } = require("../../utils/checkout");

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send("Webhook signature verification failed");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId || session.payment_status !== "paid") {
      return res.status(200).json({ received: true });
    }

    try {
      await sequelize.transaction(async (transaction) => {
        await ProcessedStripeEvent.create({ id: event.id, type: event.type }, { transaction });

        const order = await Order.findByPk(orderId, {
          include: [{ model: User, attributes: ["email"] }],
          transaction,
          lock: true,
        });

        if (!order || order.status === "completed") return;

        if (String(order.userId) !== String(session.metadata?.userId)) {
          const err = new Error("Order metadata mismatch");
          err.status = 400;
          throw err;
        }

        const fileKeys = await getOrderFileKeys(order.id, transaction);
        if (fileKeys.length) {
          await sendProductEmail(order.User.email, fileKeys);
        }

        await order.update({
          status: "completed",
          paymentIntentId: session.payment_intent || session.id,
        }, { transaction });

        await clearCartForOrder(order, transaction);
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return res.status(200).json({ received: true });
      }
      if (err.status === 400) return res.status(400).send(err.message);
      throw err;
    }
  }

  return res.status(200).json({ received: true });
});

module.exports = router;

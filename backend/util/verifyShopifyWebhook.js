import crypto from "crypto";

const verifyShopifyWebhook = (req, res, next) => {
  try {
    const hmac = req.get("X-Shopify-Hmac-Sha256");
    const shopDomain = req.get("X-Shopify-Shop-Domain");

    const body = req.body;

    if (!hmac || !shopDomain || !body) {
      return res
        .status(401)
        .send("Unauthorized: Missing required headers or body.");
    }

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    const hash = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");

    if (hash === hmac) {
      req.body = JSON.parse(body.toString());
      next();
    } else {
      res.status(401).send("Unauthorized: Webhook signature does not match.");
    }
  } catch (error) {
    console.error("Webhook verification failed:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default verifyShopifyWebhook;

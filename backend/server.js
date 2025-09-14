import dotenv from "dotenv";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  hostName: process.env.SHOPIFY_STORE_DOMAIN,
  apiVersion: LATEST_API_VERSION,
});

app.get("/", (req, res) => res.send("Backend running ✅"));

app.get("/db-check", async (req, res) => {
  try {
    const count = await prisma.tenant.count();
    res.json({ ok: true, tenantCount: count });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/shopify-check", async (req, res) => {
  try {
    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_STORE_DOMAIN,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });

    const response = await client.get({ path: "shop" });
    res.json({ ok: true, shop: response.body.shop });
  } catch (err) {
    console.error("Shopify error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/shopify-products", async (req, res) => {
  try {
    const client = new shopify.clients.Rest({
      session: {
        shop: process.env.SHOPIFY_STORE_DOMAIN,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      },
    });

    const response = await client.get({
      path: "products",
      query: { limit: 50 }, 
    });

    res.json({ ok: true, products: response.body.products });
  } catch (err) {
    console.error("Shopify products error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

import express from "express";
import {
  handleProductUpdate,
  handleOrderCreate,
  handleCustomerUpdate,
} from "../controllers/webhookController.js";
import verifyShopifyWebhook from "../util/verifyShopifyWebhook.js";

const webhookRouter = express.Router();
const rawBodyParser = express.raw({ type: "application/json" });

webhookRouter
  .post(
    "/product-update",
    rawBodyParser,
    verifyShopifyWebhook,
    handleProductUpdate
  )
  .post("/order-create", rawBodyParser, verifyShopifyWebhook, handleOrderCreate)
  .post(
    "/customer-update",
    rawBodyParser,
    verifyShopifyWebhook,
    handleCustomerUpdate
  );

export default webhookRouter;

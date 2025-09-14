import express from "express";
import {
  ingestCustomers,
  ingestOrders,
  ingestProducts,
} from "../controllers/ingestControllers.js";

const ingestRouter = express.Router();

ingestRouter
  .post("/:tenantId/product", ingestProducts)
  .post("/:tenantId/customer", ingestCustomers)
  .post("/:tenantId/order", ingestOrders);

export default ingestRouter;

import express from "express";
import {
  ingestAll,
  ingestCustomers,
  ingestOrders,
  ingestProducts,
} from "../controllers/ingestControllers.js";

const ingestRouter = express.Router();

ingestRouter
  .post("/:tenantId/product", ingestProducts)
  .post("/:tenantId/customer", ingestCustomers)
  .post("/:tenantId/order", ingestOrders)
  .post("/:tenantId/all", ingestAll);

export default ingestRouter;

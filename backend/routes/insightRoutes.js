import express from "express";
import {
  getOrdersTrend,
  getRevenueOverTime,
  getSummaryInsights,
  getTopCustomers,
  getTopProducts,
} from "../controllers/insightController.js";
import protectRoute from "../middlewares/protectRoute.js";

const insightRouter = express.Router();

insightRouter
  .get("/summary", protectRoute, getSummaryInsights)
  .get("/orders-trend", protectRoute, getOrdersTrend)
  .get("/top-customers", protectRoute, getTopCustomers)
  .get("/top-products", protectRoute, getTopProducts)
  .get("/revenue", protectRoute, getRevenueOverTime);

export default insightRouter;

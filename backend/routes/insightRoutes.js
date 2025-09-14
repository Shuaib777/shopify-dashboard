import express from "express";
import {
  getOrdersTrend,
  getSummaryInsights,
} from "../controllers/insightController.js";
import protectRoute from "../middlewares/protectRoute.js";

const insightRouter = express.Router();

insightRouter
  .get("/summary", protectRoute, getSummaryInsights)
  .get("/orders-trend", protectRoute, getOrdersTrend);

export default insightRouter;

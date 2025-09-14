import express from "express";
import { getTopCustomers } from "../controllers/customerControllers.js";
import protectRoute from "../middlewares/protectRoute.js";

const customerRouter = express.Router();

customerRouter.get("/top", protectRoute, getTopCustomers);

export default customerRouter;

import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getTopProducts } from "../controllers/productControllers.js";

const productRouter = express.Router();

productRouter.get("/top", protectRoute, getTopProducts);

export default productRouter;

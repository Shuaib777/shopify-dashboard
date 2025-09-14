import express from "express";
import {
  createTenant,
  getAllTenant,
  login,
  logout,
} from "../controllers/tenantControllers.js";

const tenantRouter = express.Router();

tenantRouter
  .post("/", createTenant)
  .post("/login", login)
  .post("/logout", logout)
  .get("/", getAllTenant);

export default tenantRouter;

import dotenv from "dotenv";
import express from "express";
import tenantRouter from "./routes/tenantRoutes.js";
import ingestRouter from "./routes/ingestRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import insightRouter from "./routes/insightRoutes.js";

dotenv.config();
const app = express();

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/tenant", tenantRouter);
app.use("/api/ingest", ingestRouter);
app.use("/api/insight", insightRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.tenantToken;

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Tenant no longer exists" });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    console.error("Error in protected route:", error);
    res.status(401).json({ error: "Not authorized" });
  }
};

export default protectRoute;

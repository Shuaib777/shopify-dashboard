import { PrismaClient } from "@prisma/client";
import generateToken from "../util/authHelper.js";

const prisma = new PrismaClient();

export const createTenant = async (req, res) => {
  try {
    const { name, shopDomain, accessToken, email, apiKey, apiSecret } =
      req.body;

    if (
      !name ||
      !shopDomain ||
      !accessToken ||
      !email ||
      !apiKey ||
      !apiSecret
    ) {
      return res.status(400).json({
        error:
          "Name, shopDomain, accessToken, email, apiKey, and apiSecret are required",
      });
    }

    const tenant = await prisma.tenant.create({
      data: { name, shopDomain, accessToken, email, apiKey, apiSecret },
    });

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopDomain: tenant.shopDomain,
        email: tenant.email,
        createdAt: tenant.createdAt,
      },
    });
  } catch (err) {
    console.error("Error creating tenant:", err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const tenant = await prisma.tenant.findUnique({ where: { email } });
    if (!tenant) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    generateToken(tenant.id, res);

    res.status(200).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopDomain: tenant.shopDomain,
        email: tenant.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("tenantToken", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllTenant = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        shopDomain: true,
        email: true,
        createdAt: true,
      },
    });
    res.json({ tenants });
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ error: err.message });
  }
};

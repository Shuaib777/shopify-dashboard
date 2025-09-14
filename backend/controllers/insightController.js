import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getSummaryInsights = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    const totalCustomers = await prisma.customer.count({
      where: { tenantId },
    });

    const orders = await prisma.order.findMany({
      where: { tenantId },
      select: { totalPrice: true },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.status(200).json({
      success: true,
      insights: {
        totalCustomers,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Error fetching summary insights:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersTrend = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const { start, end } = req.query;

    const whereClause = { tenantId };
    if (start || end) {
      whereClause.createdAt = {};
      if (start) whereClause.createdAt.gte = new Date(start);
      if (end) whereClause.createdAt.lte = new Date(end);
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: { id: true, totalPrice: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const trends = {};
    orders.forEach((o) => {
      const date = o.createdAt.toISOString().split("T")[0];
      if (!trends[date]) {
        trends[date] = { totalOrders: 0, totalRevenue: 0 };
      }
      trends[date].totalOrders += 1;
      trends[date].totalRevenue += o.totalPrice;
    });

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (err) {
    console.error("Error fetching orders by date:", err);
    res.status(500).json({ error: err.message });
  }
};

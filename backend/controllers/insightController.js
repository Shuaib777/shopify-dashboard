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

export const getTopCustomers = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: "desc" }, // highest spend first
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        totalSpent: true,
      },
    });

    res.status(200).json({
      success: true,
      customers,
    });
  } catch (err) {
    console.error("Error fetching top customers:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { tenantId } },
      _sum: { price: true, quantity: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true },
    });

    const results = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        productId: tp.productId,
        title: product?.title || "Unknown",
        totalRevenue: tp._sum.price,
        totalQuantity: tp._sum.quantity,
      };
    });

    res.status(200).json({ success: true, products: results });
  } catch (err) {
    console.error("Error fetching top products:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getRevenueOverTime = async (req, res) => {
  try {
    const tenantId = req.tenant.id;
    const { startDate, endDate, interval = "daily" } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        tenantId: Number(tenantId),
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    const revenueMap = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key;

      if (interval === "monthly") {
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
      } else if (interval === "weekly") {
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(date.getDate() - date.getDay());
        key = firstDayOfWeek.toISOString().split("T")[0];
      } else {
        key = date.toISOString().split("T")[0];
      }

      revenueMap[key] = (revenueMap[key] || 0) + Number(order.totalPrice);
    });

    // Convert map to sorted array
    const revenueOverTime = Object.keys(revenueMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({ date, revenue: revenueMap[date] }));

    return res.json({ revenueOverTime });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

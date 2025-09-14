import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

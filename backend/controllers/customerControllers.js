import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTopCustomers = async (req, res) => {
  try {
    const tenantId = req.tenant.id;

    const customers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { totalSpent: "desc" }, // highest spend first
      take: 5, // limit to top 5
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

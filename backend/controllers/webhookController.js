import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const handleProductUpdate = async (req, res) => {
  const shopDomain = req.get("X-Shopify-Shop-Domain");
  const productData = req.body;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (!tenant) return res.status(404).send("Tenant not found.");

    const price = parseFloat(productData.variants[0]?.price) || 0;

    await prisma.product.upsert({
      where: { shopifyId: productData.id.toString() },
      update: {
        title: productData.title,
        price: price,
      },
      create: {
        shopifyId: productData.id.toString(),
        title: productData.title,
        price: price,
        tenantId: tenant.id,
      },
    });

    res.status(200).send("Product webhook received.");
  } catch (error) {
    console.error("Error handling product webhook:", error);
    res.status(500).send("Error processing webhook.");
  }
};

export const handleOrderCreate = async (req, res) => {
  const shopDomain = req.get("X-Shopify-Shop-Domain");
  const orderData = req.body;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (!tenant) return res.status(404).send("Tenant not found.");

    let customerId = null;
    if (orderData.customer?.id) {
      const customer = await prisma.customer.findUnique({
        where: { shopifyId: orderData.customer.id.toString() },
      });
      customerId = customer?.id || null;
    }

    const totalPrice = parseFloat(orderData.total_price) || 0;

    const savedOrder = await prisma.order.upsert({
      where: { shopifyId: orderData.id.toString() },
      update: { totalPrice, customerId },
      create: {
        shopifyId: orderData.id.toString(),
        totalPrice,
        tenantId: tenant.id,
        customerId,
        createdAt: new Date(orderData.created_at),
      },
    });

    if (orderData.line_items?.length > 0) {
      const shopifyProductIds = orderData.line_items
        .map((li) => li.product_id?.toString())
        .filter(Boolean);

      const productsInDb = await prisma.product.findMany({
        where: {
          shopifyId: { in: shopifyProductIds },
          tenantId: tenant.id,
        },
      });

      const productMap = new Map(productsInDb.map((p) => [p.shopifyId, p.id]));

      const orderItemPromises = orderData.line_items
        .map((li) => {
          const localProductId = productMap.get(li.product_id?.toString());
          if (!localProductId) return null;

          const itemPrice = parseFloat(li.price) || 0;

          return prisma.orderItem.upsert({
            where: {
              orderId_productId: {
                orderId: savedOrder.id,
                productId: localProductId,
              },
            },
            update: { quantity: li.quantity, price: itemPrice },
            create: {
              orderId: savedOrder.id,
              productId: localProductId,
              quantity: li.quantity,
              price: itemPrice,
            },
          });
        })
        .filter(Boolean);

      await Promise.all(orderItemPromises);
    }

    res.status(200).send("Order webhook received and processed.");
  } catch (error) {
    console.error("Error handling order webhook:", error);
    res.status(500).send("Error processing webhook.");
  }
};

export const handleCustomerUpdate = async (req, res) => {
  const shopDomain = req.get("X-Shopify-Shop-Domain");
  const customerData = req.body;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { shopDomain } });
    if (!tenant) return res.status(404).send("Tenant not found.");

    const totalSpent = parseFloat(customerData.total_spent) || 0;

    await prisma.customer.upsert({
      where: { shopifyId: customerData.id.toString() },
      update: {
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        totalSpent: totalSpent,
      },
      create: {
        shopifyId: customerData.id.toString(),
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        totalSpent: totalSpent,
        tenantId: tenant.id,
      },
    });

    res.status(200).send("Customer webhook received.");
  } catch (error) {
    console.error("Error handling customer webhook:", error);
    res.status(500).send("Error processing webhook.");
  }
};

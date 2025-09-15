import getShopifyClient from "../util/shopifyHelper.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ingestProducts = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const client = getShopifyClient(tenant);

    const response = await client.get({ path: "products" });
    const products = response.body.products;

    const savedProducts = [];

    for (const p of products) {
      const price = parseFloat(p.variants[0]?.price || 0);

      const savedProduct = await prisma.product.upsert({
        where: { shopifyId: p.id.toString() },
        update: {
          title: p.title,
          price,
          tenantId: tenant.id,
        },
        create: {
          shopifyId: p.id.toString(),
          title: p.title,
          price,
          tenantId: tenant.id,
        },
      });

      savedProducts.push(savedProduct);
    }

    return res.status(200).json({
      success: true,
      products: savedProducts,
    });
  } catch (err) {
    console.error("Error ingesting products:", err);
    res.status(500).json({ error: err.message });
  }
};

export const ingestCustomers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const client = getShopifyClient(tenant);

    const response = await client.get({ path: "customers" });
    const customers = response.body.customers;

    const savedCustomers = [];

    for (const c of customers) {
      const totalSpent = parseFloat(c.total_spent || 0);

      const savedCustomer = await prisma.customer.upsert({
        where: { shopifyId: c.id.toString() },
        update: {
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent,
          tenantId: tenant.id,
        },
        create: {
          shopifyId: c.id.toString(),
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          totalSpent,
          tenantId: tenant.id,
        },
      });

      savedCustomers.push(savedCustomer);
    }

    return res.status(200).json({
      success: true,
      customers: savedCustomers,
    });
  } catch (err) {
    console.error("Error ingesting customers:", err);
    res.status(500).json({ error: err.message });
  }
};

export const ingestOrders = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    const client = getShopifyClient(tenant);

    const response = await client.get({ path: "orders" });
    const orders = response.body.orders;

    const savedOrders = [];

    for (const o of orders) {
      let customerId = null;
      if (o.customer && o.customer.id) {
        const customer = await prisma.customer.findUnique({
          where: { shopifyId: o.customer.id.toString() },
        });
        customerId = customer?.id || null;
      }

      const totalPrice = parseFloat(o.total_price || 0);

      // Upsert order
      const savedOrder = await prisma.order.upsert({
        where: { shopifyId: o.id.toString() },
        update: {
          customerId,
          totalPrice,
          tenantId: tenant.id,
        },
        create: {
          shopifyId: o.id.toString(),
          customerId,
          totalPrice,
          tenantId: tenant.id,
        },
      });

      // line items → OrderItems
      if (o.line_items && o.line_items.length > 0) {
        for (const li of o.line_items) {
          const product = await prisma.product.findUnique({
            where: { shopifyId: li.product_id?.toString() },
          });

          if (product) {
            await prisma.orderItem.upsert({
              where: {
                orderId_productId: {
                  orderId: savedOrder.id,
                  productId: product.id,
                },
              },
              update: {
                quantity: li.quantity,
                price: parseFloat(li.price || 0),
              },
              create: {
                orderId: savedOrder.id,
                productId: product.id,
                quantity: li.quantity,
                price: parseFloat(li.price || 0),
              },
            });
          }
        }
      }

      savedOrders.push(savedOrder);
    }

    return res.status(200).json({
      success: true,
      orders: savedOrders,
    });
  } catch (err) {
    console.error("Error ingesting orders:", err);
    res.status(500).json({ error: err.message });
  }
};

export const ingestAll = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const mockRes = {
      status: () => mockRes,
      json: (data) => data,
    };

    const productResult = await ingestProducts(req, mockRes);
    if (!productResult.success) throw new Error("Product ingestion failed.");

    const customerResult = await ingestCustomers(req, mockRes);
    if (!customerResult.success) throw new Error("Customer ingestion failed.");

    const orderResult = await ingestOrders(req, mockRes);
    if (!orderResult.success) throw new Error("Order ingestion failed.");

    res.status(200).json({
      success: true,
      message: "Full data ingestion completed successfully.",
      summary: {
        products: productResult.products.length,
        customers: customerResult.customers.length,
        orders: orderResult.orders.length,
      },
    });
  } catch (err) {
    console.error(`Full ingestion failed for Tenant ID: ${tenantId}`, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

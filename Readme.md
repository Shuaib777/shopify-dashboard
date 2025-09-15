# 🛒 Shopify Data Ingestion & Insights Service

A multi-tenant service that ingests data from Shopify (Products, Customers, Orders) and provides business insights through APIs.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [API Documentation](#-api-documentation)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Usage Examples](#-usage-examples)

## ⚡ Features

- **Multi-tenant data isolation** - Each tenant/store has its own isolated data
- **JWT authentication** - Secure authentication stored in cookies
- **Shopify Data Ingestion** - Ingestion for Products, Customers, and Orders
- **Business Insights APIs** - Comprehensive analytics and reporting endpoints:
  - Business summary (customers, orders, revenue)
  - Orders trend with date filtering
  - Revenue over time with configurable intervals
  - Top customers by spend analysis
  - Top products by revenue tracking

## 🏗️ Architecture

This service is built using:

- **Node.js** with Express.js framework
- **PostgreSQL** database with Prisma ORM
- **JWT** for secure authentication
- **Cookie-based** session management
- **Multi-tenant** architecture for data isolation

### Architecture Overview

The service follows a multi-tenant architecture where each Shopify store operates as an isolated tenant:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Shopify Store 1│    │  Shopify Store 2│    │  Shopify Store 3│
│                 │    │                 │    │                 │
│ Orders,Products,│    │ Orders,Products,│    │ Orders,Products,│
│ Customers       │    │ Customers       │    │ Customers       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Ingestion API         │
                    │   (Server will expose     │
                    │   ingestion APIs and      │
                    │   get APIs)               │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Database Storage        │
                    │ (Server will store the    │
                    │  ingested data in this    │
                    │  database)               │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│ Tenant 1        │    │ Tenant 2        │    │ Tenant 3        │
│ Dashboard       │    │ Dashboard       │    │ Dashboard       │
│                 │    │                 │    │                 │
│ Charts and      │    │ Charts and      │    │ Charts and      │
│ Analytics       │    │ Analytics       │    │ Analytics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Model Relationships

```
                              ┌─────────┐
                              │ Tenant  │
                              │ (Store) │
                              └────┬────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
               ┌────▼────┐    ┌────▼────┐    ┌───▼────┐
               │Customer │    │ Product │    │ Order  │
               └────┬────┘    └────┬────┘    └───┬────┘
                    │              │             │
                    └──────────────┼─────────────┘
                                   │
                              ┌────▼─────┐
                              │OrderItem │
                              │(Junction)│
                              └──────────┘
```

## 🗄️ Database Schema

The service uses Prisma ORM with PostgreSQL. Here's the complete database schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id          Int       @id @default(autoincrement())
  name        String
  shopDomain  String    @unique
  apiKey      String
  apiSecret   String
  accessToken String    @unique
  email       String    @unique
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  customers   Customer[]
  products    Product[]
  orders      Order[]
}

model Customer {
  id         Int      @id @default(autoincrement())
  shopifyId  String   @unique
  tenantId   Int
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  email      String?
  firstName  String?
  lastName   String?
  totalSpent Float    @default(0)
  createdAt  DateTime @default(now())
  orders     Order[]
}

model Product {
  id        Int      @id @default(autoincrement())
  shopifyId String   @unique
  tenantId  Int
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  title     String
  price     Float
  createdAt DateTime @default(now())
  items     OrderItem[]
}

model Order {
  id         Int      @id @default(autoincrement())
  shopifyId  String   @unique
  tenantId   Int
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  customerId Int?
  customer   Customer? @relation(fields: [customerId], references: [id])
  totalPrice Float
  createdAt  DateTime @default(now())
  items      OrderItem[]
}

model OrderItem {
  id        Int      @id @default(autoincrement())
  orderId   Int
  order     Order    @relation(fields: [orderId], references: [id])
  productId Int
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
  createdAt DateTime @default(now())

  @@unique([orderId, productId]) // no duplicate product per order
}
```

### Schema Key Features:

- **Multi-tenant isolation**: All data models are linked to a `Tenant`
- **Flexible relationships**: Customers can have multiple orders, orders can have multiple products
- **Data integrity**: Unique constraints on Shopify IDs and email addresses
- **Audit trails**: `createdAt` timestamps on all models
- **Junction table**: `OrderItem` manages the many-to-many relationship between Orders and Products

## 🔑 Authentication Flow

### 1. Login Tenant

Authenticate a tenant and establish a session.

**Endpoint:** `POST /login`

**Request Body:**

```json
{
  "email": "tenant@example.com",
  "accessToken": "shpat_xxxxxx"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "tenant": {
    "id": 1,
    "email": "tenant@example.com",
    "shopDomain": "myshop.myshopify.com"
  }
}
```

**Effect:** Sets a `tenantToken` cookie in the browser. All Insight APIs require this cookie for authentication.

### 2. Logout Tenant

Clear the session and logout the tenant.

**Endpoint:** `POST /logout`

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Effect:** Clears the cookie and ends the session.

## 📊 API Documentation

All Insight routes are prefixed with `/api/insight` and require authentication (tenantToken cookie).

### 1. Business Summary

Get an overview of key business metrics for the authenticated tenant.

**Endpoint:** `GET /api/insight/summary`

**Description:** Provides a high-level summary of total customers, orders, and revenue.

**Response:**

```json
{
  "success": true,
  "insights": {
    "totalCustomers": 5,
    "totalOrders": 5,
    "totalRevenue": 6700
  }
}
```

### 2. Orders Trend

Analyze order trends over a specified date range.

**Endpoint:** `GET /api/insight/orders-trend`

**Query Parameters:**

- `startDate` (optional) - ISO date string (e.g., "2025-08-01")
- `endDate` (optional) - ISO date string (e.g., "2025-09-14")

**Example:** `GET /api/insight/orders-trend?startDate=2025-08-01&endDate=2025-09-14`

**Description:** Returns aggregated order and revenue data grouped by date within the specified range.

**Response:**

```json
{
  "success": true,
  "trends": {
    "2025-09-14": {
      "totalOrders": 5,
      "totalRevenue": 6700
    }
  }
}
```

### 3. Revenue Over Time

Track revenue performance across different time intervals.

**Endpoint:** `GET /api/insight/revenue`

**Query Parameters:**

- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string
- `interval` (optional) - Aggregation interval ("daily", "weekly", "monthly"). Default: "daily"

**Example:** `GET /api/insight/revenue?startDate=2025-08-01&endDate=2025-09-14&interval=daily`

**Description:** Provides time-series revenue data aggregated by the specified interval.

**Response:**

```json
{
  "revenueOverTime": [
    {
      "date": "2025-09-14",
      "revenue": 6700
    }
  ]
}
```

### 4. Top Customers

Identify your highest-value customers by total spend.

**Endpoint:** `GET /api/insight/top-customers`

**Description:** Returns a ranked list of customers ordered by their total spending amount.

**Response:**

```json
{
  "success": true,
  "customers": [
    {
      "id": 5,
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "totalSpent": 2950
    }
  ]
}
```

### 5. Top Products

Analyze your best-performing products by revenue generation.

**Endpoint:** `GET /api/insight/top-products`

**Description:** Returns a ranked list of products ordered by total revenue generated.

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "productId": 3,
      "title": "Laptop Bag",
      "totalRevenue": 2000,
      "totalQuantity": 1
    }
  ]
}
```

### 6. Order Overview

Get a paginated and sortable list of individual orders, with options for date filtering.

**Endpoint:** `GET /api/insight/order-overview`

**Description:** Unlike `orders-trend` which aggregates data, this endpoint returns a list of individual order details. It's ideal for displaying recent orders or browsing through order history.

**Query Parameters:**

- `startDate` (optional) - ISO date string to filter orders created on or after this date.
- `endDate` (optional) - ISO date string to filter orders created on or before this date.
- `page` (optional) - The page number for pagination. Default: `1`.
- `limit` (optional) - The number of orders to return per page. Default: `7`.
- `sortOrder` (optional) - The sorting direction for `createdAt`. Can be `"asc"` (oldest first) or `"desc"` (latest first). Default: `"desc"`.

**Example:** `GET /api/insight/order-overview?startDate=2025-09-01&limit=5&sortOrder=asc`

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "id": 101,
      "shopifyId": "fake-order-101",
      "totalPrice": 3500,
      "createdAt": "2025-09-02T09:15:00.000Z",
      "customer": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    {
      "id": 102,
      "shopifyId": "fake-order-102",
      "totalPrice": 1500,
      "createdAt": "2025-09-03T11:45:00.000Z",
      "customer": {
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "pagination": {
    "totalOrders": 10,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 5
  }
}
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Shopify store with API access

### Installation Steps

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <repo-url>
   cd backend
   npm install
   ```

2. **Set up environment variables in `.env`:**

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/shopifydb
   JWT_SECRET=your_jwt_secret
   ```

3. **Run Prisma migrations:**

   ```bash
   npx prisma migrate dev
   ```

4. **Start the server:**

   ```bash
   npm run dev
   ```

5. **Server will be running at:**
   ```
   http://localhost:5000
   ```

## 🔧 Environment Variables

| Variable       | Description                      | Required | Example                                               |
| -------------- | -------------------------------- | -------- | ----------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string     | Yes      | `postgresql://user:password@localhost:5432/shopifydb` |
| `JWT_SECRET`   | Secret key for JWT token signing | Yes      | `your_jwt_secret`                                     |
| `PORT`         | Server port number               | No       | `5000` (default)                                      |

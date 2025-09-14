# 🛒 Shopify Data Ingestion & Insights Service

A multi-tenant service that ingests data from Shopify (Products, Customers, Orders) and provides business insights through APIs.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
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

## 💡 Usage Examples

### Authentication Example

```javascript
// Login
const response = await fetch("/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "tenant@example.com",
    accessToken: "shpat_xxxxxx",
    storeDomain: "myshop.myshopify.com",
  }),
});

// Get insights (cookie automatically included)
const insights = await fetch("/api/insight/summary");
```

### Fetching Revenue Data

```javascript
const revenueData = await fetch(
  "/api/insight/revenue?startDate=2025-08-01&endDate=2025-09-14&interval=weekly"
);
```

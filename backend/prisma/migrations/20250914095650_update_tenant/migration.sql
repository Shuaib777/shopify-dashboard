/*
  Warnings:

  - A unique constraint covering the columns `[accessToken]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiKey` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiSecret` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "apiKey" TEXT NOT NULL,
ADD COLUMN     "apiSecret" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_accessToken_key" ON "public"."Tenant"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "public"."Tenant"("email");

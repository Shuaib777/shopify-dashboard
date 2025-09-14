/*
  Warnings:

  - Added the required column `email` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Made the column `accessToken` on table `Tenant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "accessToken" SET NOT NULL;

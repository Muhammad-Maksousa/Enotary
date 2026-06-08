/*
  Warnings:

  - You are about to drop the column `walletId` on the `Nonce` table. All the data in the column will be lost.
  - Added the required column `address` to the `Nonce` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Nonce" DROP CONSTRAINT "Nonce_walletId_fkey";

-- DropIndex
DROP INDEX "Nonce_walletId_idx";

-- AlterTable
ALTER TABLE "Nonce" DROP COLUMN "walletId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiresAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Nonce_nonce_idx" ON "Nonce"("nonce");

-- CreateIndex
CREATE INDEX "Nonce_address_idx" ON "Nonce"("address");

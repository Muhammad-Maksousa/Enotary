/*
  Warnings:

  - A unique constraint covering the columns `[nonce]` on the table `Nonce` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('DRAFT', 'PENDING_NOTARY', 'WAITING_FOR_SIGNERS', 'WAITING_FOR_NOTARY_SIGNATURE', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- DropIndex
DROP INDEX "Nonce_nonce_idx";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "creatorId" TEXT NOT NULL,
    "notaryId" TEXT NOT NULL,
    "notaryConfirmedAt" TIMESTAMP(3),
    "notarySignature" TEXT,
    "notarySignedAt" TIMESTAMP(3),
    "chainId" INTEGER,
    "contractAddress" TEXT,
    "txHash" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionSigner" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "signature" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionSigner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_creatorId_idx" ON "Transaction"("creatorId");

-- CreateIndex
CREATE INDEX "Transaction_notaryId_idx" ON "Transaction"("notaryId");

-- CreateIndex
CREATE INDEX "Transaction_templateId_idx" ON "Transaction"("templateId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "TransactionSigner_transactionId_idx" ON "TransactionSigner"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionSigner_walletId_idx" ON "TransactionSigner"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionSigner_transactionId_walletId_key" ON "TransactionSigner"("transactionId", "walletId");

-- CreateIndex
CREATE UNIQUE INDEX "Nonce_nonce_key" ON "Nonce"("nonce");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionSigner" ADD CONSTRAINT "TransactionSigner_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionSigner" ADD CONSTRAINT "TransactionSigner_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

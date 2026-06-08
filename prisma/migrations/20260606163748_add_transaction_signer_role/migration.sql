/*
  Warnings:

  - Added the required column `role` to the `TransactionSigner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionSigner" ADD COLUMN     "role" TEXT NOT NULL;

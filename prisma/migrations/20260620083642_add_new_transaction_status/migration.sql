-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'CLAIMED_BY_NOTARY';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullName" SET DEFAULT 'user';

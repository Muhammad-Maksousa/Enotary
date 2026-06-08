-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'NOTARY', 'ADMIN');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CITIZEN';

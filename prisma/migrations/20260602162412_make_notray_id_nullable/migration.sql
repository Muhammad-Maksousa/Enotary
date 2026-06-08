-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_notaryId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "notaryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

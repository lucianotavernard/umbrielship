-- CreateEnum
CREATE TYPE "vessel_status" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- AlterTable
ALTER TABLE "vessels" ADD COLUMN     "status" "vessel_status" NOT NULL DEFAULT 'ACTIVE';

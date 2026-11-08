-- CreateEnum
CREATE TYPE "vessel_type" AS ENUM ('CARGO', 'TANKER', 'PASSENGER', 'FISHING', 'BULK_CARRIER', 'CONTAINER', 'OTHER');

-- CreateTable
CREATE TABLE "vessels" (
    "id" TEXT NOT NULL,
    "imoNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "vessel_type" NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vessels_imoNumber_key" ON "vessels"("imoNumber");

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

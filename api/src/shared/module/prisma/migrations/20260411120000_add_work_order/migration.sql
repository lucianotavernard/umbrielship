-- CreateEnum
CREATE TYPE "work_order_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "work_order_service_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "work_order_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_services" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "work_order_service_status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "work_order_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_service_images" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "work_order_service_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_services" ADD CONSTRAINT "work_order_services_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_service_images" ADD CONSTRAINT "work_order_service_images_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "work_order_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tenancy: Organization, Membership, Invitation, organizationId on every tenant table.
-- Existing rows are backfilled into the internal Organization "Umbrielship" (only when data exists).

CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "role" AS ENUM ('administrator', 'operator');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted');

-- CreateEnum
CREATE TYPE "invitation_delivery_status" AS ENUM ('queued', 'delivered', 'failed');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" CITEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "role" NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "role" NOT NULL,
    "secret" TEXT NOT NULL,
    "status" "invitation_status" NOT NULL DEFAULT 'pending',
    "deliveryStatus" "invitation_delivery_status" NOT NULL DEFAULT 'queued',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastDeliveryFailureAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- Backfill: internal Organization, memberships, active organization
INSERT INTO "organizations" ("id", "name", "email", "isInternal")
SELECT 'f3c1a9c0-0000-4000-8000-000000000001', 'Umbrielship', 'internal@umbrielship.local', true
WHERE EXISTS (SELECT 1 FROM "users") OR EXISTS (SELECT 1 FROM "customers");

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN "activeOrganizationId" TEXT,
ALTER COLUMN "email" SET DATA TYPE CITEXT;

INSERT INTO "memberships" ("id", "userId", "organizationId", "role")
SELECT gen_random_uuid()::text, u."id", o."id",
  CASE WHEN u."role" IN ('MANAGER', 'DEVELOPER') THEN 'administrator'::"role" ELSE 'operator'::"role" END
FROM "users" u CROSS JOIN "organizations" o WHERE o."isInternal";

UPDATE "users" SET "activeOrganizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);

ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- AlterTable: tenant tables, backfill then NOT NULL
ALTER TABLE "customers" ADD COLUMN "organizationId" TEXT;
UPDATE "customers" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "customers" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "customer_addresses" ADD COLUMN "organizationId" TEXT;
UPDATE "customer_addresses" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "customer_addresses" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "vessels" ADD COLUMN "organizationId" TEXT;
UPDATE "vessels" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "vessels" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "work_orders" ADD COLUMN "organizationId" TEXT;
UPDATE "work_orders" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "work_orders" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "work_order_services" ADD COLUMN "organizationId" TEXT;
UPDATE "work_order_services" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "work_order_services" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "work_order_service_images" ADD COLUMN "organizationId" TEXT;
UPDATE "work_order_service_images" SET "organizationId" = (SELECT "id" FROM "organizations" WHERE "isInternal" LIMIT 1);
ALTER TABLE "work_order_service_images" ALTER COLUMN "organizationId" SET NOT NULL;

-- Case-insensitive text and the dropped cross-context foreign key
ALTER TABLE "customers" ALTER COLUMN "email" SET DATA TYPE CITEXT;
ALTER TABLE "vessels" ALTER COLUMN "imoNumber" SET DATA TYPE CITEXT;
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_vesselId_fkey";

DROP INDEX "customers_email_key";
DROP INDEX "vessels_imoNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "memberships_organizationId_idx" ON "memberships"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_organizationId_key" ON "memberships"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_secret_key" ON "invitations"("secret");

-- CreateIndex
CREATE INDEX "invitations_organizationId_idx" ON "invitations"("organizationId");

-- CreateIndex
CREATE INDEX "invitations_deliveryStatus_idx" ON "invitations"("deliveryStatus");

-- CreateIndex
CREATE UNIQUE INDEX "customer_addresses_customerId_key" ON "customer_addresses"("customerId");

-- CreateIndex
CREATE INDEX "customer_addresses_organizationId_idx" ON "customer_addresses"("organizationId");

-- CreateIndex
CREATE INDEX "customers_organizationId_idx" ON "customers"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_organizationId_email_key" ON "customers"("organizationId", "email");

-- CreateIndex
CREATE INDEX "vessels_organizationId_idx" ON "vessels"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "vessels_organizationId_imoNumber_key" ON "vessels"("organizationId", "imoNumber");

-- CreateIndex
CREATE INDEX "work_order_service_images_organizationId_idx" ON "work_order_service_images"("organizationId");

-- CreateIndex
CREATE INDEX "work_order_services_organizationId_idx" ON "work_order_services"("organizationId");

-- CreateIndex
CREATE INDEX "work_orders_organizationId_idx" ON "work_orders"("organizationId");

-- CreateIndex
CREATE INDEX "work_orders_vesselId_idx" ON "work_orders"("vesselId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeOrganizationId_fkey" FOREIGN KEY ("activeOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

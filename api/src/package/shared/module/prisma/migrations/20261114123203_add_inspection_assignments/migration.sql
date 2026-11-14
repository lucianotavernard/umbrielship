-- CreateTable
CREATE TABLE "inspection_assignments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "workOrderServiceId" TEXT,
    "templateName" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_assignment_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "inspection_assignment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspection_assignments_organizationId_idx" ON "inspection_assignments"("organizationId");

-- CreateIndex
CREATE INDEX "inspection_assignments_workOrderId_idx" ON "inspection_assignments"("workOrderId");

-- CreateIndex
CREATE INDEX "inspection_assignment_items_organizationId_idx" ON "inspection_assignment_items"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_assignment_items_assignmentId_position_key" ON "inspection_assignment_items"("assignmentId", "position");

-- AddForeignKey
ALTER TABLE "inspection_assignments" ADD CONSTRAINT "inspection_assignments_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_assignments" ADD CONSTRAINT "inspection_assignments_workOrderServiceId_fkey" FOREIGN KEY ("workOrderServiceId") REFERENCES "work_order_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_assignment_items" ADD CONSTRAINT "inspection_assignment_items_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "inspection_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

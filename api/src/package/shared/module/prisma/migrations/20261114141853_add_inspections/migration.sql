-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('TEXT', 'YES_NO', 'CONFORMITY', 'SCORE');

-- CreateEnum
CREATE TYPE "inspection_result" AS ENUM ('APPROVED', 'REPROVED');

-- AlterTable
ALTER TABLE "inspection_assignment_items" ADD COLUMN     "type" "question_type" NOT NULL DEFAULT 'CONFORMITY';

-- AlterTable
ALTER TABLE "inspection_template_items" ADD COLUMN     "type" "question_type" NOT NULL DEFAULT 'CONFORMITY';

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "result" "inspection_result" NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discardedAt" TIMESTAMP(3),
    "discardedBy" TEXT,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_answers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "notApplicable" BOOLEAN NOT NULL DEFAULT false,
    "textValue" TEXT,
    "booleanValue" BOOLEAN,
    "scoreValue" INTEGER,
    "note" TEXT,

    CONSTRAINT "inspection_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspections_organizationId_idx" ON "inspections"("organizationId");

-- CreateIndex
CREATE INDEX "inspections_assignmentId_idx" ON "inspections"("assignmentId");

-- CreateIndex
CREATE INDEX "inspection_answers_organizationId_idx" ON "inspection_answers"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_answers_inspectionId_itemId_key" ON "inspection_answers"("inspectionId", "itemId");

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "inspection_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_answers" ADD CONSTRAINT "inspection_answers_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_answers" ADD CONSTRAINT "inspection_answers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inspection_assignment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

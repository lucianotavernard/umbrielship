-- CreateTable
CREATE TABLE "inspection_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_template_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "inspection_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspection_templates_organizationId_idx" ON "inspection_templates"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_templates_organizationId_name_key" ON "inspection_templates"("organizationId", "name");

-- CreateIndex
CREATE INDEX "inspection_template_items_organizationId_idx" ON "inspection_template_items"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_template_items_templateId_position_key" ON "inspection_template_items"("templateId", "position");

-- AddForeignKey
ALTER TABLE "inspection_template_items" ADD CONSTRAINT "inspection_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "inspection_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

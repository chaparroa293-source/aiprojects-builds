-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client_id" TEXT,
    "agreed_total_price" BIGINT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_revisions" (
    "id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "old_value" BIGINT NOT NULL,
    "new_value" BIGINT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_firm_id_idx" ON "projects"("firm_id");

-- CreateIndex
CREATE INDEX "projects_client_id_idx" ON "projects"("client_id");

-- CreateIndex
CREATE INDEX "price_revisions_firm_id_idx" ON "price_revisions"("firm_id");

-- CreateIndex
CREATE INDEX "price_revisions_project_id_idx" ON "price_revisions"("project_id");

-- CreateIndex
CREATE INDEX "segments_firm_id_idx" ON "segments"("firm_id");

-- CreateIndex
CREATE INDEX "segments_project_id_idx" ON "segments"("project_id");

-- CreateIndex
CREATE INDEX "segments_parent_id_idx" ON "segments"("parent_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_revisions" ADD CONSTRAINT "price_revisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

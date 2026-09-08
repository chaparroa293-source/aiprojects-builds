-- CreateTable
CREATE TABLE "project_suppliers" (
    "id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_employees" (
    "id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_suppliers_firm_id_idx" ON "project_suppliers"("firm_id");

-- CreateIndex
CREATE INDEX "project_suppliers_supplier_id_idx" ON "project_suppliers"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_suppliers_project_id_supplier_id_key" ON "project_suppliers"("project_id", "supplier_id");

-- CreateIndex
CREATE INDEX "project_employees_firm_id_idx" ON "project_employees"("firm_id");

-- CreateIndex
CREATE INDEX "project_employees_employee_id_idx" ON "project_employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_employees_project_id_employee_id_key" ON "project_employees"("project_id", "employee_id");

-- AddForeignKey
ALTER TABLE "project_suppliers" ADD CONSTRAINT "project_suppliers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_suppliers" ADD CONSTRAINT "project_suppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_employees" ADD CONSTRAINT "project_employees_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_employees" ADD CONSTRAINT "project_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

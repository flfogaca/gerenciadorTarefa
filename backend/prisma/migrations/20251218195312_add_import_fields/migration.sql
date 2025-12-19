-- CreateEnum
CREATE TYPE "ProjectSize" AS ENUM ('small', 'medium', 'large');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "documents" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "size" "ProjectSize";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "executionDays" INTEGER;

-- AlterTable
ALTER TABLE "tenant_settings" ADD COLUMN     "customStatuses" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "documents" JSONB NOT NULL DEFAULT '[]';

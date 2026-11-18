-- ============================================================
-- Migration: Modify Projects Table Schema
-- Adds: features, category (enum), screenshots, isPublished
-- Modifies: status field to use new ProjectStatus enum
-- ============================================================

-- Step 1: Create new Enum types
DO $$ BEGIN
  CREATE TYPE "ProjectCategory" AS ENUM ('MOBILE', 'WEB', 'BACKEND', 'FULLSTACK', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to Project table (nullable/with defaults so existing rows don't break)
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "features"    TEXT[]           NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "screenshots" TEXT[]           NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN          NOT NULL DEFAULT true;

-- Step 3: Add category column as TEXT first, then cast to enum
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "category_new" "ProjectCategory" NOT NULL DEFAULT 'MOBILE';

-- Step 4: Migrate old text "status" to new enum "ProjectStatus"
-- Map: 'published' -> 'COMPLETED', anything else -> 'COMPLETED' (safe default)
ALTER TABLE "Project"
  ADD COLUMN IF NOT EXISTS "status_new" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED';

-- Migrate existing data: derive isPublished from old status
UPDATE "Project"
  SET
    "isPublished"  = CASE WHEN "status" = 'published' THEN true ELSE false END,
    "status_new"   = CASE
                       WHEN "status" = 'published'   THEN 'COMPLETED'::"ProjectStatus"
                       WHEN "status" = 'in_progress' THEN 'IN_PROGRESS'::"ProjectStatus"
                       WHEN "status" = 'archived'    THEN 'ARCHIVED'::"ProjectStatus"
                       ELSE 'COMPLETED'::"ProjectStatus"
                     END;

-- Step 5: Drop old text status column and rename new enum column
ALTER TABLE "Project" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Project" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Project" RENAME COLUMN "category_new" TO "category";

-- Step 6: Create composite index as defined in schema
CREATE INDEX IF NOT EXISTS "Project_category_isPublished_order_idx"
  ON "Project"("category", "isPublished", "order");

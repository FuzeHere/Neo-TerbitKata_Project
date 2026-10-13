-- Migration script for adding is_editor_choice and weekly_views
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "is_editor_choice" BOOLEAN DEFAULT false;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "weekly_views" INTEGER DEFAULT 0;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "weekly_views_reset_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

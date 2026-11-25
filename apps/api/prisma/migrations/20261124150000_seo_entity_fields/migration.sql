-- ============================================================
-- SEO Entity Fields Migration (004-seo-compliance-launch T018)
-- ============================================================

-- AlterTable
ALTER TABLE `services` ADD COLUMN `ogImage` JSON NULL,
    ADD COLUMN `noindex` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `news` ADD COLUMN `ogImage` JSON NULL,
    ADD COLUMN `noindex` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `ogImage` JSON NULL,
    ADD COLUMN `noindex` BOOLEAN NOT NULL DEFAULT false;

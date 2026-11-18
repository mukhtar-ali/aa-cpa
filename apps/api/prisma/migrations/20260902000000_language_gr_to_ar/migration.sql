-- The `Language` enum's second locale changes from Greek (`gr`) to Arabic (`ar`).
-- This project never shipped Greek content, so any existing `gr` rows are stale
-- placeholder data, not real translations to preserve. Repoint them to `en` first
-- so the column can be narrowed to the new enum values without a truncation error.
UPDATE `project_translations` SET `language` = 'en' WHERE `language` = 'gr';
UPDATE `unit_translations` SET `language` = 'en' WHERE `language` = 'gr';

-- AlterTable
ALTER TABLE `project_translations` MODIFY COLUMN `language` ENUM('en', 'ar') NOT NULL;

-- AlterTable
ALTER TABLE `unit_translations` MODIFY COLUMN `language` ENUM('en', 'ar') NOT NULL;

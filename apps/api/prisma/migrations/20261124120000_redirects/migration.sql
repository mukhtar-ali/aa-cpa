-- ============================================================
-- Redirects Migration (004-seo-compliance-launch T016)
-- ============================================================

-- CreateTable
CREATE TABLE `redirects` (
    `id` VARCHAR(191) NOT NULL,
    `fromPath` VARCHAR(500) NOT NULL,
    `toPath` VARCHAR(500) NOT NULL,
    `type` ENUM('permanent', 'temporary') NOT NULL DEFAULT 'permanent',
    `source` ENUM('manual', 'legacy_import', 'slug_change') NOT NULL DEFAULT 'manual',
    `hits` INTEGER NOT NULL DEFAULT 0,
    `lastHitAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `redirects_fromPath_key`(`fromPath`),
    INDEX `redirects_source_idx`(`source`),
    INDEX `redirects_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `redirects` ADD CONSTRAINT `redirects_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate existing slug_redirects into redirects if table exists
INSERT INTO `redirects` (`id`, `fromPath`, `toPath`, `type`, `source`, `hits`, `createdAt`, `updatedAt`)
SELECT
    id,
    CASE entityType
        WHEN 'service' THEN CONCAT('/services/', fromSlug)
        WHEN 'sector' THEN CONCAT('/sectors/', fromSlug)
        WHEN 'article' THEN CONCAT('/articles/', fromSlug)
        WHEN 'job' THEN CONCAT('/careers/', fromSlug)
        ELSE CONCAT('/', fromSlug)
    END AS fromPath,
    CASE entityType
        WHEN 'service' THEN CONCAT('/services/', toSlug)
        WHEN 'sector' THEN CONCAT('/sectors/', toSlug)
        WHEN 'article' THEN CONCAT('/articles/', toSlug)
        WHEN 'job' THEN CONCAT('/careers/', toSlug)
        ELSE CONCAT('/', toSlug)
    END AS toPath,
    'permanent' AS `type`,
    'slug_change' AS `source`,
    0 AS `hits`,
    createdAt,
    createdAt AS updatedAt
FROM `slug_redirects`
ON DUPLICATE KEY UPDATE `toPath` = VALUES(`toPath`);

-- A path that a LATER rename pointed to is live again (the entity was renamed back), so it must not redirect anywhere: the runtime
-- (RedirectsService.recordSlugChange) deletes such rows too. Without this, a rename loop would make the live page redirect forever.
DELETE r FROM `redirects` r
JOIN `redirects` n ON n.`toPath` = r.`fromPath` AND n.`createdAt` > r.`createdAt`
WHERE r.`source` = 'slug_change';

-- Collapse chains created by consecutive renames (A -> B and B -> C become A -> C). Each pass moves every row one hop closer to the end of
-- its chain and skips a hop that would point a row back at itself (a rename loop). Five passes cover chains of at least six renames;
-- anything longer is collapsed the next time an editor saves the redirect (the admin resolves chains on save).
UPDATE `redirects` r
JOIN `redirects` n ON n.`fromPath` = r.`toPath` AND n.`id` <> r.`id`
SET r.`toPath` = n.`toPath`
WHERE r.`source` = 'slug_change' AND n.`toPath` <> r.`fromPath`;

UPDATE `redirects` r
JOIN `redirects` n ON n.`fromPath` = r.`toPath` AND n.`id` <> r.`id`
SET r.`toPath` = n.`toPath`
WHERE r.`source` = 'slug_change' AND n.`toPath` <> r.`fromPath`;

UPDATE `redirects` r
JOIN `redirects` n ON n.`fromPath` = r.`toPath` AND n.`id` <> r.`id`
SET r.`toPath` = n.`toPath`
WHERE r.`source` = 'slug_change' AND n.`toPath` <> r.`fromPath`;

UPDATE `redirects` r
JOIN `redirects` n ON n.`fromPath` = r.`toPath` AND n.`id` <> r.`id`
SET r.`toPath` = n.`toPath`
WHERE r.`source` = 'slug_change' AND n.`toPath` <> r.`fromPath`;

UPDATE `redirects` r
JOIN `redirects` n ON n.`fromPath` = r.`toPath` AND n.`id` <> r.`id`
SET r.`toPath` = n.`toPath`
WHERE r.`source` = 'slug_change' AND n.`toPath` <> r.`fromPath`;

-- A rename back to the original slug leaves a redirect to itself; it must not exist.
DELETE FROM `redirects` WHERE `fromPath` = `toPath`;

-- DropTable
DROP TABLE IF EXISTS `slug_redirects`;

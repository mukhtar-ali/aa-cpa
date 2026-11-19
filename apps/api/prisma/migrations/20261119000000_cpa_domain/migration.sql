-- ============================================================
-- CPA Domain Migration
-- ============================================================

-- Drop legacy real-estate tables and foreign keys
DROP TABLE IF EXISTS `project_translations`;
DROP TABLE IF EXISTS `unit_translations`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `inquiries`;

-- Strip removed permission keys from users table
-- Removes admin_portal.projects.*, admin_portal.media.*, admin_portal.group_locations
UPDATE `users`
SET `permissions` = JSON_REMOVE(
  `permissions`,
  JSON_UNQUOTE(
    JSON_SEARCH(`permissions`, 'one', 'admin_portal.projects.%')
  )
)
WHERE JSON_SEARCH(`permissions`, 'one', 'admin_portal.projects.%') IS NOT NULL;

-- ============================================================
-- Services & Sectors
-- ============================================================

CREATE TABLE `services` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `image` JSON NULL,
    `heroImage` JSON NULL,
    `icon` VARCHAR(100) NULL,
    `highlight` JSON NULL,
    `methodology` JSON NOT NULL DEFAULT ('[]'),
    `deliverables` JSON NOT NULL DEFAULT ('[]'),
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `services_slug_key`(`slug`),
    INDEX `services_isPublished_isDeleted_idx`(`isPublished`, `isDeleted`),
    INDEX `services_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `service_translations` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `language` ENUM('en', 'ar') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `summary` TEXT NOT NULL,
    `heroSubtitle` VARCHAR(500) NULL,
    `statement` TEXT NULL,
    `audience` TEXT NULL,
    `whyUs` TEXT NULL,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` TEXT NULL,
    `keywords` TEXT NULL,

    UNIQUE INDEX `service_translations_serviceId_language_key`(`serviceId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sectors` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `bandImage` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `sectors_slug_key`(`slug`),
    INDEX `sectors_isPublished_isDeleted_idx`(`isPublished`, `isDeleted`),
    INDEX `sectors_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sector_translations` (
    `id` VARCHAR(191) NOT NULL,
    `sectorId` VARCHAR(191) NOT NULL,
    `language` ENUM('en', 'ar') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `summary` TEXT NOT NULL,
    `bandTitle` VARCHAR(255) NULL,
    `bandBody` TEXT NULL,
    `bandCtaLabel` VARCHAR(100) NULL,
    `metaTitle` VARCHAR(255) NULL,
    `metaDescription` TEXT NULL,
    `keywords` TEXT NULL,

    UNIQUE INDEX `sector_translations_sectorId_language_key`(`sectorId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `service_sectors` (
    `serviceId` VARCHAR(191) NOT NULL,
    `sectorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`serviceId`, `sectorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Articles, Categories & Authors
-- ============================================================

CREATE TABLE `article_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `name` JSON NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isCaseStory` BOOLEAN NOT NULL DEFAULT false,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `article_categories_slug_key`(`slug`),
    INDEX `article_categories_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `authors` (
    `id` VARCHAR(191) NOT NULL,
    `name` JSON NOT NULL,
    `role` JSON NOT NULL,
    `bio` JSON NOT NULL,
    `avatar` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `authors_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default general category for articles
INSERT INTO `article_categories` (`id`, `slug`, `name`, `order`, `isCaseStory`, `isDeleted`, `createdAt`, `updatedAt`)
VALUES ('default-insights-category', 'insights', JSON_OBJECT('ar', 'رؤى محاسبية', 'en', 'Insights & Updates'), 0, false, false, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- Reshape news table
ALTER TABLE `news`
    DROP COLUMN `tag`,
    ADD COLUMN `categoryId` VARCHAR(191) NOT NULL DEFAULT 'default-insights-category',
    ADD COLUMN `authorId` VARCHAR(191) NULL,
    ADD COLUMN `readingMinutes` INTEGER NULL,
    ADD COLUMN `tags` JSON NOT NULL DEFAULT ('[]');

ALTER TABLE `news` MODIFY COLUMN `thumbnail` JSON NULL;

ALTER TABLE `news_translations`
    ADD COLUMN `tocEnabled` BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE `article_sectors` (
    `articleId` VARCHAR(191) NOT NULL,
    `sectorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`articleId`, `sectorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `article_services` (
    `articleId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`articleId`, `serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Careers, Departments & Offices
-- ============================================================

CREATE TABLE `job_departments` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `name` JSON NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `job_departments_slug_key`(`slug`),
    INDEX `job_departments_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `offices` (
    `id` VARCHAR(191) NOT NULL,
    `city` JSON NOT NULL,
    `address` JSON NOT NULL,
    `mapUrl` VARCHAR(500) NULL,
    `mapX` INTEGER NULL,
    `mapY` INTEGER NULL,
    `image` JSON NULL,
    `isHeadquarters` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `offices_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `job_departments` (`id`, `slug`, `name`, `order`, `isDeleted`, `createdAt`, `updatedAt`)
VALUES ('default-audit-dept', 'audit-assurance', JSON_OBJECT('ar', 'التدقيق والتأكيد', 'en', 'Audit & Assurance'), 0, false, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

ALTER TABLE `jobs`
    ADD COLUMN `departmentId` VARCHAR(191) NOT NULL DEFAULT 'default-audit-dept',
    ADD COLUMN `officeId` VARCHAR(191) NULL,
    MODIFY COLUMN `employmentType` ENUM('full_time', 'part_time', 'contract', 'internship', 'cooperative_training') NOT NULL DEFAULT 'full_time',
    ADD COLUMN `experienceMin` INTEGER NULL,
    ADD COLUMN `experienceMax` INTEGER NULL,
    ADD COLUMN `closesAt` DATETIME(3) NULL,
    ADD COLUMN `responsibilities` JSON NOT NULL DEFAULT ('[]'),
    ADD COLUMN `requirements` JSON NOT NULL DEFAULT ('[]'),
    ADD COLUMN `benefits` JSON NOT NULL DEFAULT ('[]'),
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `job_translations`
    ADD COLUMN `metaTitle` VARCHAR(255) NULL,
    ADD COLUMN `metaDescription` TEXT NULL,
    ADD COLUMN `keywords` TEXT NULL;

-- Reshape job_applications table
ALTER TABLE `job_applications`
    ADD COLUMN `fullName` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `mobile` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `linkedinUrl` VARCHAR(500) NULL,
    ADD COLUMN `motivation` TEXT NULL,
    ADD COLUMN `resumeKey` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `resumeName` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `resumeSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `language` ENUM('en', 'ar') NOT NULL DEFAULT 'ar',
    ADD COLUMN `assignedToId` VARCHAR(191) NULL;

UPDATE `job_applications`
SET `fullName` = TRIM(CONCAT(COALESCE(`firstName`, ''), ' ', COALESCE(`lastName`, ''))),
    `mobile` = COALESCE(`phone`, ''),
    `motivation` = `coverLetter`,
    `resumeKey` = COALESCE(`resumeUrl`, ''),
    `resumeName` = 'resume.pdf';

ALTER TABLE `job_applications`
    DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    DROP COLUMN `phone`,
    DROP COLUMN `coverLetter`,
    DROP COLUMN `resumeUrl`;

ALTER TABLE `job_applications`
    MODIFY COLUMN `status` ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected') NOT NULL DEFAULT 'pending',
    MODIFY COLUMN `notes` JSON NOT NULL DEFAULT ('[]');

-- ============================================================
-- Reference Entities
-- ============================================================

CREATE TABLE `testimonials` (
    `id` VARCHAR(191) NOT NULL,
    `quote` JSON NOT NULL,
    `rating` INTEGER NULL,
    `name` JSON NOT NULL,
    `role` JSON NOT NULL,
    `company` JSON NULL,
    `avatar` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `placement` JSON NOT NULL DEFAULT ('["home"]'),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `testimonials_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `client_logos` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `logo` JSON NOT NULL,
    `url` VARCHAR(500) NULL,
    `row` INTEGER NOT NULL DEFAULT 1,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `client_logos_row_order_idx`(`row`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `credentials` (
    `id` VARCHAR(191) NOT NULL,
    `name` JSON NOT NULL,
    `logo` JSON NOT NULL,
    `url` VARCHAR(500) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `credentials_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `faq_items` (
    `id` VARCHAR(191) NOT NULL,
    `question` JSON NOT NULL,
    `answer` JSON NOT NULL,
    `scope` ENUM('global', 'contact', 'service') NOT NULL DEFAULT 'global',
    `serviceId` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `faq_items_scope_order_idx`(`scope`, `order`),
    INDEX `faq_items_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `slug_redirects` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` ENUM('service', 'sector', 'article', 'job') NOT NULL,
    `fromSlug` VARCHAR(120) NOT NULL,
    `toSlug` VARCHAR(120) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `slug_redirects_entityType_fromSlug_key`(`entityType`, `fromSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Contacts & Leads
-- ============================================================

ALTER TABLE `contacts`
    ADD COLUMN `company` VARCHAR(150) NULL,
    ADD COLUMN `mobile` VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN `serviceId` VARCHAR(191) NULL,
    ADD COLUMN `source` ENUM('contact', 'estimator', 'service_page') NOT NULL DEFAULT 'contact',
    ADD COLUMN `estimatorAnswers` JSON NULL,
    ADD COLUMN `estimatedRange` JSON NULL,
    ADD COLUMN `language` ENUM('en', 'ar') NOT NULL DEFAULT 'ar',
    ADD COLUMN `landingPath` VARCHAR(500) NULL,
    ADD COLUMN `assignedToId` VARCHAR(191) NULL,
    ADD COLUMN `notes` JSON NOT NULL DEFAULT ('[]');

ALTER TABLE `contacts`
    DROP COLUMN `subject`,
    DROP COLUMN `department`,
    MODIFY COLUMN `message` TEXT NULL,
    MODIFY COLUMN `status` ENUM('new', 'contacted', 'qualified', 'closed', 'spam') NOT NULL DEFAULT 'new';

-- ============================================================
-- Privacy, Compliance & Outbox
-- ============================================================

CREATE TABLE `consent_records` (
    `id` VARCHAR(191) NOT NULL,
    `subjectType` ENUM('contact', 'application', 'quote') NOT NULL,
    `subjectId` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `purpose` VARCHAR(100) NOT NULL,
    `policyVersion` VARCHAR(50) NOT NULL,
    `language` ENUM('en', 'ar') NOT NULL DEFAULT 'ar',
    `ipHash` VARCHAR(64) NOT NULL,
    `userAgent` VARCHAR(255) NOT NULL,
    `consentedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consent_records_email_idx`(`email`),
    INDEX `consent_records_subjectType_subjectId_idx`(`subjectType`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_outbox` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('email', 'revalidate') NOT NULL DEFAULT 'email',
    `template` VARCHAR(100) NULL,
    `to` VARCHAR(255) NULL,
    `language` ENUM('en', 'ar') NOT NULL DEFAULT 'ar',
    `payload` JSON NOT NULL,
    `status` ENUM('pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `nextAttemptAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastError` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `email_outbox_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `erasure_logs` (
    `id` VARCHAR(191) NOT NULL,
    `emailHash` VARCHAR(64) NOT NULL,
    `requestedById` VARCHAR(36) NOT NULL,
    `itemsErased` JSON NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `erasure_logs_emailHash_idx`(`emailHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign Keys
ALTER TABLE `service_translations` ADD CONSTRAINT `service_translations_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sector_translations` ADD CONSTRAINT `sector_translations_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `sectors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_sectors` ADD CONSTRAINT `service_sectors_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `service_sectors` ADD CONSTRAINT `service_sectors_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `sectors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `news` ADD CONSTRAINT `news_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `article_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `news` ADD CONSTRAINT `news_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `article_sectors` ADD CONSTRAINT `article_sectors_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `article_sectors` ADD CONSTRAINT `article_sectors_sectorId_fkey` FOREIGN KEY (`sectorId`) REFERENCES `sectors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `article_services` ADD CONSTRAINT `article_services_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `article_services` ADD CONSTRAINT `article_services_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `job_departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `faq_items` ADD CONSTRAINT `faq_items_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

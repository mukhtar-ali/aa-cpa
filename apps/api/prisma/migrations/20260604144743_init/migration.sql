-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `permissions` JSON NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_otps` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(6) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('forget_password') NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(255) NULL,
    `heroMedia` JSON NULL,
    `thumbnail` VARCHAR(500) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `rank` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(255) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    INDEX `projects_isPublished_isDeleted_idx`(`isPublished`, `isDeleted`),
    INDEX `projects_rank_idx`(`rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_translations` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `language` ENUM('en', 'gr') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(500) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `amenities` JSON NULL,
    `tags` JSON NULL,

    UNIQUE INDEX `project_translations_projectId_language_key`(`projectId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(255) NULL,
    `thumbnail` VARCHAR(500) NULL,
    `overViewImage` VARCHAR(500) NULL,
    `price` VARCHAR(100) NULL,
    `pricePerMeter` VARCHAR(100) NULL,
    `gallery` JSON NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `bedrooms` INTEGER NOT NULL DEFAULT 0,
    `bathrooms` INTEGER NOT NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `units_slug_key`(`slug`),
    INDEX `units_projectId_isPublished_idx`(`projectId`, `isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_translations` (
    `id` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `language` ENUM('en', 'gr') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `area` VARCHAR(100) NOT NULL,
    `view` VARCHAR(100) NOT NULL,
    `delivery` VARCHAR(100) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `floor` VARCHAR(100) NOT NULL,
    `building` VARCHAR(100) NOT NULL,
    `overViewTitle` VARCHAR(255) NOT NULL,
    `overViewDescription` TEXT NOT NULL,
    `overViewFeatures` JSON NULL,

    UNIQUE INDEX `unit_translations_unitId_language_key`(`unitId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `unitId` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `preferredDate` VARCHAR(50) NULL,
    `projectName` VARCHAR(255) NULL,
    `unitName` VARCHAR(255) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `inquiries_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `data` JSON NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sections_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seo` (
    `id` VARCHAR(191) NOT NULL,
    `pageKey` VARCHAR(255) NOT NULL,
    `content` JSON NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seo_pageKey_key`(`pageKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_otps` ADD CONSTRAINT `user_otps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_translations` ADD CONSTRAINT `project_translations_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `units` ADD CONSTRAINT `units_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_translations` ADD CONSTRAINT `unit_translations_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

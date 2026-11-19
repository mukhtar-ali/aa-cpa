-- This migration exists to bring migration history in sync with a database
-- where these tables were already created via `prisma db push` (untracked by
-- migration history). Apply with `prisma migrate resolve --applied` on any
-- database that already has these tables — do NOT run its SQL against one.
-- On a fresh database, run it normally.

-- CreateTable
CREATE TABLE `monitoring_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `value` DOUBLE NOT NULL,
    `rating` VARCHAR(30) NULL,
    `page` VARCHAR(500) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_metrics_type_timestamp_idx`(`type`, `timestamp`),
    INDEX `monitoring_metrics_sessionId_idx`(`sessionId`),
    INDEX `monitoring_metrics_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_errors` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `stack` TEXT NULL,
    `context` TEXT NOT NULL,
    `page` VARCHAR(500) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_errors_type_timestamp_idx`(`type`, `timestamp`),
    INDEX `monitoring_errors_sessionId_idx`(`sessionId`),
    INDEX `monitoring_errors_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_events` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(36) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `properties` TEXT NULL,
    `page` VARCHAR(500) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_events_name_timestamp_idx`(`name`, `timestamp`),
    INDEX `monitoring_events_sessionId_idx`(`sessionId`),
    INDEX `monitoring_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_metric_rollups` (
    `id` VARCHAR(191) NOT NULL,
    `period` VARCHAR(10) NOT NULL,
    `periodKey` VARCHAR(30) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `count` INTEGER NOT NULL,
    `p50` DOUBLE NOT NULL,
    `p75` DOUBLE NOT NULL,
    `p90` DOUBLE NOT NULL,
    `min` DOUBLE NOT NULL,
    `max` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_metric_rollups_period_type_idx`(`period`, `type`),
    UNIQUE INDEX `monitoring_metric_rollups_period_periodKey_type_key`(`period`, `periodKey`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_event_rollups` (
    `id` VARCHAR(191) NOT NULL,
    `period` VARCHAR(10) NOT NULL,
    `periodKey` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `count` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_event_rollups_period_name_idx`(`period`, `name`),
    UNIQUE INDEX `monitoring_event_rollups_period_periodKey_name_key`(`period`, `periodKey`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitoring_error_rollups` (
    `id` VARCHAR(191) NOT NULL,
    `period` VARCHAR(10) NOT NULL,
    `periodKey` VARCHAR(30) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `count` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_error_rollups_period_type_idx`(`period`, `type`),
    UNIQUE INDEX `monitoring_error_rollups_period_periodKey_type_key`(`period`, `periodKey`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

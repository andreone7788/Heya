-- CreateTable
CREATE TABLE `User` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `surname` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE') NOT NULL DEFAULT 'PENDING',
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `RoleSelected` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `avatarUrl` VARCHAR(191) NULL,
    `presenceStatus` ENUM('ONLINE', 'OFFLINE', 'AWAY') NOT NULL DEFAULT 'OFFLINE',
    `statusMessage` VARCHAR(191) NULL,
    `registrationRequestId` INTEGER NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRegistrationRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `surname` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `address` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'ACTIVE') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `UserRegistrationRequest_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `conversationId` INTEGER NOT NULL,

    INDEX `ConversationParticipant_conversationId_idx`(`conversationId`),
    UNIQUE INDEX `ConversationParticipant_userId_conversationId_key`(`userId`, `conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ciphertext` LONGTEXT NOT NULL,
    `iv` LONGBLOB NOT NULL,
    `tag` LONGBLOB NOT NULL,
    `keyId` VARCHAR(191) NOT NULL DEFAULT 'k1',
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Message_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_registrationRequestId_fkey` FOREIGN KEY (`registrationRequestId`) REFERENCES `UserRegistrationRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

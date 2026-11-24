-- Run once on an existing database before deploying the site-tab booking forms.
-- The existing Application.bookingSite column is retained. bookingDetails remains for legacy rows only.
CREATE TABLE `IvacBooking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicationId` INT NOT NULL,
  `loginEmail` VARCHAR(191) NOT NULL,
  `loginPhone` VARCHAR(191) NOT NULL,
  `encryptedPassword` TEXT NOT NULL,
  `webfileNumber` VARCHAR(191) NOT NULL,
  `dateOfBirth` DATE NOT NULL,
  `nationalId` VARCHAR(191) NOT NULL,
  `preferredCenter` VARCHAR(191) NOT NULL,
  `preferredDate` DATE NULL,
  `secondaryWebfiles` TEXT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `IvacBooking_applicationId_key` (`applicationId`),
  CONSTRAINT `IvacBooking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UkVfsBooking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicationId` INT NOT NULL,
  `loginEmail` VARCHAR(191) NOT NULL,
  `loginPhone` VARCHAR(191) NOT NULL,
  `encryptedPassword` TEXT NOT NULL,
  `gwfReference` VARCHAR(191) NOT NULL,
  `dateOfBirth` DATE NOT NULL,
  `passportExpiry` DATE NOT NULL,
  `preferredCenter` VARCHAR(191) NOT NULL,
  `appointmentType` VARCHAR(191) NULL,
  `preferredDate` DATE NULL,
  `groupSize` INT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `UkVfsBooking_applicationId_key` (`applicationId`),
  CONSTRAINT `UkVfsBooking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VfsBooking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicationId` INT NOT NULL,
  `loginEmail` VARCHAR(191) NOT NULL,
  `loginPhone` VARCHAR(191) NOT NULL,
  `encryptedPassword` TEXT NOT NULL,
  `applicationReference` VARCHAR(191) NOT NULL,
  `dateOfBirth` DATE NOT NULL,
  `passportExpiry` DATE NOT NULL,
  `preferredCenter` VARCHAR(191) NOT NULL,
  `appointmentType` VARCHAR(191) NULL,
  `preferredDate` DATE NULL,
  `groupSize` INT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `VfsBooking_applicationId_key` (`applicationId`),
  CONSTRAINT `VfsBooking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UsVisaBooking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicationId` INT NOT NULL,
  `loginEmail` VARCHAR(191) NOT NULL,
  `loginPhone` VARCHAR(191) NOT NULL,
  `encryptedPassword` TEXT NOT NULL,
  `visaClass` VARCHAR(191) NOT NULL,
  `ds160Confirmation` VARCHAR(191) NOT NULL,
  `dateOfBirth` DATE NOT NULL,
  `passportExpiry` DATE NOT NULL,
  `nationality` VARCHAR(191) NOT NULL,
  `feeReceiptNumber` VARCHAR(191) NULL,
  `interviewLocation` VARCHAR(191) NOT NULL,
  `preferredDate` DATE NULL,
  `groupSize` INT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `UsVisaBooking_applicationId_key` (`applicationId`),
  CONSTRAINT `UsVisaBooking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OtherBooking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `applicationId` INT NOT NULL,
  `siteName` VARCHAR(191) NOT NULL,
  `applicationReference` VARCHAR(191) NULL,
  `preferredDate` DATE NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `OtherBooking_applicationId_key` (`applicationId`),
  CONSTRAINT `OtherBooking_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/*
  Warnings:

  - You are about to alter the column `type` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `UnsignedTinyInt`.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `type` TINYINT UNSIGNED NOT NULL DEFAULT 0;

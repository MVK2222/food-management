/*
  Warnings:

  - Added the required column `category` to the `Food` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Stock";
PRAGMA foreign_keys=on;

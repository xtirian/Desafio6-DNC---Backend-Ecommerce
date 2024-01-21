/*
  Warnings:

  - You are about to drop the column `purchaseId` on the `Operation` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `Operation` table. All the data in the column will be lost.
  - Added the required column `operations` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operations` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Operation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "Operation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Operation" ("id", "productId", "quantity", "type") SELECT "id", "productId", "quantity", "type" FROM "Operation";
DROP TABLE "Operation";
ALTER TABLE "new_Operation" RENAME TO "Operation";
CREATE TABLE "new_Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "operations" TEXT NOT NULL,
    "totalPrice" DECIMAL NOT NULL,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("customerId", "id", "totalPrice") SELECT "customerId", "id", "totalPrice" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE TABLE "new_Purchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operations" TEXT NOT NULL,
    "totalCost" DECIMAL NOT NULL
);
INSERT INTO "new_Purchase" ("id", "totalCost") SELECT "id", "totalCost" FROM "Purchase";
DROP TABLE "Purchase";
ALTER TABLE "new_Purchase" RENAME TO "Purchase";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

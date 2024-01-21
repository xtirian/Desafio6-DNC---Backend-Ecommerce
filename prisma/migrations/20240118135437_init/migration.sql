/*
  Warnings:

  - You are about to drop the column `qantity` on the `Operation` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `Operation` table without a default value. This is not possible if the table is not empty.

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
INSERT INTO "new_Operation" ("id", "productId", "type") SELECT "id", "productId", "type" FROM "Operation";
DROP TABLE "Operation";
ALTER TABLE "new_Operation" RENAME TO "Operation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

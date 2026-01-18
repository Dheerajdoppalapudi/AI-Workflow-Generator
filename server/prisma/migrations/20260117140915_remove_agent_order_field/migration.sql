/*
  Warnings:

  - You are about to drop the column `order` on the `Agent` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT,
    "settings" TEXT,
    "icon" TEXT,
    "teamId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Agent" ("createdAt", "description", "icon", "id", "name", "prompt", "settings", "teamId", "updatedAt") SELECT "createdAt", "description", "icon", "id", "name", "prompt", "settings", "teamId", "updatedAt" FROM "Agent";
DROP TABLE "Agent";
ALTER TABLE "new_Agent" RENAME TO "Agent";
CREATE UNIQUE INDEX "Agent_teamId_name_key" ON "Agent"("teamId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

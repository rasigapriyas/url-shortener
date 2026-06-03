-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';

-- AlterEnum
ALTER TYPE "UrlStatus" ADD VALUE IF NOT EXISTS 'DELETED';

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
    'REGISTER',
    'LOGIN',
    'LOGOUT',
    'CREATE_URL',
    'UPDATE_URL',
    'DELETE_URL',
    'REDIRECT',
    'PASSWORD_RESET'
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Url" ADD COLUMN "customAlias" TEXT;
ALTER TABLE "Url" ADD COLUMN "lastVisitedAt" TIMESTAMP(3);
ALTER TABLE "Url" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN "os" TEXT;
ALTER TABLE "Visit" ADD COLUMN "referrer" TEXT;
ALTER TABLE "Visit" ADD COLUMN "userAgent" TEXT;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" "AuditAction" NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_customAlias_key" ON "Url"("customAlias");

-- CreateIndex
CREATE INDEX "Url_userId_status_idx" ON "Url"("userId", "status");

-- CreateIndex
CREATE INDEX "Url_shortCode_idx" ON "Url"("shortCode");

-- CreateIndex
CREATE INDEX "Visit_urlId_visitedAt_idx" ON "Visit"("urlId", "visitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

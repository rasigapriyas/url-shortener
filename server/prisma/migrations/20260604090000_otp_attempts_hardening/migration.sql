-- Harden OTP storage: track attempts and consumption per the auth spec.
ALTER TABLE "UserOtp" ADD COLUMN "attemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserOtp" ADD COLUMN "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: any previously verified OTP is considered used.
UPDATE "UserOtp" SET "isUsed" = "verified";

-- Speed up "latest active OTP for this user + purpose" lookups.
CREATE INDEX "UserOtp_userId_purpose_isUsed_idx" ON "UserOtp"("userId", "purpose", "isUsed");

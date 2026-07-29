-- CreateEnum
CREATE TYPE "token_purpose" AS ENUM ('password_reset', 'account_activation');

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "purpose" "token_purpose" NOT NULL DEFAULT 'password_reset';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMPTZ(6),
ADD COLUMN     "username" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

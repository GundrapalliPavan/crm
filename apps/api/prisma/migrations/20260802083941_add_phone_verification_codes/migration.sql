-- CreateTable
CREATE TABLE "phone_verification_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "new_phone" VARCHAR(20) NOT NULL,
    "code_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "phone_verification_codes_user_id_idx" ON "phone_verification_codes"("user_id");

-- CreateIndex
CREATE INDEX "phone_verification_codes_expires_at_idx" ON "phone_verification_codes"("expires_at");

-- AddForeignKey
ALTER TABLE "phone_verification_codes" ADD CONSTRAINT "phone_verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "login_otp_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_otp_codes_user_id_idx" ON "login_otp_codes"("user_id");

-- CreateIndex
CREATE INDEX "login_otp_codes_expires_at_idx" ON "login_otp_codes"("expires_at");

-- AddForeignKey
ALTER TABLE "login_otp_codes" ADD CONSTRAINT "login_otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

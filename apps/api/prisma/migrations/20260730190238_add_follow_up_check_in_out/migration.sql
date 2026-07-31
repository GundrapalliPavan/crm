-- AlterTable
ALTER TABLE "follow_ups" ADD COLUMN     "check_in_at" TIMESTAMPTZ(6),
ADD COLUMN     "check_in_latitude" DECIMAL(9,6),
ADD COLUMN     "check_in_longitude" DECIMAL(9,6),
ADD COLUMN     "check_out_at" TIMESTAMPTZ(6),
ADD COLUMN     "check_out_latitude" DECIMAL(9,6),
ADD COLUMN     "check_out_longitude" DECIMAL(9,6);

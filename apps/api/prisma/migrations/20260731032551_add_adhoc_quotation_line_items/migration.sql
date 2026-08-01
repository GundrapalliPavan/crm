-- AlterTable
ALTER TABLE "quotation_items" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "sku_snapshot" DROP NOT NULL,
ALTER COLUMN "unit_snapshot" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales_order_items" ALTER COLUMN "product_id" DROP NOT NULL,
ALTER COLUMN "sku_snapshot" DROP NOT NULL,
ALTER COLUMN "unit_snapshot" DROP NOT NULL;

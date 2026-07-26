-- CreateIndex
CREATE INDEX "communications_template_id_idx" ON "communications"("template_id");

-- CreateIndex
CREATE INDEX "companies_owner_id_idx" ON "companies"("owner_id");

-- CreateIndex
CREATE INDEX "contacts_owner_id_idx" ON "contacts"("owner_id");

-- CreateIndex
CREATE INDEX "follow_ups_contact_id_idx" ON "follow_ups"("contact_id");

-- CreateIndex
CREATE INDEX "follow_ups_company_id_idx" ON "follow_ups"("company_id");

-- CreateIndex
CREATE INDEX "goods_receipt_items_product_id_idx" ON "goods_receipt_items"("product_id");

-- CreateIndex
CREATE INDEX "invoice_items_sales_order_item_id_idx" ON "invoice_items"("sales_order_item_id");

-- CreateIndex
CREATE INDEX "invoices_contact_id_idx" ON "invoices"("contact_id");

-- CreateIndex
CREATE INDEX "leads_source_id_idx" ON "leads"("source_id");

-- CreateIndex
CREATE INDEX "leads_assigned_team_id_idx" ON "leads"("assigned_team_id");

-- CreateIndex
CREATE INDEX "quotations_contact_id_idx" ON "quotations"("contact_id");

-- CreateIndex
CREATE INDEX "quotations_owner_id_idx" ON "quotations"("owner_id");

-- CreateIndex
CREATE INDEX "sales_order_items_quotation_item_id_idx" ON "sales_order_items"("quotation_item_id");

-- CreateIndex
CREATE INDEX "sales_orders_contact_id_idx" ON "sales_orders"("contact_id");

-- CreateIndex
CREATE INDEX "sales_orders_owner_id_idx" ON "sales_orders"("owner_id");

-- CreateIndex
CREATE INDEX "stock_movements_warehouse_id_movement_at_idx" ON "stock_movements"("warehouse_id", "movement_at");

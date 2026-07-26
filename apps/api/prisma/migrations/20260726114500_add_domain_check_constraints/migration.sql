-- Domain CHECK constraints that the Prisma schema language cannot express.
--
-- These encode structural truths only (DATABASE.md section 118). Workflow rules
-- that depend on state or configuration stay in the domain layer.

-- DATABASE.md section 29: a follow-up must hang off at least one CRM entity.
ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_entity_required"
  CHECK (
    "lead_id" IS NOT NULL
    OR "contact_id" IS NOT NULL
    OR "company_id" IS NOT NULL
  );

-- DATABASE.md section 36: an address belongs to exactly one owner. Explicit
-- foreign keys plus this constraint give real referential integrity, which a
-- polymorphic entity_type/entity_id pair cannot.
ALTER TABLE "addresses"
  ADD CONSTRAINT "addresses_single_owner"
  CHECK (
    (("company_id" IS NOT NULL)::int
     + ("contact_id" IS NOT NULL)::int
     + ("warehouse_id" IS NOT NULL)::int) = 1
  );

-- A stock movement that changes nothing is meaningless. The sign carries the
-- direction (DATABASE.md section 49), so the value may be negative but never
-- zero. No lower bound is placed on inventory_balances.on_hand_quantity:
-- INVENTORY.md section 86 makes negative stock a permission-controlled,
-- configurable exception rather than a structural impossibility.
ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_quantity_delta_nonzero"
  CHECK ("quantity_delta" <> 0);

-- Reservations are always a non-negative holding against on-hand stock.
ALTER TABLE "inventory_balances"
  ADD CONSTRAINT "inventory_balances_reserved_non_negative"
  CHECK ("reserved_quantity" >= 0);

-- Commercial line quantities are always positive; returns and reversals are
-- modelled as their own documents, not as negative lines.
ALTER TABLE "quotation_items"
  ADD CONSTRAINT "quotation_items_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "sales_order_items"
  ADD CONSTRAINT "sales_order_items_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "sales_order_items"
  ADD CONSTRAINT "sales_order_items_fulfilled_non_negative"
  CHECK ("fulfilled_quantity" >= 0);

ALTER TABLE "purchase_order_items"
  ADD CONSTRAINT "purchase_order_items_ordered_positive"
  CHECK ("ordered_quantity" > 0);

ALTER TABLE "purchase_order_items"
  ADD CONSTRAINT "purchase_order_items_received_non_negative"
  CHECK ("received_quantity" >= 0);

ALTER TABLE "invoice_items"
  ADD CONSTRAINT "invoice_items_quantity_positive" CHECK ("quantity" > 0);

-- A goods receipt line splits into accepted and rejected; the parts must equal
-- the whole, or received stock and quality records would disagree.
ALTER TABLE "goods_receipt_items"
  ADD CONSTRAINT "goods_receipt_items_quantity_received_positive"
  CHECK ("quantity_received" > 0);

ALTER TABLE "goods_receipt_items"
  ADD CONSTRAINT "goods_receipt_items_accepted_non_negative"
  CHECK ("accepted_quantity" >= 0);

ALTER TABLE "goods_receipt_items"
  ADD CONSTRAINT "goods_receipt_items_rejected_non_negative"
  CHECK ("rejected_quantity" >= 0);

ALTER TABLE "goods_receipt_items"
  ADD CONSTRAINT "goods_receipt_items_split_balances"
  CHECK ("accepted_quantity" + "rejected_quantity" = "quantity_received");

-- DATABASE.md section 118: money is never negative on these records. Credit
-- notes and refunds are separate documents when they are introduced.
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_amount_positive" CHECK ("amount" > 0);

ALTER TABLE "payment_allocations"
  ADD CONSTRAINT "payment_allocations_amount_positive"
  CHECK ("allocated_amount" > 0);

ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_total_non_negative" CHECK ("total_amount" >= 0);

ALTER TABLE "invoices"
  ADD CONSTRAINT "invoices_paid_non_negative" CHECK ("paid_amount" >= 0);

ALTER TABLE "quotations"
  ADD CONSTRAINT "quotations_total_non_negative" CHECK ("total_amount" >= 0);

ALTER TABLE "sales_orders"
  ADD CONSTRAINT "sales_orders_total_non_negative" CHECK ("total_amount" >= 0);

ALTER TABLE "purchase_orders"
  ADD CONSTRAINT "purchase_orders_total_non_negative"
  CHECK ("total_amount" >= 0);

-- Document numbering counters only ever move forward.
ALTER TABLE "document_sequences"
  ADD CONSTRAINT "document_sequences_current_number_non_negative"
  CHECK ("current_number" >= 0);

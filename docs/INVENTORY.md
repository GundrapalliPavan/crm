INVENTORY.md

Electrical Distribution CRM — Inventory Module Specification

Version: 1.0
Status: Product Definition
Module: Inventory
Parent Document: PROJECT.md
Related Modules: CRM.md, SALES.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The Inventory module manages the physical stock of electrical products across branches and warehouses.

It should provide a reliable answer to:

* What products do we have?
* How much stock is available?
* Where is the stock located?
* How much stock is reserved?
* What stock is incoming?
* What stock is damaged or unavailable?
* Which products are running low?
* What stock needs replenishment?
* What stock has not moved for a long time?
* Where did a particular stock movement come from?
* Which sales orders are waiting for stock?
* Which items have been received?
* Which items have been dispatched?
* Which items were returned?
* Who adjusted inventory and why?

Inventory should become the authoritative source for physical stock availability.

⸻

2. Inventory Product Goal

The primary goal is:

Maintain accurate, real-time visibility of inventory across branches and warehouses while making receiving, transferring, reserving, picking, dispatching, returning, and adjusting stock simple and traceable.

The system should minimize:

* Stock mismatches
* Manual registers
* Spreadsheet inventory
* Duplicate stock records
* Unexplained adjustments
* Overselling
* Missed replenishment
* Untraceable transfers
* Incorrect warehouse balances

⸻

3. Inventory Scope

The Inventory module includes:

* Warehouses
* Storage Locations where required
* Stock Levels
* Available Stock
* Reserved Stock
* Incoming Stock
* Stock Movements
* Goods Receipt
* Stock Transfers
* Stock Reservations
* Picking
* Packing
* Dispatch Handoff
* Sales Returns
* Purchase Returns
* Stock Adjustments
* Damaged Stock
* Serial Number Tracking
* Batch Tracking where required
* Barcode / QR Support
* Stock Counts
* Stock Reconciliation
* Reorder Levels
* Low Stock
* Dead Stock
* Inventory Valuation Inputs
* Inventory Reports
* Inventory Audit History

⸻

4. Out of Scope

Inventory does not own:

* Product Master
* Product Pricing
* Sales Opportunities
* Quotations
* Sales Commercial Approval
* Supplier Purchase Orders
* Supplier Negotiation
* Customer Invoices
* Payment Collection
* Accounting Ledger
* Logistics Provider Management

These belong to their respective modules.

Inventory consumes information from those modules where required.

⸻

5. Core Module Relationships

Conceptually:

Product Management
       ↓
    Products
       ↓
   INVENTORY
       ↓
Stock Availability
       ↓
     Sales

Procurement flow:

Purchase Order
↓
Goods Received
↓
Inventory
↓
Stock Available

Sales flow:

Sales Order
↓
Stock Reservation
↓
Pick
↓
Pack
↓
Dispatch
↓
Stock Out

Transfer flow:

Warehouse A
↓
Transfer
↓
In Transit
↓
Warehouse B

Inventory should connect these workflows without taking ownership of unrelated commercial processes.

⸻

6. Primary Users

Warehouse Manager

Needs to:

* Monitor stock
* Receive goods
* Approve/monitor transfers
* Review adjustments
* Manage stock counts
* Monitor low stock
* Monitor damaged stock
* Track dispatch readiness
* Investigate discrepancies

⸻

Warehouse Staff

Needs to:

* Receive stock
* Scan products
* Put away stock
* Pick products
* Pack products
* Transfer stock
* Record returns
* Perform stock counts

The experience should be operationally fast and minimize typing.

⸻

Sales Executive

Needs read-oriented access to:

* Stock availability
* Branch availability
* Warehouse availability where permitted
* Incoming stock where useful

Sales should not directly alter inventory.

⸻

Sales Manager

Needs:

* Availability
* Reserved stock
* Order shortages
* Product availability across relevant branches

⸻

Purchase Team

Needs:

* Current stock
* Low stock
* Reorder requirements
* Incoming quantities
* Stock consumption

Purchase should use this information for procurement decisions.

⸻

Branch Manager

Needs:

* Branch stock
* Stock value where permitted
* Low stock
* Transfers
* Dead stock
* Stock discrepancies

⸻

Management

Needs organization-wide visibility into:

* Inventory
* Inventory value
* Stock movement
* Low stock
* Dead stock
* Fast-moving products
* Slow-moving products
* Branch stock
* Warehouse performance

⸻

7. Product Master Relationship

Inventory must not create a separate product master.

Products should originate from the authoritative Product Management domain.

Inventory references:

* Product ID
* SKU
* Product Name
* Variant
* Brand
* Category
* Unit of Measure
* Barcode
* Serial Tracking Requirement
* Batch Tracking Requirement

Inventory owns stock state for those products.

⸻

8. Inventory Domain Model

Important concepts include:

Warehouse

A physical location where stock is stored.

Storage Location

An optional location inside a warehouse.

Examples:

* Zone
* Rack
* Shelf
* Bin

Stock Balance

The current quantity of a product at a defined inventory location.

Stock Movement

An immutable business event explaining why stock increased, decreased, or moved.

Reservation

Stock allocated to a business requirement but not yet physically dispatched.

Goods Receipt

Confirmation that physical goods were received.

Transfer

Movement of inventory between warehouses or branches.

Adjustment

Authorized correction to recorded stock.

Stock Count

Physical verification of inventory.

⸻

9. Warehouse

A warehouse may belong to:

* Organization
* Branch

Potential information:

* Warehouse Code
* Warehouse Name
* Branch
* Address
* Contact
* Manager
* Status
* Warehouse Type

Potential types:

* Main Warehouse
* Branch Warehouse
* Transit Warehouse
* Returns Warehouse
* Damaged Stock Area

Do not create separate warehouses for every minor storage distinction unless operationally necessary.

⸻

10. Multiple Warehouses

The system should support:

Organization
├── Hyderabad Branch
│   ├── Main Warehouse
│   └── Branch Store
│
├── Vijayawada Branch
│   └── Main Warehouse
│
└── Visakhapatnam Branch
    └── Main Warehouse

Management may view consolidated inventory.

Branch users may have restricted visibility.

⸻

11. Storage Locations

Larger warehouses may require:

Warehouse
↓
Zone
↓
Rack
↓
Shelf / Bin

Example:

HYD-WH
→ Zone A
→ Rack 04
→ Shelf B

Storage-location tracking should be configurable.

Do not force small warehouses to maintain unnecessary bin-level complexity.

⸻

12. Stock Quantities

The system should clearly distinguish between quantities.

Important concepts:

On Hand

Physical stock currently recorded.

Reserved

Stock allocated to orders or approved requirements.

Available

Stock that can still be allocated.

Conceptually:

Available = On Hand - Reserved

Additional concepts may include:

* Incoming
* In Transit
* Damaged
* Quarantined

Exact calculations should be centralized and authoritative.

⸻

13. Stock Availability

Users should not have to interpret multiple numbers unnecessarily.

Sales-oriented availability may display:

* In Stock
* Limited Stock
* Out of Stock
* Incoming

Authorized users may additionally see quantities.

Example:

On Hand       250
Reserved       80
Available     170
Incoming      300

⸻

14. Stock Ledger

Every meaningful inventory change should create a traceable stock movement.

Conceptually:

Opening Stock       +100
Purchase Receipt     +50
Sales Dispatch       -20
Transfer Out         -10
Transfer In          +10
Customer Return       +2
Adjustment            -1

Inventory balances should be explainable from stock movements.

⸻

15. Stock Movement Principle

Avoid directly changing stock quantities without recording why.

Prefer:

Business Event
↓
Stock Movement
↓
Balance Updated

over:

User manually edits quantity

This is critical for auditability.

⸻

16. Movement Types

Potential movement types:

* Opening Stock
* Purchase Receipt
* Sales Dispatch
* Sales Return
* Purchase Return
* Transfer Out
* Transfer In
* Adjustment Increase
* Adjustment Decrease
* Damage
* Recovery
* Reservation
* Reservation Release

Not every logical reservation event necessarily needs to alter physical stock.

Physical stock and allocation state should remain conceptually distinct.

⸻

17. Movement Reference

Stock movements should reference their source where applicable.

Examples:

Purchase Receipt → GRN-00124
Sales Dispatch → SO-00421
Transfer → TR-00189
Return → SR-00042
Adjustment → ADJ-00031

This enables users to understand why inventory changed.

⸻

18. Goods Receipt

Goods receipt records physical arrival of purchased products.

Typical flow:

Purchase Order
↓
Goods Arrive
↓
Receive
↓
Verify
↓
Record Accepted Quantity
↓
Record Rejected/Damaged Quantity
↓
Update Inventory

Purchase owns the supplier PO.

Inventory owns physical receipt.

⸻

19. Goods Receipt Note

A Goods Receipt Note may contain:

* GRN Number
* Purchase Order
* Supplier
* Warehouse
* Receipt Date
* Supplier Invoice/Challan Reference
* Received By
* Items
* Received Quantity
* Accepted Quantity
* Rejected Quantity
* Damage Information
* Serial Numbers where required
* Batch Information where required
* Notes
* Attachments

⸻

20. Partial Receipt

A purchase order may arrive partially.

Example:

PO Quantity:       500
Received Today:    300
Pending:           200

The system should support multiple receipts against one PO.

Do not mark the entire PO received because one shipment arrived.

⸻

21. Excess Receipt

If received quantity exceeds the purchase order quantity:

The system should:

* Warn the user
* Apply configured tolerance if applicable
* Require approval where necessary

Do not silently accept commercial discrepancies.

⸻

22. Damaged Receipt

During goods receipt, users may classify products as:

* Accepted
* Damaged
* Rejected
* Pending Inspection

Damaged/rejected stock should not automatically become sellable inventory.

⸻

23. Putaway

Where warehouse complexity requires it:

Goods Received
↓
Temporary Receiving Area
↓
Putaway
↓
Rack / Bin

For smaller warehouses, receiving directly into a warehouse location may be sufficient.

Do not overcomplicate the initial implementation.

⸻

24. Stock Reservation

Confirmed or approved sales requirements may reserve stock.

Conceptually:

Available Stock
↓
Sales Order
↓
Reservation
↓
Reserved Stock

Reservation prevents the same stock from being promised to multiple customers.

⸻

25. Reservation Rules

Reservation behavior may depend on:

* Sales Order Status
* Customer Priority
* Branch
* Warehouse
* Stock Availability
* Required Delivery Date

Exact allocation rules require business approval.

Start with predictable rules.

⸻

26. Reservation Release

Reserved stock should be released when appropriate.

Examples:

* Order Cancelled
* Item Removed
* Reservation Expired
* Manager Releases Reservation

Release must be traceable.

⸻

27. Partial Reservation

If an order requires 100 units but only 60 are available:

The system may support:

Requested      100
Reserved        60
Shortage        40

The shortage should be visible to:

* Sales
* Warehouse
* Purchase

where relevant.

⸻

28. Stock Shortage

Shortages should lead to action.

Potential actions:

* Check Another Warehouse
* Transfer Stock
* Wait for Incoming Stock
* Request Procurement
* Partial Fulfilment
* Substitute Product where approved

Inventory should provide information rather than automatically making commercial decisions.

⸻

29. Picking

Once an order is ready for fulfilment:

Sales Order
↓
Pick List
↓
Warehouse Staff
↓
Pick Products

Pick lists may contain:

* Product
* SKU
* Quantity
* Warehouse
* Storage Location
* Serial Number requirement
* Batch requirement

⸻

30. Picking Status

Potential states:

* Not Started
* Picking
* Partially Picked
* Picked
* Exception

Avoid unnecessary workflow states.

⸻

31. Pick Exceptions

Potential exceptions:

* Product Missing
* Quantity Short
* Damaged Product
* Wrong Location
* Serial Number Issue

Warehouse users should be able to record exceptions quickly.

⸻

32. Packing

After picking:

Picked
↓
Packing
↓
Ready for Dispatch

Packing may include:

* Packages
* Quantity Verification
* Weight where required
* Packing Notes
* Labels

Detailed logistics functionality should not be introduced until required.

⸻

33. Dispatch

Inventory should record the physical stock-out associated with dispatch.

Potential information:

* Dispatch Number
* Sales Order
* Customer
* Warehouse
* Dispatch Date
* Items
* Quantities
* Transport Reference
* Delivery Reference

Logistics providers may be handled through a separate integration.

⸻

34. Partial Dispatch

Sales orders may be fulfilled through multiple dispatches.

Example:

Order Quantity      100
Dispatch 1           60
Dispatch 2           40

Inventory must track remaining quantities accurately.

⸻

35. Dispatch Confirmation

Physical stock should not be reduced merely because a pick list was created.

The authoritative stock-out event should occur at the approved operational point, such as dispatch confirmation.

The exact point should be defined before implementation.

⸻

36. Warehouse Transfers

The business should be able to move stock between warehouses.

Conceptual flow:

Transfer Request
↓
Approval where required
↓
Warehouse A Dispatch
↓
In Transit
↓
Warehouse B Receive
↓
Completed

⸻

37. Transfer Information

Potential information:

* Transfer Number
* Source Warehouse
* Destination Warehouse
* Request Date
* Requested By
* Approved By
* Products
* Requested Quantity
* Dispatched Quantity
* Received Quantity
* Status
* Notes

⸻

38. Transfer Status

Potential states:

* Draft
* Requested
* Approved
* Dispatched
* In Transit
* Partially Received
* Received
* Cancelled

Keep workflow proportional to operational needs.

⸻

39. Transfer Integrity

When stock leaves Warehouse A:

It should no longer appear as available there.

Before Warehouse B receives it:

It may appear as:

In Transit

This avoids falsely showing the same stock in both warehouses.

⸻

40. Transfer Discrepancies

Example:

Dispatched       100
Received          98
Difference         2

The discrepancy should require:

* Reason
* Review
* Appropriate adjustment/resolution

Do not silently change quantities.

⸻

41. Stock Adjustments

Adjustments may be required for:

* Physical Count Difference
* Damage
* Breakage
* Lost Stock
* Data Correction
* Opening Balance Correction
* Other Authorized Reason

Adjustments should be controlled.

⸻

42. Adjustment Information

Potential information:

* Adjustment Number
* Warehouse
* Product
* Current Quantity
* Adjustment Quantity
* Resulting Quantity
* Reason
* Notes
* Requested By
* Approved By
* Timestamp

⸻

43. Adjustment Approval

Large or sensitive adjustments may require approval.

Example:

Warehouse Staff
↓
Adjustment Request
↓
Warehouse Manager
↓
Approve / Reject

Thresholds should be configurable if required.

⸻

44. Stock Count

Physical stock counting should support periodic verification.

Potential count types:

* Full Stock Count
* Cycle Count
* Category Count
* Brand Count
* Location Count

⸻

45. Stock Count Workflow

Conceptually:

Create Count
↓
Freeze / Snapshot Expected Quantity
↓
Physical Count
↓
Compare
↓
Review Difference
↓
Approve
↓
Adjustment

Exact locking behavior should be defined carefully to avoid disrupting normal warehouse operations.

⸻

46. Blind Count

Where useful, physical counters may not see expected quantities.

This reduces confirmation bias.

Blind counting should be configurable rather than mandatory.

⸻

47. Count Variance

Example:

System Quantity       100
Physical Quantity      97
Variance               -3

Variance should require investigation before final adjustment where appropriate.

⸻

48. Inventory Reconciliation

Users should be able to understand:

Opening
+ Receipts
+ Returns
+ Transfers In
- Dispatches
- Transfers Out
± Adjustments
= Closing

Inventory should be mathematically explainable.

⸻

49. Sales Returns

When customers return products:

Customer Return
↓
Receive
↓
Inspect
↓
Classify

Potential classifications:

* Resellable
* Damaged
* Warranty
* Scrap
* Inspection Required

Returned products should not automatically become available stock.

⸻

50. Purchase Returns

Products may need to be returned to suppliers.

Potential reasons:

* Damage
* Wrong Product
* Excess Supply
* Quality Issue
* Commercial Agreement

Inventory should record physical stock-out.

Purchase manages supplier-side commercial workflow.

⸻

51. Damaged Stock

Damaged stock should remain distinguishable from sellable inventory.

Users should know:

* Product
* Quantity
* Warehouse
* Damage Reason
* Date
* Source
* Current Disposition

Potential disposition:

* Return to Vendor
* Repair
* Warranty
* Scrap
* Reclassify

⸻

52. Serial Number Tracking

Certain electrical products may require serial tracking.

Examples may include:

* Premium Fans
* Smart Devices
* Electronics
* Warranty-sensitive Products

Serial tracking should be configurable per product.

⸻

53. Serial Number Lifecycle

Conceptually:

Received
↓
In Stock
↓
Reserved
↓
Dispatched
↓
Customer
↓
Returned / Warranty where applicable

A serial number should not exist simultaneously in incompatible inventory states.

⸻

54. Serial Number Information

Potential fields:

* Serial Number
* Product
* Warehouse
* Receipt Reference
* Supplier
* Receipt Date
* Current Status
* Sales Order
* Customer
* Dispatch Date
* Warranty Information

⸻

55. Batch Tracking

Batch tracking may be useful for selected products.

Potential information:

* Batch Number
* Product
* Supplier
* Received Date
* Quantity
* Warehouse

Do not require batch tracking for products where it provides no business value.

⸻

56. Barcode Support

Barcode scanning may support:

* Receiving
* Product Identification
* Picking
* Transfer
* Stock Count
* Returns

The system should support standard product barcodes where available.

⸻

57. QR Code Support

QR codes may eventually support:

* Internal Product Labels
* Warehouse Locations
* Serial Numbers
* Stock Identification

Do not create proprietary QR systems unless they solve a practical problem.

⸻

58. Mobile / Scanner Experience

Warehouse workflows should be suitable for future mobile or handheld-device use.

Core actions should optimize for:

Scan
↓
Confirm
↓
Quantity
↓
Next

Avoid requiring warehouse staff to repeatedly type SKU numbers.

⸻

59. Stock Reorder Level

Products may have configured:

* Minimum Stock
* Reorder Level
* Desired Stock

Potentially by:

* Warehouse
* Branch

Example:

Available Stock      40
Reorder Level        50
→ Reorder Attention

⸻

60. Reorder Recommendation

Future recommendation may consider:

* Current Available Stock
* Reserved Stock
* Incoming Stock
* Historical Consumption
* Open Sales Orders
* Lead Time

Initially, simpler threshold-based logic is sufficient.

⸻

61. Low Stock

Low-stock views should help Purchase and management understand what requires action.

Potential information:

* Product
* Warehouse
* Available
* Reorder Level
* Incoming
* Open Demand

Low stock should be actionable rather than merely informational.

⸻

62. Out of Stock

Out-of-stock items should clearly indicate:

* Available = 0
* Incoming Quantity where known
* Expected Arrival where known

Sales may consume this information.

⸻

63. Fast-Moving Stock

Potential future classification based on historical movement.

Useful for:

* Procurement
* Warehouse Planning
* Sales
* Forecasting

Do not introduce arbitrary classifications without sufficient historical data.

⸻

64. Slow-Moving Stock

Potential indicators:

* Low sales frequency
* Low outbound movement
* Long storage duration

Useful for inventory optimization.

⸻

65. Dead Stock

Dead stock may be defined by configurable inactivity periods.

Example conceptually:

No Movement
> Configured Period
→ Dead Stock Candidate

Do not hardcode one universal definition.

⸻

66. Stock Ageing

Stock ageing may show:

* 0–30 Days
* 31–60 Days
* 61–90 Days
* 91–180 Days
* 180+ Days

Exact ranges should be configurable where necessary.

⸻

67. Inventory Valuation

Inventory may need valuation information.

Possible methods depend on accounting requirements.

Examples:

* Weighted Average
* FIFO

The final valuation method must be approved by the business/accounting requirements.

Do not invent financial accounting rules inside Inventory.

⸻

68. Cost Visibility

Cost information may be sensitive.

Permissions should control access to:

* Purchase Cost
* Average Cost
* Inventory Value

Warehouse staff may not require commercial cost information.

⸻

69. Inventory Home

The Inventory home should answer:

What needs warehouse attention today?

Potential areas:

Today

* Goods Awaiting Receipt
* Orders Awaiting Picking
* Orders Awaiting Dispatch
* Transfers

Attention

* Low Stock
* Stock Shortages
* Transfer Discrepancies
* Count Variances
* Damaged Stock

Overview

* Total Products
* Stock Value where permitted
* Warehouses
* Recent Movements

Avoid creating a dashboard full of decorative charts.

⸻

70. Stock List

The stock list is a core operational view.

Useful columns:

* Product
* SKU
* Brand
* Warehouse
* On Hand
* Reserved
* Available
* Incoming
* Status

Potential default views:

* All Stock
* Available Stock
* Low Stock
* Out of Stock
* Reserved
* Damaged
* Dead Stock

⸻

71. Product Stock Detail

Potential structure:

Header

* Product
* SKU
* Brand
* Category

Availability

By warehouse:

Warehouse        On Hand   Reserved   Available   Incoming
HYD Main            250        80         170         300
VJA Main            120        20         100           0

Movements

Recent stock ledger.

Serial / Batch

Where applicable.

Demand

Relevant open reservations/orders.

⸻

72. Warehouse Detail

Potential information:

* Warehouse
* Branch
* Manager
* Address
* Status

Sections:

* Stock
* Receipts
* Dispatches
* Transfers
* Adjustments
* Counts
* Damaged Stock

⸻

73. Goods Receipt List

Useful information:

* GRN Number
* Supplier
* Purchase Order
* Warehouse
* Date
* Status
* Received By

Views:

* Awaiting Receipt
* Partial
* Completed
* Exception

⸻

74. Goods Receipt UX

Receiving should optimize for operational speed.

Conceptual layout:

Purchase Order
──────────────────
Supplier
Warehouse
Reference
Items
──────────────────
Product | Ordered | Previously Received | Receiving | Accepted | Rejected
[Save Draft] [Confirm Receipt]

Barcode scanning should eventually accelerate this workflow.

⸻

75. Transfer List

Useful information:

* Transfer Number
* Source
* Destination
* Items
* Status
* Requested Date
* Dispatch Date

Views:

* Requested
* Approved
* In Transit
* Awaiting Receipt
* Completed

⸻

76. Stock Movement History

Users should be able to filter by:

* Product
* Warehouse
* Movement Type
* Reference
* Date
* User

Each movement should show:

* Date/Time
* Product
* Quantity Change
* From/To where relevant
* Balance
* Reference
* User

⸻

77. Search

Inventory search should support:

* Product Name
* SKU
* Barcode
* Serial Number
* Batch Number
* GRN Number
* Transfer Number
* Warehouse

Scanning should eventually act as a search mechanism.

⸻

78. Filters

Common filters:

* Warehouse
* Branch
* Product
* Brand
* Category
* Stock Status
* Movement Type
* Date
* Serial Tracking
* Batch Tracking

⸻

79. Saved Views

Potential views:

* My Warehouse
* Low Stock
* Out of Stock
* Incoming Stock
* Reserved Stock
* Damaged Stock
* Awaiting Receipt
* Awaiting Dispatch
* Transfers In Transit
* Count Variances

⸻

80. Bulk Actions

Potential safe bulk actions:

* Export
* Print Labels
* Initiate Count
* Create Transfer Draft where appropriate

Avoid unrestricted bulk quantity adjustments.

⸻

81. Inventory Notifications

Useful notifications may include:

* Low Stock
* Out of Stock
* Goods Awaiting Receipt
* Transfer Received
* Transfer Discrepancy
* Stock Count Variance
* Large Adjustment Approval
* Sales Order Stock Shortage

Notification relevance should be role-specific.

⸻

82. Inventory Automation

Potential automation:

Low Stock

Available <= Reorder Level
↓
Flag Low Stock
↓
Notify Purchase

Goods Receipt

Receipt Confirmed
↓
Create Stock Movement
↓
Update Availability
↓
Update Purchase Receipt Status

Sales Order

Eligible Sales Order
↓
Reserve Stock
↓
Update Availability

Dispatch

Dispatch Confirmed
↓
Create Stock-Out Movement
↓
Consume Reservation
↓
Update Sales Order Fulfilment

Automation must remain transactional and auditable.

⸻

83. Inventory Permissions

Potential permissions:

inventory.stock.view
inventory.cost.view
inventory.receipt.view
inventory.receipt.create
inventory.receipt.confirm
inventory.transfer.view
inventory.transfer.create
inventory.transfer.approve
inventory.transfer.dispatch
inventory.transfer.receive
inventory.adjustment.view
inventory.adjustment.create
inventory.adjustment.approve
inventory.count.view
inventory.count.create
inventory.count.complete
inventory.dispatch.view
inventory.dispatch.confirm
inventory.export

Exact naming should follow final RBAC conventions.

⸻

84. Data Visibility

Visibility may depend on:

* Organization
* Branch
* Warehouse
* Role
* Permission

Warehouse staff may only see assigned warehouses.

Branch Managers may see branch warehouses.

Management may see organization-wide inventory.

Backend must enforce these boundaries.

⸻

85. Inventory Integrity

Inventory integrity is more important than convenience.

Never allow operations that can silently create impossible stock states.

Examples:

* Negative stock without approved business rule
* Same serial number in multiple warehouses
* Receiving the same transfer twice
* Dispatching the same reservation twice
* Duplicate goods receipt processing
* Unexplained stock adjustments

⸻

86. Negative Stock

Default principle:

Do not allow physical available stock to become negative.

If the business explicitly requires negative stock for exceptional workflows, it should be:

* Configurable
* Permission-controlled
* Clearly visible
* Auditable

Do not enable negative inventory casually.

⸻

87. Transaction Safety

Critical inventory operations should be atomic.

Examples:

Confirm Receipt

should not create a GRN without successfully updating inventory.

Likewise:

Confirm Dispatch

should not update the order while failing to create the corresponding stock movement.

Use database transactions where appropriate.

⸻

88. Idempotency

Critical operations should protect against accidental duplicate processing.

Examples:

* Goods Receipt Confirmation
* Transfer Receipt
* Dispatch Confirmation
* External Warehouse Callbacks

A user double-click or network retry should not duplicate stock.

⸻

89. Concurrent Stock Changes

Multiple users may act on the same stock simultaneously.

Example:

Available: 10
Sales Order A wants 8
Sales Order B wants 7

The system must prevent both from independently reserving the same stock.

Inventory operations must account for concurrency.

⸻

90. Historical Integrity

Do not delete confirmed stock movements merely to correct a mistake.

Prefer corrective movements.

Example:

Incorrect:

Delete old receipt

Preferred:

Reversal / Correction
↓
Correct Movement

Exact correction workflows should be defined based on business requirements.

⸻

91. Audit Requirements

Important events should be auditable:

* Receipt Confirmed
* Receipt Reversed
* Transfer Requested
* Transfer Approved
* Transfer Dispatched
* Transfer Received
* Stock Adjusted
* Adjustment Approved
* Count Completed
* Variance Approved
* Dispatch Confirmed
* Return Received

⸻

92. Import

Initial stock may require import.

Import should support:

* Product Mapping
* Warehouse Mapping
* Quantity
* Serial Numbers where required
* Validation
* Duplicate Detection
* Error Report

Opening stock import should create traceable opening movements.

Do not directly inject unexplained quantities into stock tables.

⸻

93. Export

Authorized users may export:

* Stock
* Movements
* Low Stock
* Count Variances
* Serial Numbers

Exports should respect organization, branch, warehouse, and permission boundaries.

⸻

94. Sales Integration

Sales consumes:

* Available Stock
* Stock Status
* Warehouse Availability where permitted
* Incoming Stock where useful

Sales may request reservation.

Inventory remains authoritative for stock allocation.

⸻

95. Purchase Integration

Purchase consumes:

* Current Stock
* Available Stock
* Reorder Status
* Incoming Requirements
* Historical Consumption

Inventory consumes:

* Approved Purchase Order
* Expected Incoming Quantity

Physical receipt belongs to Inventory.

⸻

96. Billing Integration

Billing may need information about:

* Fulfilled Quantity
* Dispatch
* Sales Order

The exact relationship between dispatch and invoicing depends on approved business workflow.

Inventory should not independently create financial accounting records.

⸻

97. CRM Integration

CRM may display lightweight stock information during customer interaction.

CRM must not directly manipulate inventory.

⸻

98. Logistics Integration

Future integrations may support:

* Shipment Creation
* Tracking Number
* Carrier
* Delivery Status

Inventory owns warehouse dispatch.

External logistics systems own transportation tracking.

⸻

99. Product Integration

Product Management owns:

* Product
* SKU
* Brand
* Category
* Unit
* Technical Specifications
* Tracking Requirements

Inventory owns:

* Quantity
* Warehouse
* Location
* Reservation
* Movement
* Serial/Batch State

⸻

100. Accounting Integration

Inventory may provide valuation inputs to accounting systems.

Accounting systems remain authoritative for:

* General Ledger
* Cost Accounting
* Financial Statements
* Tax Accounting

Do not turn Inventory into a full accounting engine.

⸻

101. Inventory Reports

Useful reports include:

* Stock Summary
* Warehouse Stock
* Branch Stock
* Stock Movement
* Low Stock
* Out of Stock
* Stock Ageing
* Dead Stock
* Fast-moving Stock
* Slow-moving Stock
* Damaged Stock
* Transfer Report
* Adjustment Report
* Stock Count Variance
* Serial Number Report

Advanced reporting may ultimately belong to the Reports module.

⸻

102. Inventory Analytics

Potential metrics:

* Total Stock Quantity
* Inventory Value
* Available Stock
* Reserved Stock
* Incoming Stock
* Low-stock Products
* Out-of-stock Products
* Dead-stock Value
* Inventory Turnover
* Stock Adjustment Value
* Count Accuracy

Metrics should help operations rather than merely decorate dashboards.

⸻

103. Warehouse Performance

Potential future indicators:

* Receipt Processing Time
* Pick Time
* Dispatch Time
* Pick Accuracy
* Stock Count Accuracy
* Transfer Processing Time

These should be introduced only if operationally useful.

Avoid creating employee surveillance metrics without clear business value.

⸻

104. Mobile Warehouse Experience

Future mobile/handheld experience should prioritize:

* Scan Product
* Receive
* Pick
* Transfer
* Count
* Return
* Lookup Stock

Large tables and analytics should remain web-oriented.

⸻

105. Mobile Navigation Concept

Potential future mobile inventory navigation:

Today
Stock
Receive
Pick
Transfer
Scan

The final mobile architecture should be designed separately.

⸻

106. Camera / Scanner

Future mobile devices may use:

* Camera Barcode Scanning
* QR Scanning
* Dedicated Handheld Scanners

Scanning should reduce manual product lookup.

Do not make scanning mandatory where users work effectively without it.

⸻

107. Offline Considerations

Some warehouse workflows may eventually require limited offline capability.

Potential candidates:

* Stock Count
* Barcode Lookup from Cached Data
* Draft Receiving
* Draft Picking

Final confirmation of stock-changing operations should generally synchronize with the authoritative backend.

Offline inventory mutation requires careful conflict handling and should not be implemented casually.

⸻

108. AI Opportunities

Future AI may assist with:

* Demand Forecasting
* Reorder Suggestions
* Slow-moving Stock Identification
* Dead-stock Prediction
* Anomaly Detection
* Stock Optimization
* Transfer Suggestions

AI should recommend.

Authoritative stock quantities must remain deterministic.

⸻

109. Empty States

Examples:

No Stock

Explain whether:

* Product has never been received
* Warehouse has zero stock

Potential action:

* View Incoming Purchase Orders

No Transfers

Action:

* Create Transfer

No Low Stock

Communicate that no products currently require reorder attention.

Avoid unnecessary decorative content.

⸻

110. Error States

Handle scenarios such as:

* Insufficient Stock
* Product Not Found
* Invalid Serial Number
* Duplicate Serial Number
* Transfer Already Received
* Receipt Already Confirmed
* Dispatch Already Confirmed
* Quantity Changed
* Permission Denied
* Warehouse Inactive
* Concurrent Stock Change

Errors should explain the next safe action.

⸻

111. Loading & Feedback

Operational workflows should provide immediate feedback.

Examples:

* Scanning
* Receiving
* Picking
* Transfer Confirmation

Avoid full-page blocking where unnecessary.

For critical confirmations, clearly indicate success or failure before users continue.

⸻

112. Inventory UX Principles

Inventory UX should prioritize:

* Accuracy
* Speed
* Scanability
* Minimal Typing
* Clear Quantities
* Clear Location
* Clear Status
* Traceability
* Exception Handling

Warehouse staff should not need to understand database concepts to maintain accurate stock.

⸻

113. Quantity Presentation

Always label quantities clearly.

Avoid ambiguous:

Stock: 100

when multiple inventory states exist.

Prefer:

On Hand: 100
Reserved: 25
Available: 75

where relevant.

⸻

114. Exception-First UX

Warehouse operations often revolve around exceptions.

The UI should make situations such as these obvious:

* Quantity Short
* Damaged Product
* Missing Product
* Transfer Difference
* Serial Mismatch
* Stock Count Variance

Users should know exactly how to resolve them.

⸻

115. Inventory Success Metrics

Potential product metrics:

* Inventory Accuracy
* Stock Count Accuracy
* Stock-out Rate
* Low-stock Frequency
* Dead-stock Percentage
* Inventory Turnover
* Goods Receipt Processing Time
* Pick Accuracy
* Dispatch Processing Time
* Transfer Discrepancy Rate
* Adjustment Frequency
* Order Shortage Rate

⸻

116. Initial Inventory Release Priorities

Recommended implementation order:

Inventory Foundation

* Warehouses
* Product Inventory Mapping
* Stock Balances
* Stock Movement Ledger
* Basic Stock Search

Receiving

* Purchase Order Integration
* Goods Receipt
* Partial Receipt
* Damage / Rejection

Sales Allocation

* Stock Availability
* Reservations
* Reservation Release
* Shortage Handling

Fulfilment

* Pick List
* Picking
* Dispatch Confirmation
* Partial Dispatch

Transfers

* Warehouse Transfers
* Transfer Dispatch
* Transfer Receipt
* Transfer Discrepancies

Inventory Control

* Adjustments
* Stock Count
* Reconciliation

Advanced Tracking

* Serial Numbers
* Batch Tracking
* Barcode / QR

Inventory Intelligence

* Reorder Levels
* Low Stock
* Ageing
* Dead Stock
* Analytics
* Forecasting

This order should be reconciled with the approved overall development roadmap.

⸻

117. Inventory Screen Inventory

Likely screens/views include:

* Inventory Home
* Stock List
* Product Stock Detail
* Warehouse List
* Warehouse Detail
* Goods Receipt List
* Goods Receipt Detail
* Receive Goods
* Pick Lists
* Pick Detail
* Dispatch List
* Dispatch Detail
* Transfer List
* Transfer Detail
* Create Transfer
* Receive Transfer
* Stock Movement History
* Adjustment List
* Create Adjustment
* Stock Count List
* Stock Count Workspace
* Damaged Stock
* Serial Number Lookup
* Low Stock
* Inventory Reports

This is a screen inventory, not an instruction to build everything immediately.

⸻

118. Stock Detail Information Architecture

Potential structure:

Header

* Product
* SKU
* Brand
* Category
* Stock Status

Availability

* On Hand
* Reserved
* Available
* Incoming

Warehouses

Stock distribution by location.

Movements

Chronological stock ledger.

Demand

Reservations and open requirements.

Tracking

Serial / Batch information where applicable.

⸻

119. Warehouse Detail Information Architecture

Potential structure:

Header

* Warehouse
* Branch
* Manager
* Status

Quick actions:

* Receive
* Transfer
* Stock Count
* Adjustment where permitted

Overview

* Products
* On Hand
* Reserved
* Available
* Low Stock

Stock

Warehouse stock list.

Operations

* Receipts
* Picks
* Dispatches
* Transfers

Control

* Counts
* Adjustments
* Damaged Stock

⸻

120. Inventory Design Requirements

Before designing Inventory screens, Claude must:

1. Read PROJECT.md.
2. Read SALES.md.
3. Read INVENTORY.md.
4. Read relevant Purchase documentation when available.
5. Review approved design-system documentation.
6. Understand the exact warehouse workflow.
7. Identify stock-changing actions.
8. Identify permissions.
9. Identify approval requirements.
10. Identify exception states.
11. Consider scanner/mobile behavior.
12. Avoid introducing functionality outside approved scope.

⸻

121. Inventory Development Requirements

Before implementing Inventory functionality, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read SALES.md.
5. Read INVENTORY.md.
6. Read Purchase documentation where relevant.
7. Inspect existing implementation.
8. Identify authoritative product source.
9. Identify stock transaction requirements.
10. Identify concurrency risks.
11. Identify permissions.
12. Identify audit requirements.
13. Identify API requirements.
14. Identify integration dependencies.
15. Define tests.
16. Implement only approved scope.
17. Verify before reporting completion.

⸻

122. Cross-Module Ownership

Product Management Owns

* Product Master
* SKU
* Brand
* Category
* Specifications
* Unit of Measure

Inventory Owns

* Warehouses
* Physical Stock
* Stock Availability
* Reservations
* Stock Movements
* Goods Receipt
* Transfers
* Picking
* Dispatch Stock-Out
* Returns Stock Handling
* Adjustments
* Stock Counts
* Serial/Batch Inventory State

Sales Owns

* Opportunities
* Quotations
* Sales Orders
* Commercial Terms

Purchase Owns

* Vendors
* Purchase Requirements
* Supplier Quotations
* Purchase Orders
* Supplier Commercial Terms

Billing Owns

* Invoices
* Payments
* Credit/Debit Notes
* Financial Outstanding

Inventory may consume and provide information to these modules but must not duplicate their authoritative business logic.

⸻

123. Critical Inventory Principle

For every product quantity, the system should be able to answer:

What product?
How much?
Where?
What state is it in?
Why is that quantity there?
What business event changed it?
Who performed the change?
When did it happen?

If a stock quantity cannot be explained, inventory integrity is compromised.

⸻

124. Stock Truth Principle

The Inventory module is the authoritative source of physical stock truth.

Other modules should ask Inventory:

Is stock available?

rather than maintaining their own stock quantity.

Sales should not calculate stock independently.

Purchase should not calculate stock independently.

Billing should not calculate stock independently.

⸻

125. Operational Principle

Common warehouse actions should optimize for:

Identify
↓
Scan / Select
↓
Enter Quantity
↓
Verify
↓
Confirm

Complex rules should operate behind simple operational interfaces.

⸻

126. Final Inventory Principle

Inventory is successful when the business can trust the number shown on screen.

The desired operational cycle is:

Receive
↓
Store
↓
Reserve
↓
Pick
↓
Dispatch
↓
Track
↓
Count
↓
Reconcile

Every stock-changing operation must be:

Accurate.

Traceable.

Permission-controlled.

Auditable.

Safe under concurrent use.

The product should make maintaining accurate stock easier than maintaining manual registers or spreadsheets.
PURCHASE.md

Electrical Distribution CRM — Purchase & Procurement Module Specification

Version: 1.0
Status: Product Definition
Module: Purchase / Procurement
Parent Document: PROJECT.md
Related Modules: CRM.md, SALES.md, INVENTORY.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The Purchase module manages procurement of products and materials from suppliers.

It should help the organization answer:

* What products need to be purchased?
* Why do they need to be purchased?
* How much should be purchased?
* Which supplier should we purchase from?
* What price has the supplier offered?
* What were previous purchase prices?
* What commercial terms are available?
* Does the purchase require approval?
* Which Purchase Orders are open?
* What goods are expected?
* What goods have been received?
* What quantities are still pending?
* Which supplier deliveries are delayed?
* Which supplier invoices are pending?
* Which products need to be returned to suppliers?
* How are suppliers performing?

The Purchase module should make procurement controlled, transparent, and closely connected to actual inventory and sales demand.

⸻

2. Purchase Product Goal

The primary goal is:

Ensure the right products are purchased from the right suppliers, at the right price, in the right quantity, and at the right time.

The system should reduce:

* Stock shortages
* Excess purchasing
* Manual Purchase Orders
* Spreadsheet procurement
* Supplier follow-up through personal messages
* Price inconsistencies
* Unauthorized purchasing
* Duplicate purchasing
* Missed deliveries
* Untracked pending quantities
* Unexplained supplier selection

⸻

3. Purchase Scope

The Purchase module includes:

* Suppliers / Vendors
* Supplier Contacts
* Supplier Product Relationships
* Purchase Requirements
* Purchase Requisitions
* Replenishment Requirements
* Sales-demand Procurement
* Request for Quotation (RFQ)
* Supplier Quotations
* Quotation Comparison
* Supplier Selection
* Purchase Approvals
* Purchase Orders
* PO Amendments
* PO Communication
* Supplier Follow-ups
* Expected Deliveries
* Partial Deliveries
* Pending PO Quantities
* Purchase Returns Coordination
* Supplier Performance
* Purchase Analytics
* Purchase Notifications
* Purchase Automation

⸻

4. Out of Scope

Purchase does not own:

* Product Master
* Physical Stock
* Goods Receipt Stock Posting
* Customer Quotations
* Sales Orders
* Customer Billing
* Supplier Payment Accounting
* General Ledger
* Warehouse Operations

These belong to their respective modules.

Purchase may consume information from those modules.

⸻

5. Core Module Relationships

Procurement lifecycle:

Inventory / Sales Demand
↓
Purchase Requirement
↓
Supplier Selection
↓
RFQ
↓
Supplier Quotations
↓
Comparison
↓
Approval
↓
Purchase Order
↓
Supplier
↓
Goods Arrival
↓
Inventory Receipt
↓
Supplier Invoice
↓
Accounts / Billing

Purchase should coordinate the commercial procurement process.

Inventory remains authoritative for physical receipt and stock.

⸻

6. Primary Users

Purchase Executive

Needs to:

* Review requirements
* Create requisitions
* Contact suppliers
* Create RFQs
* Record supplier quotations
* Compare quotations
* Negotiate pricing
* Create Purchase Orders
* Send POs
* Follow up with suppliers
* Track pending deliveries
* Coordinate returns

⸻

Purchase Manager

Needs to:

* Review procurement requirements
* Approve supplier selection
* Approve Purchase Orders
* Monitor open POs
* Review supplier pricing
* Review delayed deliveries
* Monitor procurement performance
* Review supplier performance

⸻

Warehouse Manager

Needs visibility into:

* Incoming Purchase Orders
* Expected deliveries
* Pending quantities
* Supplier information

Warehouse performs physical receipt through Inventory.

⸻

Sales Manager

May need visibility into procurement associated with:

* Customer Orders
* Stock Shortages
* High-priority Sales Orders
* Expected Stock Arrival

Sales should not directly control procurement unless permission allows.

⸻

Branch Manager

Needs:

* Branch Purchase Requirements
* Branch Procurement
* Purchase Approvals
* Open Purchase Orders
* Incoming Stock

⸻

Management

Needs:

* Purchase Value
* Supplier Spend
* Open Purchase Orders
* Price Trends
* Purchase vs Sales Demand
* Supplier Performance
* Delayed Orders
* Procurement Trends

⸻

Accounts / Finance

Needs:

* Approved Purchase Order
* Goods Receipt Information
* Supplier Invoice
* Commercial Terms
* Payment Terms

Finance remains authoritative for payment and accounting.

⸻

7. Supplier Domain

A supplier represents a business from which the organization purchases products.

Examples:

* Manufacturer
* Brand
* Authorized Distributor
* Wholesaler
* Importer
* Regional Supplier

A supplier may provide products across multiple categories.

⸻

8. Supplier Information

Potential fields include:

Basic Information

* Supplier ID
* Supplier Code
* Business Name
* Legal Name
* Supplier Type
* Status

Contact

* Primary Contact
* Phone
* WhatsApp
* Email
* Website

Address

* Registered Address
* Billing Address
* Dispatch Address where applicable

Tax Information

* GSTIN
* PAN where required
* State
* Place of Supply related information where applicable

Commercial Information

* Payment Terms
* Credit Period
* Credit Limit where relevant
* Preferred Currency
* Standard Lead Time
* Minimum Order Value
* Minimum Order Quantity

Relationship

* Assigned Purchase Executive
* Brands Supplied
* Product Categories
* Notes
* Tags

⸻

9. Supplier Contacts

A supplier may have multiple contacts.

Example:

ABC Electrical Industries
├── Sales Manager
├── Regional Sales Executive
├── Dispatch Coordinator
└── Accounts Contact

Contact information may include:

* Name
* Role
* Phone
* WhatsApp
* Email
* Preferred Communication

⸻

10. Supplier Status

Potential statuses:

* Active
* Inactive
* On Hold
* Blocked

Blocking a supplier may prevent new Purchase Orders while preserving historical records.

⸻

11. Supplier Product Mapping

The system should understand which suppliers provide which products.

Potential information:

* Supplier
* Product
* Supplier SKU
* Supplier Product Name
* Last Purchase Price
* Standard Supplier Price
* Minimum Order Quantity
* Lead Time
* Preferred Supplier
* Last Purchased Date

Do not create duplicate internal products for different suppliers.

⸻

12. Multiple Suppliers

A product may have multiple suppliers.

Example:

Product A
├── Supplier 1
├── Supplier 2
└── Supplier 3

The system should help compare suppliers rather than forcing a permanent one-supplier relationship.

⸻

13. Preferred Supplier

Products may optionally have a preferred supplier.

Preferred supplier may be determined by:

* Price
* Availability
* Lead Time
* Reliability
* Commercial Agreement
* Brand Authorization

Preferred does not necessarily mean mandatory.

⸻

14. Purchase Requirement

A Purchase Requirement represents demand that may need procurement.

Potential sources:

* Low Stock
* Reorder Level
* Sales Order Shortage
* Manual Requirement
* Branch Requirement
* Forecast
* Project Requirement
* Stock Planning

⸻

15. Requirement Information

Potential fields:

* Requirement Number
* Product
* Required Quantity
* Current Stock
* Available Stock
* Incoming Stock
* Required Date
* Warehouse
* Branch
* Source
* Priority
* Requested By
* Reason

⸻

16. Requirement Source

The system should preserve why procurement was initiated.

Example:

Requirement: 100 Ceiling Fans
Source:
Sales Order SO-00421

or:

Requirement: 500 Switches
Source:
Reorder Level

This improves procurement decisions and traceability.

⸻

17. Purchase Requisition

A Purchase Requisition is an internal request to purchase.

Conceptually:

Requirement
↓
Purchase Requisition
↓
Review
↓
Approval
↓
Procurement

Not every organization may require formal requisitions.

The workflow should be configurable.

⸻

18. Purchase Requisition Information

Potential information:

* PR Number
* Requester
* Branch
* Warehouse
* Date
* Required Date
* Priority
* Products
* Quantities
* Estimated Cost
* Reason
* Related Sales Order
* Notes
* Status

⸻

19. Purchase Requisition Status

Potential states:

* Draft
* Submitted
* Approval Pending
* Approved
* Rejected
* Procurement Started
* Completed
* Cancelled

Avoid unnecessary workflow states.

⸻

20. Requirement Consolidation

Multiple requirements for the same product may be consolidated.

Example:

Sales Order A     50
Sales Order B     30
Reorder Demand   120
────────────────────
Total Demand     200

Before purchasing, the system should also consider:

Available Stock
Incoming Stock
Existing Open PO

This helps prevent duplicate or excessive procurement.

⸻

21. Procurement Planning

A useful procurement view should show:

* Product
* Current Stock
* Available Stock
* Reserved
* Incoming
* Open Demand
* Reorder Level
* Suggested Purchase Quantity

Suggested quantities should remain transparent.

Users should understand why a quantity is recommended.

⸻

22. Request for Quotation

Purchase users may request prices from one or more suppliers.

Conceptual flow:

Purchase Requirement
↓
Create RFQ
↓
Select Suppliers
↓
Send
↓
Receive Supplier Quotes
↓
Compare

⸻

23. RFQ Information

Potential information:

* RFQ Number
* Date
* Response Due Date
* Products
* Quantities
* Specifications
* Delivery Location
* Required Delivery Date
* Commercial Requirements
* Notes
* Attachments

⸻

24. RFQ Supplier Selection

Users should be able to select:

* Preferred Supplier
* Previous Suppliers
* Multiple Suppliers
* Manually Selected Suppliers

The system may suggest suppliers but should not automatically choose one without approved rules.

⸻

25. RFQ Communication

RFQs may eventually be sent through:

* Email
* WhatsApp
* Downloaded Document

Communication should use shared communication infrastructure.

⸻

26. Supplier Quotation

Supplier quotation information may include:

* Supplier
* Supplier Quote Number
* Quote Date
* Valid Until
* Products
* Quantity
* Unit Price
* Discount
* Tax
* Freight
* Other Charges
* Delivery Timeline
* Payment Terms
* Warranty where applicable
* Notes
* Attachment

⸻

27. Supplier Quote Capture

Supplier quotes may arrive through:

* Email
* WhatsApp
* PDF
* Spreadsheet
* Phone
* Physical Document

Initially, users may manually record commercial information and attach the original document.

Future automation may extract information from documents.

⸻

28. Quotation Comparison

The system should make supplier comparison easy.

Example:

Product: Ceiling Fan Model X
                Supplier A   Supplier B   Supplier C
Unit Price       ₹2,450       ₹2,390       ₹2,520
Discount            5%           2%           8%
Freight           Free         ₹500          Free
Lead Time         3 Days       7 Days       2 Days
Payment          30 Days      Advance       45 Days

Do not compare only unit price.

Commercial decision-making may depend on multiple factors.

⸻

29. Landed Cost

Where applicable, supplier comparison should consider effective cost.

Potential components:

Product Cost
- Discount
+ Freight
+ Applicable Charges
= Effective Procurement Cost

Tax treatment should follow approved accounting rules.

Do not invent accounting treatment inside Purchase.

⸻

30. Historical Purchase Price

When selecting a supplier or creating a PO, authorized users should be able to see:

* Last Purchase Price
* Last Purchase Date
* Previous Supplier
* Recent Price Trend

This helps identify unexpected price changes.

⸻

31. Price Variance

Example:

Previous Price      ₹2,400
Current Price       ₹2,520
Variance              +5%

Significant price variance may require attention or approval.

Thresholds should be configurable.

⸻

32. Supplier Selection

Users should be able to select a supplier based on:

* Price
* Availability
* Lead Time
* Payment Terms
* Quality
* Reliability
* Brand Authorization
* Existing Agreement

Selection reason may be recorded for significant purchases.

⸻

33. Split Purchase

One requirement may be purchased from multiple suppliers.

Example:

Requirement: 1,000 Units
Supplier A: 600
Supplier B: 400

The system should support this without duplicating the original requirement.

⸻

34. Purchase Approval

Purchase approval may depend on:

* PO Value
* Price Variance
* Supplier
* Product
* Branch
* User Authority
* Exceptional Commercial Terms

Approval rules should be configurable.

⸻

35. Approval Hierarchy

Conceptually:

Purchase Executive
↓
Purchase Manager
↓
Branch Manager
↓
Management

Not every PO should require every level.

Approval should depend on configured rules.

⸻

36. Approval Context

Approvers should see:

* Supplier
* Products
* Quantities
* Purchase Value
* Previous Purchase Price
* Price Variance
* Alternative Quotes
* Stock Position
* Demand
* Expected Delivery
* Payment Terms
* Requester
* Reason

Approvers should be able to make a decision without navigating through many screens.

⸻

37. Approval History

Track:

* Requested By
* Requested At
* Approver
* Decision
* Decision Time
* Comments
* Commercial Values

Purchase approvals must be auditable.

⸻

38. Purchase Order

A Purchase Order represents an approved commercial commitment to a supplier.

Conceptual flow:

Approved Procurement
↓
Purchase Order
↓
Send to Supplier
↓
Supplier Confirmation
↓
Delivery

⸻

39. Purchase Order Creation

POs may be created from:

* Approved Requisition
* Supplier Quotation
* Procurement Plan
* Manual Requirement
* Reorder Requirement
* Sales Order Shortage

Existing information should be reused.

Do not force users to recreate product and supplier information.

⸻

40. Purchase Order Information

Potential information:

Header

* PO Number
* Supplier
* Supplier Contact
* Branch
* Warehouse
* Purchase Executive
* Order Date
* Expected Delivery

Items

* Product
* Supplier SKU
* Quantity
* Unit
* Unit Price
* Discount
* Tax
* Line Total

Commercial

* Subtotal
* Discount
* Freight
* Additional Charges
* Tax
* Grand Total

Terms

* Payment Terms
* Delivery Terms
* Delivery Location
* Warranty
* Notes
* Terms & Conditions

⸻

41. PO Numbering

Purchase Orders should use unique human-readable business numbers.

Example:

PO/HYD/2026-27/00124

Exact numbering should be configurable.

Do not use the PO number as the database primary key.

⸻

42. Purchase Order Status

Potential statuses:

* Draft
* Approval Pending
* Approved
* Sent
* Supplier Confirmed
* Partially Received
* Received
* Closed
* Cancelled

Avoid creating redundant statuses.

⸻

43. Draft Purchase Orders

Draft POs should:

* Be editable
* Autosave where practical
* Not affect incoming stock until the approved business point
* Not be treated as confirmed procurement

⸻

44. PO Calculations

Authoritative commercial calculations should occur on the backend.

Potential calculation:

Quantity × Unit Price
↓
Discount
↓
Taxable Value
↓
Tax
↓
Line Total

followed by:

Subtotal
- Discounts
+ Freight
+ Charges
+ Taxes
= Grand Total

Never rely solely on frontend arithmetic.

⸻

45. GST Readiness

Purchase architecture should support Indian GST requirements where applicable.

Potential information includes:

* Supplier GSTIN
* HSN/SAC
* Tax Rate
* CGST
* SGST
* IGST
* Place of Supply

Detailed accounting treatment belongs to Finance/Billing.

⸻

46. Supplier Schemes

Electrical distribution may involve supplier schemes such as:

* Quantity Discounts
* Promotional Discounts
* Buy X Get Y
* Seasonal Schemes
* Dealer Schemes
* Target-based Incentives

Initial implementation should support simple commercial adjustments.

Complex scheme accounting should only be implemented after clear business requirements are defined.

⸻

47. Free Quantity

Some supplier schemes may provide free products.

Example:

Purchase: 100 Units
Free:       5 Units

The system should distinguish:

* Purchased Quantity
* Free Quantity

Inventory receipt must still account for all physical units received.

⸻

48. Purchase Order PDF

The system should generate professional PO documents containing:

* Company Branding
* Supplier Information
* PO Number
* Products
* Quantities
* Pricing
* Taxes
* Delivery Address
* Payment Terms
* Delivery Terms
* Terms & Conditions
* Authorized Information

PDF generation should use shared document infrastructure.

⸻

49. PO Sharing

Purchase Orders may be sent through:

* Email
* WhatsApp
* Download

Communication should be recorded where integrations support it.

⸻

50. WhatsApp PO Communication

Potential flow:

Purchase Order
↓
Send
↓
WhatsApp
↓
Supplier Contact
↓
Approved Message
↓
Attach PO
↓
Send

Communication should use shared WhatsApp infrastructure.

⸻

51. Email PO Communication

Email may include:

* Supplier
* Subject
* Message
* PO Attachment
* Additional Documents

Communication history should be associated with the supplier and PO.

⸻

52. Supplier Confirmation

The supplier may confirm:

* Entire Order
* Partial Quantity
* Expected Delivery
* Revised Delivery
* Product Availability

Users should be able to record supplier confirmation.

⸻

53. Expected Delivery

Purchase should maintain expected delivery information.

This is important for:

* Warehouse
* Sales
* Inventory Planning
* Customer Commitments

Expected delivery should be updated when suppliers communicate changes.

⸻

54. Purchase Follow-up

Open POs should support follow-up.

Potential follow-up reasons:

* Order Confirmation
* Dispatch Status
* Delivery Date
* Pending Quantity
* Invoice
* Replacement
* Return

Follow-ups may use CRM-style activity infrastructure where appropriate.

⸻

55. Delayed Purchase Orders

A PO may become delayed when:

Expected Delivery Date
<
Today
AND
Pending Quantity > 0

Delayed POs should be visible to Purchase.

High-priority delays may also be visible to Sales or Management where relevant.

⸻

56. Goods Receipt Integration

When products arrive:

Purchase Order
↓
Inventory Goods Receipt
↓
GRN
↓
Stock Updated

Inventory owns physical receipt.

Purchase consumes receipt status.

⸻

57. Purchase Order Receipt Summary

Purchase should display:

Ordered        1,000
Received         700
Pending          300

without independently maintaining a second stock receipt truth.

Receipt quantities should come from Inventory.

⸻

58. Partial Receipt

A PO may be received through multiple deliveries.

Example:

PO Quantity        1,000
GRN 1                400
GRN 2                300
Received              700
Pending               300

The PO should remain open until completed or intentionally closed.

⸻

59. Over Receipt

If supplier delivers more than ordered:

Inventory should enforce configured tolerance/approval.

Purchase should reflect the resulting commercial discrepancy.

Do not silently increase the PO quantity.

⸻

60. Short Receipt

If the supplier delivers less than expected:

The system should preserve:

* Ordered Quantity
* Received Quantity
* Pending Quantity

Purchase users should decide whether to:

* Wait
* Follow Up
* Amend PO
* Close Remaining Quantity
* Purchase Elsewhere

⸻

61. PO Amendment

Approved POs may require changes.

Potential reasons:

* Quantity Change
* Price Change
* Delivery Date Change
* Product Change
* Commercial Terms Change

Important changes should create an amendment/version rather than silently rewriting historical commercial commitments.

⸻

62. PO Versioning

Example:

PO-00124
Version 1
↓
Supplier Negotiation
↓
Version 2

Users should know which version is current.

Previously communicated commercial information should remain traceable.

⸻

63. PO Cancellation

Cancellation should require:

* Permission
* Reason
* Audit History

Cancellation may be restricted when:

* Goods have already been received
* Supplier invoice has been processed
* Downstream transactions exist

Do not delete confirmed POs.

⸻

64. PO Closure

A PO may be closed when:

* Fully Received

or manually closed when:

* Remaining Quantity Cancelled
* Supplier Cannot Supply
* Requirement No Longer Exists

Manual closure should require a reason.

⸻

65. Supplier Invoice

Supplier invoices belong primarily to Finance/Accounts.

Purchase may capture or display:

* Supplier Invoice Number
* Invoice Date
* PO
* GRN
* Invoice Amount
* Attachment
* Processing Status

Financial posting remains outside Purchase.

⸻

66. Three-Way Matching Readiness

Architecture should support future matching between:

Purchase Order
↕
Goods Receipt
↕
Supplier Invoice

This allows the system to detect:

* Quantity Differences
* Price Differences
* Missing Receipt
* Missing PO
* Invoice Differences

Detailed financial matching rules belong to Finance/Accounts.

⸻

67. Purchase Return

Products may need to be returned to suppliers.

Potential reasons:

* Damaged
* Wrong Product
* Quality Issue
* Excess Supply
* Specification Mismatch
* Warranty
* Commercial Agreement

⸻

68. Purchase Return Workflow

Conceptually:

Received Stock
↓
Return Request
↓
Approval where required
↓
Inventory Stock-Out
↓
Supplier Return
↓
Finance Adjustment / Credit Note

Inventory owns physical stock movement.

Finance owns financial adjustment.

Purchase coordinates supplier-side return.

⸻

69. Supplier Credit Note

Supplier credit notes may relate to:

* Returns
* Pricing Difference
* Discounts
* Claims

Finance remains authoritative.

Purchase may display related status/reference.

⸻

70. Supplier Claims

Potential supplier claims include:

* Damage
* Short Supply
* Wrong Product
* Scheme Difference
* Price Difference
* Freight Difference

The system may track:

* Claim
* Supplier
* PO
* GRN
* Amount/Quantity
* Status
* Notes
* Resolution

This can be introduced when operationally required.

⸻

71. Supplier Performance

Supplier performance may eventually consider:

* On-time Delivery
* Fill Rate
* Price Competitiveness
* Quality Issues
* Return Rate
* Response Time
* Order Accuracy

Avoid opaque supplier scoring initially.

Start with transparent metrics.

⸻

72. On-Time Delivery

Conceptually:

Expected Delivery
vs
Actual Receipt

This helps identify supplier reliability.

Partial deliveries require appropriate handling.

⸻

73. Fill Rate

Example:

Ordered       1,000
Received        950
Fill Rate        95%

Final calculation methodology should be consistently defined.

⸻

74. Supplier Spend

Management may need:

* Total Purchase Value
* Purchase by Supplier
* Purchase by Brand
* Purchase by Category
* Purchase by Branch
* Purchase by Period

Detailed financial reporting may ultimately belong to Reports.

⸻

75. Purchase Price Trend

Authorized users may review:

Jan    ₹2,300
Feb    ₹2,350
Mar    ₹2,410
Apr    ₹2,390

Price trends can support negotiation and purchasing decisions.

⸻

76. Purchase Home

The Purchase home should answer:

What needs procurement attention today?

Potential areas:

Requirements

* New Requirements
* Low-stock Requirements
* Sales-order Shortages
* High-priority Requirements

Approvals

* Requisitions Pending
* POs Pending Approval

Purchase Orders

* Awaiting Supplier Confirmation
* Expected Today
* Delayed
* Partially Received

Attention

* Price Variance
* Supplier Delay
* Stock Shortage
* Purchase Return

⸻

77. Procurement Planning View

A useful planning view may contain:

Product
Available
Reserved
Incoming
Open Demand
Reorder Level
Suggested Purchase
Required Date

Users should be able to move from requirement to procurement quickly.

⸻

78. Purchase Requirement List

Useful columns:

* Requirement Number
* Product
* Required Quantity
* Source
* Warehouse
* Required Date
* Priority
* Status

Views:

* New
* High Priority
* Sales-driven
* Reorder
* Procurement Started
* Completed

⸻

79. Supplier List

Useful information:

* Supplier
* Supplier Type
* Brands
* Location
* Payment Terms
* Lead Time
* Status

Potential views:

* Active
* Preferred
* On Hold
* Blocked

⸻

80. Supplier Detail

Potential structure:

Header

* Supplier
* Status
* Type
* Primary Contact

Quick actions:

* Create RFQ
* Create PO
* Email
* WhatsApp

Overview

* Contact Information
* Commercial Terms
* Tax Information

Products

Products supplied.

Purchase History

Recent POs.

Pricing

Recent product prices.

Performance

Delivery and quality indicators.

Communication

Supplier activity timeline.

⸻

81. RFQ List

Useful information:

* RFQ Number
* Requirement
* Suppliers
* Response Due
* Status
* Owner

Views:

* Draft
* Sent
* Awaiting Response
* Responses Received
* Completed

⸻

82. RFQ Detail

Potential structure:

Header

* RFQ Number
* Date
* Due Date
* Status

Requirement

Products and quantities.

Suppliers

Selected suppliers and response status.

Responses

Supplier quotation summaries.

Comparison

Commercial comparison.

Activity

Communication and updates.

⸻

83. Supplier Comparison UX

Comparison should make differences immediately understandable.

Potential comparison dimensions:

* Unit Price
* Effective Price
* Discount
* Freight
* Payment Terms
* Lead Time
* Availability
* Previous Performance

Users should be able to select:

* Entire Supplier Quote

or where supported:

* Supplier by Product

⸻

84. Purchase Order List

Useful columns:

* PO Number
* Supplier
* Value
* Order Date
* Expected Delivery
* Received
* Pending
* Status
* Owner

Default views:

* My POs
* Approval Pending
* Approved
* Sent
* Expected Today
* Delayed
* Partially Received
* Completed

⸻

85. Purchase Order Detail

Potential structure:

Header

* PO Number
* Supplier
* Status
* Value
* Expected Delivery
* Owner

Actions:

* Send
* Download
* Follow Up
* Amend
* Cancel
* Close

Items

* Product
* Ordered
* Received
* Pending
* Price
* Total

Commercial

* Subtotal
* Discounts
* Freight
* Taxes
* Total

Delivery

* Warehouse
* Expected Date
* Receipt History

Documents

* Supplier Quote
* PO
* Supplier Invoice
* Other Attachments

Activity

* Created
* Approved
* Sent
* Confirmed
* Follow-ups
* Receipts
* Amendments

⸻

86. Purchase Order Builder UX

Purchase Order creation should be fast and clear.

Conceptual structure:

Supplier
────────────────────────
Products
────────────────────────
Product | Qty | Price | Discount | Tax | Total
Commercial Summary
────────────────────────
Subtotal
Discount
Freight
Tax
Total
Delivery
────────────────────────
Warehouse
Expected Date
Terms
────────────────────────
[Save Draft] [Preview] [Submit for Approval]

Secondary information should use progressive disclosure.

⸻

87. Product Search

Purchase users should be able to search by:

* Product Name
* SKU
* Brand
* Category
* Supplier SKU

Useful context may include:

* Available Stock
* Incoming
* Demand
* Last Purchase Price
* Preferred Supplier

⸻

88. Search

Purchase search should locate:

* Supplier
* Purchase Requirement
* RFQ
* Supplier Quote
* Purchase Order
* Supplier Invoice Reference

Searchable identifiers may include:

* Supplier Name
* PO Number
* RFQ Number
* Product
* Supplier Quote Number

⸻

89. Filters

Common filters:

* Supplier
* Branch
* Warehouse
* Purchase Executive
* Status
* Product
* Brand
* Category
* Date
* Expected Delivery
* Value Range

⸻

90. Saved Views

Potential views:

* My Requirements
* Urgent Procurement
* Awaiting Quotes
* Pending Approvals
* Open POs
* Delayed POs
* Partial Deliveries
* Purchase Returns

⸻

91. Bulk Actions

Potential safe bulk actions:

* Assign Purchase Executive
* Export
* Send Reminders where appropriate

Avoid bulk approval of significant commercial purchases without carefully designed controls.

⸻

92. Purchase Notifications

Useful notifications:

* New Purchase Requirement
* Requisition Approval Required
* Requisition Approved
* Requisition Rejected
* Supplier Quote Received
* PO Approval Required
* PO Approved
* PO Rejected
* Supplier Confirmation Pending
* Delivery Due
* Delivery Delayed
* Partial Receipt
* Purchase Return Pending

Notifications should be role-relevant.

⸻

93. Purchase Automation

Potential automation:

Low Stock

Inventory Reaches Reorder Threshold
↓
Create / Suggest Purchase Requirement
↓
Notify Purchase

Sales Shortage

Sales Order Shortage
↓
Purchase Requirement
↓
Priority Based on Required Date

PO Approved

PO Approved
↓
Mark Incoming Quantity
↓
Send / Prepare Supplier Communication

Delivery Due

Expected Delivery Approaching
↓
Check Pending Quantity
↓
Notify Purchase Executive

Delayed PO

Expected Date Passed
+
Pending Quantity > 0
↓
Flag Delayed
↓
Notify Owner

Automation should remain transparent.

⸻

94. Purchase Permissions

Potential permissions:

purchase.supplier.view
purchase.supplier.create
purchase.supplier.update
purchase.supplier.block
purchase.requirement.view
purchase.requirement.create
purchase.requirement.update
purchase.requisition.view
purchase.requisition.create
purchase.requisition.approve
purchase.rfq.view
purchase.rfq.create
purchase.rfq.send
purchase.quote.view
purchase.quote.create
purchase.order.view
purchase.order.create
purchase.order.update
purchase.order.approve
purchase.order.send
purchase.order.amend
purchase.order.cancel
purchase.order.close
purchase.return.view
purchase.return.create
purchase.cost.view
purchase.export

Exact naming should follow final RBAC conventions.

⸻

95. Data Visibility

Visibility may depend on:

* Organization
* Branch
* Warehouse
* Team
* Role
* Permission

Purchase Executives may see assigned procurement.

Branch Managers may see branch procurement.

Management may see organization-wide purchasing.

Backend must enforce these boundaries.

⸻

96. Commercial Data Security

Purchase pricing is sensitive business information.

Access to information such as:

* Purchase Cost
* Supplier Pricing
* Discounts
* Supplier Agreements
* Purchase Value

should be permission-controlled.

Sales users should not automatically gain full supplier commercial visibility merely because they can see product availability.

⸻

97. Transaction Safety

Critical operations should be transactional.

Examples:

Approve Purchase Order

should not result in partially updated commercial state.

Likewise:

Cancel Purchase Order

must correctly handle downstream dependencies.

⸻

98. Concurrent Changes

The system should handle scenarios such as:

* PO edited while approval is in progress
* Supplier price changed during review
* Requirement quantity changes
* Goods received while PO amendment is attempted

Critical commercial records should not be silently overwritten.

⸻

99. Historical Integrity

Do not silently rewrite:

* Approved Requisitions
* Supplier Quotations
* Approved POs
* Sent POs
* Receipt History

Use amendments, versions, reversals, or corrective workflows where appropriate.

⸻

100. Audit Requirements

Important events should be auditable:

* Supplier Created
* Supplier Blocked
* Requisition Submitted
* Requisition Approved
* RFQ Sent
* Supplier Quote Recorded
* Supplier Selected
* PO Created
* PO Approved
* PO Sent
* PO Amended
* PO Cancelled
* PO Closed
* Purchase Return Created

⸻

101. Import

Purchase may support import for:

* Suppliers
* Supplier Product Mapping
* Supplier Price Lists

Import should include:

* Mapping
* Validation
* Duplicate Detection
* Error Reporting
* Summary

Do not silently overwrite supplier pricing without appropriate controls.

⸻

102. Export

Authorized users may export:

* Suppliers
* Purchase Orders
* Purchase Requirements
* Purchase History
* Supplier Pricing
* Supplier Performance

Exports should respect permissions.

⸻

103. Inventory Integration

Inventory provides:

* On Hand
* Reserved
* Available
* Incoming
* Reorder Status
* Consumption

Purchase provides:

* Approved Incoming Orders
* Expected Delivery

Inventory owns:

* Goods Receipt
* Physical Stock
* Stock Movement
* Purchase Return Stock-Out

⸻

104. Sales Integration

Sales may generate procurement demand when stock is insufficient.

Example:

Sales Order
↓
Stock Shortage
↓
Purchase Requirement

Purchase should preserve the source relationship where applicable.

Sales may see expected availability without accessing sensitive supplier pricing.

⸻

105. Product Integration

Product Management owns:

* Product
* SKU
* Brand
* Category
* Specification
* Unit

Purchase owns supplier relationships and procurement commercial information for those products.

⸻

106. Billing / Finance Integration

Finance may consume:

* Purchase Order
* Goods Receipt
* Supplier Invoice
* Commercial Terms

Purchase may consume:

* Invoice Processing Status
* Payment Status where useful

Finance remains authoritative for payments and accounting.

⸻

107. Communication Integration

Purchase should use shared infrastructure for:

* RFQ Email
* RFQ WhatsApp
* PO Email
* PO WhatsApp
* Supplier Follow-up
* Delivery Reminder
* Return Communication

Do not implement separate communication providers inside Purchase.

⸻

108. Document Management

Purchase documents may include:

* Supplier Quotation
* RFQ
* Purchase Order
* Supplier Confirmation
* Delivery Challan
* Supplier Invoice
* Product Documents
* Return Documents

Documents should use shared storage infrastructure.

⸻

109. Mobile Purchase Experience

Future mobile Purchase should prioritize:

* Requirements
* Approvals
* Suppliers
* Purchase Orders
* Follow-ups

Complex quotation comparison and procurement planning may remain desktop-oriented.

⸻

110. Mobile Approval

Managers should eventually be able to review:

* Supplier
* Products
* Quantity
* Value
* Previous Price
* Variance
* Stock Position
* Reason

then:

Approve
Reject
Request Change

without opening a desktop application.

⸻

111. AI Opportunities

Future AI may assist with:

* Purchase Quantity Suggestions
* Supplier Suggestions
* Price Anomaly Detection
* Supplier Quote Extraction
* Supplier Quote Comparison
* PO Drafting
* Demand Forecasting
* Delay Prediction
* Supplier Performance Summary

AI should recommend.

It should not autonomously commit commercial purchases without explicit approved workflows.

⸻

112. Supplier Quote Extraction

Future AI/document processing may support:

Supplier PDF / Image
↓
Extract
↓
Products
Quantities
Prices
Discounts
Taxes
Delivery
Payment Terms
↓
User Review
↓
Save Supplier Quote

Human verification should occur before extracted commercial data becomes authoritative.

⸻

113. Empty States

Examples:

No Purchase Requirements

Communicate that no current procurement requirements exist.

No Suppliers

Actions:

* Add Supplier
* Import Suppliers

No Purchase Orders

Action:

* Create Purchase Order

Avoid unnecessary decorative empty-state content.

⸻

114. Error States

Handle:

* Supplier Inactive
* Supplier Blocked
* Invalid Price
* Product Unavailable from Supplier
* Approval Required
* Approval Rejected
* Duplicate PO Processing
* Invalid Quantity
* PO Already Received
* PO Cannot Be Cancelled
* Concurrent Modification
* Communication Failure
* Permission Denied

Errors should tell users what they can do next.

⸻

115. Purchase UX Principles

Purchase UX should prioritize:

* Demand Visibility
* Price Transparency
* Fast Supplier Comparison
* Commercial Control
* Clear Approval
* Delivery Visibility
* Minimal Duplicate Entry
* Traceability

Purchase users should not need spreadsheets beside the application to understand what needs to be ordered.

⸻

116. Procurement Decision Principle

For every significant procurement decision, users should quickly understand:

What do we need?
Why do we need it?
How much do we already have?
How much is already incoming?
How much should we purchase?
Who can supply it?
At what price?
When can they deliver?
What are the commercial terms?

⸻

117. Purchase Success Metrics

Potential product metrics:

* Purchase Order Value
* Purchase Cycle Time
* Supplier Lead Time
* On-time Delivery
* Supplier Fill Rate
* Purchase Price Variance
* Emergency Purchase Rate
* Requisition-to-PO Time
* Open PO Value
* Delayed PO Rate
* Supplier Return Rate
* Procurement Savings where reliably measurable

⸻

118. Initial Purchase Release Priorities

Recommended implementation order:

Purchase Foundation

* Suppliers
* Supplier Contacts
* Supplier Product Mapping
* Purchase Requirements

Procurement Planning

* Inventory Demand Integration
* Sales Shortage Integration
* Requirement Consolidation
* Purchase Requisition

Supplier Sourcing

* RFQ
* Supplier Quotations
* Quote Comparison
* Supplier Selection

Purchase Orders

* PO Builder
* Calculations
* Approval
* PDF
* Send

Delivery Tracking

* Supplier Confirmation
* Expected Delivery
* Partial Delivery
* Pending Quantities
* Inventory GRN Integration

Purchase Control

* PO Amendments
* Cancellation
* Closure
* Purchase Returns

Procurement Intelligence

* Supplier Performance
* Price Trends
* Reorder Suggestions
* Purchase Analytics
* AI Assistance

This order should be reconciled with the approved overall development roadmap.

⸻

119. Purchase Screen Inventory

Likely screens/views include:

* Purchase Home
* Procurement Planning
* Purchase Requirements
* Requirement Detail
* Purchase Requisitions
* Requisition Detail
* Supplier List
* Supplier Detail
* Add/Edit Supplier
* RFQ List
* Create RFQ
* RFQ Detail
* Supplier Quote Entry
* Supplier Quote Comparison
* Purchase Order List
* Purchase Order Builder
* Purchase Order Preview
* Purchase Order Detail
* Purchase Approval Queue
* Purchase Approval Detail
* Purchase Returns
* Supplier Performance
* Purchase Reports

This is a screen inventory, not an instruction to build all screens immediately.

⸻

120. Purchase Home Information Architecture

Potential structure:

Attention Required

* Urgent Requirements
* Pending Approvals
* Delayed Purchase Orders
* Price Variances

Procurement

* New Requirements
* RFQs Awaiting Response
* Supplier Quotes Received

Purchase Orders

* Open
* Expected Today
* Partially Received
* Delayed

Recent Activity

* Recently Approved
* Recently Sent
* Recently Received

The screen should prioritize action rather than generic charts.

⸻

121. Supplier Detail Information Architecture

Potential structure:

Header

* Supplier
* Status
* Supplier Type
* Primary Contact

Actions:

* RFQ
* Create PO
* WhatsApp
* Email

Overview

* Business Information
* Tax Information
* Commercial Terms

Products

* Products Supplied
* Recent Prices
* Lead Times

Purchase History

* POs
* Purchase Value

Performance

* Delivery
* Fill Rate
* Returns

Communication

* Email
* WhatsApp
* Notes
* Follow-ups

⸻

122. Purchase Order Detail Information Architecture

Potential structure:

Header

* PO Number
* Supplier
* Status
* Value
* Expected Delivery

Actions based on state:

* Submit
* Approve
* Send
* Follow Up
* Amend
* Cancel
* Close

Items

* Product
* Ordered
* Received
* Pending
* Unit Price
* Total

Commercial

* Discounts
* Freight
* Taxes
* Total

Delivery

* Warehouse
* Expected Delivery
* Receipt History

Documents

* Supplier Quote
* PO
* Supplier Invoice
* Other Files

Activity

Complete procurement timeline.

⸻

123. Purchase Design Requirements

Before designing Purchase screens, Claude must:

1. Read PROJECT.md.
2. Read SALES.md.
3. Read INVENTORY.md.
4. Read PURCHASE.md.
5. Review approved design-system documentation.
6. Understand the procurement workflow being designed.
7. Identify commercial calculations.
8. Identify permissions.
9. Identify approvals.
10. Identify supplier communication requirements.
11. Identify inventory dependencies.
12. Identify states and edge cases.
13. Avoid introducing functionality outside approved scope.

⸻

124. Purchase Development Requirements

Before implementing Purchase functionality, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read SALES.md.
5. Read INVENTORY.md.
6. Read PURCHASE.md.
7. Inspect existing implementation.
8. Identify authoritative product and inventory sources.
9. Identify database requirements.
10. Identify commercial calculations.
11. Identify approval requirements.
12. Identify permissions.
13. Identify audit requirements.
14. Identify API requirements.
15. Identify communication dependencies.
16. Define tests.
17. Implement only approved scope.
18. Verify before reporting completion.

⸻

125. Cross-Module Ownership

Product Management Owns

* Product Master
* SKU
* Brand
* Category
* Specifications
* Units

Purchase Owns

* Suppliers
* Supplier Contacts
* Supplier Product Relationships
* Purchase Requirements
* Requisitions
* RFQs
* Supplier Quotations
* Supplier Selection
* Purchase Orders
* Procurement Commercial Terms
* Procurement Follow-ups
* Supplier Performance

Inventory Owns

* Physical Stock
* Goods Receipt
* Stock Movements
* Warehouses
* Stock Transfers
* Physical Purchase Returns

Sales Owns

* Opportunities
* Customer Quotations
* Sales Orders
* Customer Commercial Terms

Finance / Billing Owns

* Supplier Invoices
* Supplier Payments
* Credit Notes
* Accounting
* Financial Ledger

Purchase may consume and provide information across these modules but must not duplicate their authoritative business logic.

⸻

126. Critical Purchase Principle

For every open Purchase Order, the system should make these questions easy to answer:

What did we order?
Why did we order it?
Who did we order from?
How much did we order?
At what price?
When should it arrive?
How much has arrived?
How much is still pending?
Who is responsible for following up?

If users need spreadsheets or WhatsApp history to answer these questions, the procurement workflow is incomplete.

⸻

127. Demand Principle

Purchasing should be connected to actual business demand.

The system should help Purchase understand:

Current Stock
+
Incoming Stock
-
Reserved / Expected Demand
+
Reorder Requirement

before deciding what to purchase.

The application should not blindly create Purchase Orders from every low-stock signal.

⸻

128. Supplier Selection Principle

The cheapest supplier is not automatically the best supplier.

Supplier selection may consider:

Price
+
Availability
+
Delivery Time
+
Payment Terms
+
Reliability
+
Quality

The system should present these factors clearly while leaving final commercial decisions to authorized users.

⸻

129. Purchase Order Principle

A confirmed Purchase Order is a commercial commitment.

It must therefore be:

* Accurate
* Traceable
* Version-controlled where required
* Permission-controlled
* Auditable
* Connected to its requirement
* Connected to its supplier
* Connected to goods receipts
* Connected to downstream financial processing

Confirmed POs should never behave like disposable editable drafts.

⸻

130. Final Purchase Principle

The Purchase module should create a controlled path from demand to procurement:

Identify Demand
↓
Understand Stock Position
↓
Find Suppliers
↓
Compare Commercial Options
↓
Approve
↓
Order
↓
Follow Up
↓
Receive
↓
Reconcile

The application succeeds when the Purchase team can answer:

What needs to be purchased, from whom, for how much, why, and by when?

without depending on disconnected spreadsheets, personal WhatsApp conversations, paper records, or manual follow-up lists.
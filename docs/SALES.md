SALES.md

Electrical Distribution CRM — Sales Module Specification

Version: 1.0
Status: Product Definition
Module: Sales
Parent Document: PROJECT.md
Related Module: CRM.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The Sales module manages the commercial journey from a qualified customer requirement through quotation, negotiation, approval, order confirmation, and handoff to fulfilment and billing.

The module should help the business answer:

* What sales opportunities are currently active?
* What is their expected value?
* Which quotations are pending?
* Which quotations require follow-up?
* Which quotations require approval?
* What discounts are being offered?
* Which opportunities are likely to close?
* Which quotations converted into orders?
* Why are opportunities being lost?
* What orders have been confirmed?
* What is the expected sales pipeline?
* How is each salesperson performing against target?
* What requires action today?

The Sales module should make selling faster while maintaining commercial control.

⸻

2. Sales Product Goal

The primary goal is:

Convert qualified customer requirements into profitable orders with minimum operational friction while maintaining pricing, discount, approval, and commercial discipline.

Salespeople should be able to move from:

Customer Requirement
↓
Opportunity
↓
Quotation
↓
Negotiation
↓
Approval
↓
Customer Confirmation
↓
Sales Order
↓
Fulfilment / Billing

without repeatedly entering the same information.

⸻

3. Sales Scope

The Sales module includes:

* Opportunities
* Sales Pipeline
* Customer Requirements
* Product Selection
* Price Lists
* Customer Pricing
* Quotations
* Quotation Versions
* Discounts
* Discount Approval
* Commercial Approval
* Negotiation Tracking
* Sales Orders
* Order Confirmation
* Sales Targets
* Sales Forecasting
* Sales Performance
* Sales Follow-ups
* Lost Opportunities
* Sales Analytics
* Sales Notifications
* Sales Automation

⸻

4. Out of Scope

The Sales module does not own:

* Lead Capture
* Lead Assignment
* General CRM Activities
* Product Master
* Inventory Movement
* Purchase Orders
* Invoice Accounting
* Payment Reconciliation
* GST Accounting
* Warehouse Operations
* Delivery Logistics
* Customer Support

These belong to their respective modules.

Sales may consume or display information from those modules.

⸻

5. Module Relationships

Conceptually:

CRM
↓
Qualified Requirement
↓
SALES
↓
Opportunity
↓
Quotation
↓
Sales Order
↓
───────────────
↓             ↓
Inventory    Billing
↓             ↓
Fulfilment   Invoice

Product information comes from:

Product Management

Stock information comes from:

Inventory

Customer information comes from:

CRM

Sales should reference these sources rather than duplicate them.

⸻

6. Primary Users

Sales Executive

Needs to:

* Create opportunities
* Understand customer requirements
* Select products
* Check pricing
* Check stock availability
* Prepare quotations
* Apply permitted discounts
* Send quotations
* Follow up
* Revise quotations
* Confirm orders
* Track sales progress

⸻

Field Sales Executive

Needs lightweight workflows for:

* Customer requirements
* Product search
* Price lookup
* Stock visibility
* Quotation creation
* Quotation sharing
* Follow-up
* Order confirmation

Future mobile experience should optimize these workflows.

⸻

Sales Manager

Needs to:

* View team pipeline
* Review opportunities
* Approve discounts
* Review quotations
* Monitor ageing
* Monitor conversion
* Track targets
* Forecast sales
* Identify stalled opportunities
* Review lost opportunities

⸻

Branch Manager

Needs:

* Branch sales pipeline
* Branch targets
* Branch orders
* Approvals
* Team performance
* Forecasting

⸻

Management

Needs:

* Organization-wide sales
* Pipeline value
* Forecast
* Conversion
* Revenue trends
* Product performance
* Branch performance
* Salesperson performance
* Discount trends
* Lost sales analysis

⸻

Billing Team

Needs confirmed commercial information required to generate invoices.

Billing should consume approved sales-order data rather than manually reconstructing the sale.

⸻

Warehouse / Operations

Needs confirmed order information required for fulfilment.

⸻

7. Sales Domain Model

Important concepts should remain distinct.

Opportunity

Represents a qualified potential sale.

An opportunity answers:

What commercial business are we trying to win?

⸻

Quotation

A formal commercial proposal sent to the customer.

An opportunity may have multiple quotation versions.

⸻

Sales Order

A confirmed customer order based on accepted commercial terms.

⸻

Price List

Defines standard pricing for products for a specific context.

⸻

Discount

A reduction from applicable pricing.

Discount permissions and approvals should be controlled.

⸻

Sales Target

A measurable sales objective assigned to:

* Organization
* Branch
* Team
* Territory
* Salesperson

⸻

8. Opportunity Lifecycle

A practical default lifecycle:

New Opportunity
↓
Requirement Identified
↓
Quotation Preparation
↓
Quotation Sent
↓
Negotiation
↓
Decision Pending
↓
Won

Alternative outcome:

Lost

Stages should eventually be configurable.

Avoid excessive stages that salespeople cannot distinguish meaningfully.

⸻

9. Opportunity Creation

Opportunities may originate from:

* Converted Lead
* Existing Customer
* Dealer Requirement
* Customer Visit
* Incoming Enquiry
* Repeat Order
* Project Requirement
* Manual Creation
* Future Integration

When originating from CRM, reuse existing information.

Do not require users to re-enter:

* Customer
* Contact
* Owner
* Territory
* Requirement information

when already available.

⸻

10. Opportunity Information

Potential information includes:

Basic

* Opportunity ID
* Name
* Customer
* Contact
* Owner
* Branch
* Territory
* Stage
* Priority

Commercial

* Estimated Value
* Expected Close Date
* Probability
* Product Categories
* Products
* Requirement Summary
* Quantity
* Customer Budget where known

Context

* Lead Source
* Competitors
* Current Supplier
* Customer Requirements
* Delivery Expectations
* Payment Expectations
* Notes

System

* Created At
* Updated At
* Created By
* Won At
* Lost At

⸻

11. Opportunity Naming

Names should remain human-readable.

Example:

ABC Electricals — Fan Requirement — Aug 2026

Avoid exposing meaningless system identifiers as the primary title.

⸻

12. Opportunity Value

Opportunity value may initially be:

* Estimated manually
* Calculated from quotation
* Updated when quotation changes

Once a valid quotation exists, the system should prefer reliable quotation-derived values where appropriate.

⸻

13. Expected Close Date

Users should be encouraged to maintain realistic expected close dates.

Overdue expected close dates should be visible.

Do not silently change dates merely to make forecasting appear healthier.

⸻

14. Sales Probability

Probability may initially be based on pipeline stage.

Example conceptually:

Requirement Identified   → Low
Quotation Sent           → Medium
Negotiation              → Higher
Decision Pending         → High

Exact percentages should be configurable if used.

Salespeople should not spend unnecessary time adjusting probability manually unless it provides business value.

⸻

15. Sales Pipeline

Provide pipeline views such as:

* My Pipeline
* Team Pipeline
* Branch Pipeline
* Territory Pipeline
* Organization Pipeline

Pipeline should show:

* Opportunity
* Customer
* Value
* Stage
* Owner
* Expected Close
* Last Activity
* Next Action

⸻

16. Pipeline Metrics

Useful metrics include:

* Total Pipeline Value
* Weighted Pipeline
* Opportunities
* Average Deal Size
* Expected Closures
* Won Value
* Lost Value
* Conversion Rate

Avoid filling the pipeline with vanity metrics.

⸻

17. Sales Ageing

Track:

* Opportunity Age
* Days in Current Stage
* Days Since Last Activity
* Days Since Quotation
* Days Since Customer Response

This should help identify stalled opportunities.

⸻

18. Customer Requirement

Before quotation, capture enough information to understand what the customer actually needs.

Potential requirement information:

* Product
* Category
* Brand
* Specification
* Quantity
* Application
* Target Price
* Required Delivery Date
* Delivery Location
* Special Requirement

Do not force unnecessary information before a salesperson can proceed.

⸻

19. Product Selection

Salespeople should be able to search products by:

* Product Name
* SKU
* Brand
* Category
* Specification

Product selection should display relevant information such as:

* Product
* Variant
* SKU
* Unit
* Applicable Price
* Stock Availability where permitted

⸻

20. Stock Visibility

Sales users may need stock visibility while preparing quotations.

Possible statuses:

* In Stock
* Limited Stock
* Out of Stock
* Incoming
* Check Availability

Exact stock quantities may be permission-controlled.

Sales must not own stock calculations.

Inventory remains authoritative.

⸻

21. Pricing

Pricing may depend on:

* Standard Price
* Dealer Price
* Distributor Price
* Customer-specific Price
* Territory Price
* Promotional Scheme
* Quantity
* Effective Date

Pricing logic should remain centralized and auditable.

Do not hardcode prices into quotations.

⸻

22. Price Lists

Price lists may contain:

* Name
* Customer Type
* Effective From
* Effective Until
* Products
* Base Price
* Tax Treatment
* Status

Historical quotations should retain the commercial values used when created.

A later price-list change must not silently alter an already issued quotation.

⸻

23. Customer-Specific Pricing

Selected customers may have negotiated pricing.

The system should support customer-specific pricing where approved.

Salespeople should clearly understand:

* Standard Price
* Applicable Price
* Requested Price
* Approved Price

without exposing unnecessary internal complexity.

⸻

24. Quotation Purpose

Quotation creation should be one of the fastest and most polished workflows in the application.

A salesperson should be able to:

Select Customer
↓
Add Products
↓
Enter Quantity
↓
Apply Applicable Pricing
↓
Adjust Permitted Discount
↓
Review Commercial Summary
↓
Send

The system should handle calculations automatically.

⸻

25. Quotation Creation

Quotation creation may start from:

* Opportunity
* Customer
* Existing Quotation
* Repeat Order
* Manual Create

When created from an opportunity, reuse existing information.

⸻

26. Quotation Information

Potential quotation information:

Header

* Quotation Number
* Customer
* Contact
* Opportunity
* Salesperson
* Branch
* Date
* Valid Until

Items

* Product
* SKU
* Description
* Quantity
* Unit
* Unit Price
* Discount
* Tax
* Line Total

Commercial

* Subtotal
* Discount
* Tax
* Freight where applicable
* Additional Charges where applicable
* Grand Total
* Currency

Terms

* Payment Terms
* Delivery Terms
* Delivery Timeline
* Validity
* Warranty
* Notes
* Terms & Conditions

⸻

27. Quotation Numbering

Quotation numbers should be unique and human-readable.

Numbering may eventually depend on:

* Organization
* Branch
* Financial Year

Example conceptually:

QT/HYD/2026-27/00125

Exact numbering should be configurable.

Never use quotation numbers as database primary identifiers.

⸻

28. Quotation Status

Practical statuses may include:

* Draft
* Approval Pending
* Approved
* Sent
* Viewed where technically available
* Negotiation
* Accepted
* Rejected
* Expired
* Cancelled

Avoid unnecessary overlapping statuses.

⸻

29. Draft Quotations

Drafts should:

* Autosave where practical
* Be editable
* Not be considered formally issued
* Not appear as confirmed business

Users should be able to leave and resume quotation preparation.

⸻

30. Quotation Calculations

Authoritative calculations should occur on the backend.

Calculations may include:

Quantity × Unit Price
↓
Line Discount
↓
Taxable Value
↓
Tax
↓
Line Total

then:

Subtotal
↓
Applicable Discounts / Charges
↓
Taxes
↓
Grand Total

Never rely exclusively on frontend arithmetic for commercial values.

⸻

31. Money Handling

Do not use floating-point arithmetic for authoritative financial calculations.

Use appropriate decimal handling.

Always consider:

* Currency
* Quantity
* Unit Price
* Discount
* Tax
* Rounding

⸻

32. GST Readiness

The product is expected to operate initially in India.

Sales architecture should therefore support GST-related commercial information where applicable.

Potential concepts include:

* GSTIN
* HSN/SAC
* CGST
* SGST
* IGST
* Tax Rate
* Place of Supply

Detailed tax/accounting rules belong to Billing/Accounting.

Quotation should consume appropriate tax configuration rather than independently invent accounting logic.

⸻

33. Discounts

Discounts may exist at:

* Product Line
* Quotation
* Customer Agreement
* Scheme

Avoid stacking discounts unpredictably.

The system should clearly show how final price was determined.

⸻

34. Discount Permissions

Different users may have different discount authority.

Example conceptually:

Sales Executive
→ Up to configured threshold
Sales Manager
→ Higher threshold
Branch Manager
→ Higher threshold
Management
→ Exceptional approval

Do not hardcode exact percentages unless approved by the business.

⸻

35. Discount Approval

When a discount exceeds the user’s authority:

Salesperson Requests Discount
↓
Quotation Becomes Approval Pending
↓
Approver Reviews
↓
Approve / Reject / Request Change
↓
Salesperson Continues

Approval should not require rebuilding the quotation.

⸻

36. Approval Context

Approvers should see enough information to make a decision:

* Customer
* Opportunity
* Quotation Value
* Standard Price
* Requested Discount
* Final Price
* Margin where authorized
* Salesperson
* Reason
* Previous Customer Business where useful

Approval should be possible without navigating through many screens.

⸻

37. Approval History

Track:

* Requested By
* Requested At
* Approver
* Decision
* Decision Time
* Comments
* Previous Values
* Approved Values

Commercial approvals should be auditable.

⸻

38. Margin Visibility

Margin information may be commercially sensitive.

Only authorized roles should see:

* Cost Price
* Margin
* Margin Percentage

Salespeople may see only the information required for their role.

⸻

39. Quotation Versioning

When a sent quotation requires commercial revision, preserve history.

Example:

QT-00125
├── Version 1
├── Version 2
└── Version 3

Do not overwrite previously issued commercial values.

Users should know which version is current.

⸻

40. Quotation Revision

Common reasons:

* Price Negotiation
* Quantity Change
* Product Change
* Delivery Change
* Payment Terms
* Discount Change

A revision should reuse the previous quotation rather than requiring complete recreation.

⸻

41. Quotation PDF

Users should be able to generate a professional quotation document.

Potential content:

* Company Branding
* Customer Information
* Quotation Number
* Products
* Pricing
* Taxes
* Commercial Terms
* Validity
* Salesperson Contact
* Terms & Conditions

PDF generation should occur through shared document infrastructure.

⸻

42. Quotation Sharing

Supported channels should eventually include:

* WhatsApp
* Email
* Download
* Copy Secure Link where appropriate

Communication should use shared communication infrastructure.

⸻

43. WhatsApp Quotation Sharing

Conceptual flow:

Quotation
↓
Send
↓
WhatsApp
↓
Select Contact
↓
Select / Edit Approved Template
↓
Attach Quotation
↓
Send
↓
Record Communication

Users should not need to download the PDF and manually locate the customer’s number where integration exists.

⸻

44. Email Quotation Sharing

Email may include:

* Customer
* Subject
* Message
* Quotation Attachment
* Additional Attachments

Sent communication should be associated with the quotation and customer where supported.

⸻

45. Quotation Follow-up

After sending a quotation, the system should encourage a next action.

Example:

Quotation Sent
↓
Schedule Follow-up

Potential follow-up:

* Tomorrow
* In 2 Days
* Next Week
* Custom Date

Do not hardcode one follow-up interval.

⸻

46. Negotiation

Negotiation should be tracked without becoming a complex contract-management system.

Users may record:

* Customer Request
* Requested Price
* Requested Discount
* Requested Terms
* Competitor Information
* Notes
* Next Action

⸻

47. Customer Acceptance

Acceptance may be recorded through:

* Manual Confirmation
* Customer PO
* Signed Document
* Email Confirmation
* Future Digital Acceptance

The system should preserve evidence/reference where appropriate.

⸻

48. Customer Purchase Order

For B2B customers, an accepted quotation may be followed by a customer PO.

Sales should support:

* Customer PO Number
* PO Date
* PO Document
* PO Value
* Related Quotation

Do not confuse customer PO with the company’s Purchase Order to suppliers.

⸻

49. Sales Order Creation

Once commercial terms are confirmed:

Accepted Quotation
↓
Create Sales Order
↓
Validate Customer
↓
Validate Items
↓
Validate Commercial Terms
↓
Confirm Order

Avoid re-entering quotation data.

⸻

50. Sales Order Information

Potential information:

Header

* Sales Order Number
* Customer
* Contact
* Opportunity
* Quotation
* Customer PO
* Salesperson
* Branch

Items

* Product
* Quantity
* Unit Price
* Discount
* Tax
* Total

Fulfilment

* Delivery Address
* Required Date
* Delivery Instructions
* Warehouse where determined

Commercial

* Payment Terms
* Credit Terms
* Order Total

⸻

51. Sales Order Status

Possible statuses:

* Draft
* Confirmation Pending
* Confirmed
* Processing
* Partially Fulfilled
* Fulfilled
* Cancelled

Detailed warehouse fulfilment states belong to Inventory/Operations.

⸻

52. Sales Order Numbering

Sales orders should use configurable business numbering.

Example conceptually:

SO/HYD/2026-27/00421

Do not use the business number as the database identifier.

⸻

53. Order Validation

Before confirming an order, validate relevant business conditions.

Potential checks:

* Customer Status
* Products
* Quantities
* Pricing
* Approval
* Credit Status
* Stock Availability
* Required Date
* Delivery Address

Not every warning should block the order.

Differentiate:

* Blocking Error
* Warning
* Information

⸻

54. Credit Check

Customers may eventually have:

* Credit Limit
* Current Outstanding
* Available Credit
* Payment Terms

If an order exceeds permitted credit conditions:

Order
↓
Credit Warning
↓
Approval if Required

Credit rules belong jointly with Finance/Billing configuration.

Sales should consume the result rather than duplicate accounting logic.

⸻

55. Stock Check

At order confirmation, the system may check:

* Available Stock
* Reserved Stock
* Incoming Stock
* Shortage

Inventory remains authoritative.

Sales should not directly modify stock quantities.

⸻

56. Partial Availability

If only part of an order is available:

Potential options may include:

* Partial Fulfilment
* Wait for Complete Stock
* Substitute Product
* Backorder

Exact behavior requires business approval.

⸻

57. Order Handoff

After confirmation:

Sales Order
↓
Inventory / Fulfilment
↓
Billing

Sales should be able to see downstream status without owning downstream processing.

⸻

58. Order Cancellation

Cancellation should require:

* Permission
* Reason
* Audit History

Cancellation may be restricted after fulfilment or invoicing has started.

Do not simply delete confirmed sales orders.

⸻

59. Repeat Orders

Electrical distribution businesses frequently receive repeat orders.

The CRM should make repeat ordering easy.

Potential action:

Previous Order
↓
Repeat Order
↓
Review Current Price & Availability
↓
Adjust Quantities
↓
Confirm

Never blindly reuse historical price without current pricing validation.

⸻

60. Sales Targets

Targets may be defined by:

* Organization
* Branch
* Team
* Territory
* Salesperson

Periods may include:

* Monthly
* Quarterly
* Annual

Potential target dimensions:

* Revenue
* Order Value
* Product Category
* Brand
* Customer Acquisition

Start simple.

⸻

61. Target vs Achievement

Users should be able to understand:

Target
Actual
Remaining
Achievement %
Time Remaining

Do not overwhelm salespeople with excessive charts.

⸻

62. Sales Forecast

Forecast should help answer:

What business are we reasonably expecting to close?

Potential inputs:

* Pipeline Stage
* Opportunity Value
* Probability
* Expected Close Date
* Historical Conversion

Initial forecasting should remain transparent.

Do not introduce opaque AI forecasting before sufficient historical data exists.

⸻

63. Forecast Categories

Possible categories:

* Pipeline
* Best Case
* Commit
* Closed

These should only be introduced if the business understands and uses them.

Otherwise use a simpler forecast model.

⸻

64. Won Opportunity

When an opportunity is won:

* Record Won Date
* Record Final Value
* Associate Accepted Quotation
* Associate Sales Order
* Preserve Timeline

Do not lose the original opportunity history.

⸻

65. Lost Opportunity

When an opportunity is lost, capture a reason.

Potential reasons:

* Price
* Competitor
* Product Unavailable
* Delivery Timeline
* Payment Terms
* Credit Terms
* Customer Postponed
* Requirement Cancelled
* No Response
* Other

Reasons should eventually be configurable.

⸻

66. Competitor Tracking

For meaningful lost opportunities, users may record:

* Competitor
* Competitor Brand
* Competitor Price where known
* Reason Selected

Avoid forcing competitor information for every lost opportunity.

⸻

67. Sales Activities

Sales-related activities should use CRM activity infrastructure where appropriate.

Examples:

* Quotation Sent
* Quotation Viewed
* Follow-up
* Negotiation
* Discount Requested
* Discount Approved
* Customer PO Received
* Order Confirmed

These should appear in relevant timelines.

⸻

68. Sales Notifications

Useful notifications may include:

* Quotation Approval Required
* Discount Approved
* Discount Rejected
* Quotation Expiring
* Quotation Follow-up Due
* Opportunity Stale
* Customer PO Received
* Order Confirmed
* Order Blocked
* Credit Approval Required

Avoid notifying users about every minor update.

⸻

69. Sales Automation

Potential automation:

Quotation Sent

Quotation Sent
↓
Update Opportunity
↓
Record Communication
↓
Schedule Follow-up

Quotation Expiring

Quotation Near Expiry
↓
Notify Owner
↓
Suggest Follow-up

Opportunity Inactive

No Activity
↓
Notify Salesperson
↓
Escalate Based on Rules

Quotation Accepted

Quotation Accepted
↓
Update Opportunity
↓
Create / Suggest Sales Order
↓
Notify Relevant Team

Automation should remain understandable and configurable.

⸻

70. Sales Permissions

Potential permissions:

sales.opportunity.view
sales.opportunity.create
sales.opportunity.update
sales.opportunity.assign
sales.quotation.view
sales.quotation.create
sales.quotation.update
sales.quotation.send
sales.quotation.approve
sales.discount.request
sales.discount.approve
sales.order.view
sales.order.create
sales.order.confirm
sales.order.cancel
sales.target.view
sales.target.manage
sales.export

Exact naming should follow the final RBAC convention.

⸻

71. Data Visibility

Visibility may depend on:

* Organization
* Branch
* Team
* Territory
* Ownership
* Permission

Sales Executive may primarily see own opportunities.

Sales Manager may see team opportunities.

Branch Manager may see branch sales.

Management may see organization-wide sales.

Backend must enforce these boundaries.

⸻

72. Sales Home

Sales home should answer:

What needs sales attention today?

Potential areas:

My Pipeline

* Active Opportunities
* Expected Closures
* Pipeline Value

Quotations

* Draft
* Approval Pending
* Follow-up Due
* Expiring

Orders

* Recently Confirmed
* Blocked
* Awaiting Processing

Targets

* Target
* Achievement
* Remaining

Attention

* Stale Opportunities
* High-value Opportunities
* Overdue Follow-ups

⸻

73. Opportunity Detail

Potential information architecture:

Header

* Opportunity
* Customer
* Stage
* Value
* Owner
* Expected Close

Actions:

* Create Quotation
* Add Activity
* Follow-up
* Mark Won
* Mark Lost

Overview

* Requirement
* Products
* Commercial Context
* Expected Close
* Competitors

Quotations

* Current Quotation
* Versions
* Status

Activity

CRM timeline.

Related

* Sales Orders
* Documents

⸻

74. Quotation List

Useful columns:

* Quotation Number
* Customer
* Opportunity
* Value
* Status
* Owner
* Date
* Valid Until
* Follow-up

Default views may include:

* My Quotations
* Drafts
* Approval Pending
* Sent
* Follow-up Due
* Expiring
* Accepted
* Rejected

⸻

75. Quotation Detail

Potential structure:

Header

* Quotation Number
* Customer
* Status
* Value
* Version
* Owner

Actions:

* Edit
* Revise
* Send
* Download
* Request Approval
* Create Order

Items

Product and pricing breakdown.

Commercial Summary

* Subtotal
* Discount
* Tax
* Charges
* Total

Terms

* Payment
* Delivery
* Validity

Activity

* Created
* Approved
* Sent
* Followed Up
* Revised
* Accepted

⸻

76. Quotation Builder UX

Quotation builder should prioritize speed.

Suggested layout:

Customer / Opportunity
──────────────────────
Product Search
Quotation Items
──────────────────────
Product | Qty | Price | Discount | Tax | Total
Commercial Summary
──────────────────────
Subtotal
Discount
Tax
Charges
Total
Terms
──────────────────────
[Save Draft] [Preview] [Send]

Complex secondary configuration should use progressive disclosure.

⸻

77. Product Search UX

Salespeople should be able to search without leaving quotation creation.

Search results may show:

* Product
* Brand
* SKU
* Specification
* Price
* Stock Status

Selecting a product should immediately add it to the quotation.

⸻

78. Sales Order List

Useful information:

* Order Number
* Customer
* Value
* Status
* Owner
* Order Date
* Required Date
* Fulfilment Status
* Billing Status

Do not duplicate detailed warehouse/invoice information.

Use summaries from authoritative modules.

⸻

79. Sales Order Detail

Potential sections:

* Overview
* Items
* Customer PO
* Commercial Terms
* Fulfilment Summary
* Billing Summary
* Documents
* Activity

⸻

80. Search

Sales search should locate:

* Opportunity
* Quotation
* Sales Order
* Customer PO

using:

* Number
* Customer
* Contact
* Product where useful

Global search should integrate these record types.

⸻

81. Saved Views

Potential saved views:

* My Opportunities
* Closing This Month
* High-value Opportunities
* Stale Opportunities
* Quotations Pending Approval
* Quotations Follow-up Due
* Expiring Quotations
* Orders Awaiting Processing

⸻

82. Filters

Common filters:

* Owner
* Team
* Branch
* Territory
* Customer
* Stage
* Status
* Product Category
* Brand
* Value Range
* Date
* Expected Close

Filters should remain consistent with CRM patterns.

⸻

83. Bulk Actions

Potential safe bulk actions:

* Assign
* Reassign
* Export
* Add Tags where relevant

Avoid bulk commercial changes such as changing prices or approving discounts without carefully designed controls.

⸻

84. Sales Analytics

Useful metrics:

* Pipeline Value
* Weighted Pipeline
* Opportunities Created
* Won Opportunities
* Lost Opportunities
* Conversion Rate
* Average Deal Size
* Quotation Value
* Quotation Conversion
* Order Value
* Salesperson Performance
* Branch Performance
* Product Performance
* Discount Trends

Detailed analytics may ultimately belong to the Reports module.

⸻

85. Quotation Conversion

Track:

Quotations Sent
↓
Accepted
↓
Orders

Useful measures:

* Quotation Acceptance Rate
* Average Time to Acceptance
* Average Number of Revisions
* Average Discount
* Lost Reason

⸻

86. Discount Analytics

Management may need visibility into:

* Average Discount
* Discount by Salesperson
* Discount by Customer
* Discount by Product
* Approval Frequency
* Discount vs Conversion

Margin-sensitive information must respect permissions.

⸻

87. Product Sales Insights

Sales should consume analytics such as:

* Top-selling Products
* Top Brands
* Product Category Sales
* Customer Product Mix

Do not duplicate the reporting engine.

⸻

88. Salesperson Performance

Potential indicators:

* Pipeline
* Won Value
* Conversion
* Average Deal Size
* Quotation Conversion
* Target Achievement
* Discount Behaviour

Do not judge salesperson performance solely on activity volume.

⸻

89. Mobile Sales Experience

Future mobile Sales should prioritize:

* Opportunities
* Product Search
* Pricing
* Stock Visibility
* Create Quotation
* Share Quotation
* Follow-up
* Order Confirmation

Avoid replicating complex desktop reporting on mobile.

⸻

90. Mobile Quotation Creation

A future mobile workflow may be:

Customer
↓
Add Products
↓
Quantity
↓
Review Price
↓
Apply Allowed Discount
↓
Preview
↓
Send WhatsApp / Email

The workflow should support field sales with minimal typing.

⸻

91. Offline Considerations

Do not assume commercial transactions can always be safely completed offline.

Future mobile may cache:

* Product Catalogue
* Customer Information
* Price Information where safe
* Draft Quotations

Final commercial validation may require connectivity for:

* Current Price
* Discount Approval
* Stock
* Credit
* Order Confirmation

Offline strategy should be defined separately.

⸻

92. Communication Integration

Sales should use the shared communication infrastructure for:

* Quotation Sharing
* Follow-up
* Order Confirmation
* Customer Communication

Do not implement provider-specific WhatsApp/email logic inside Sales.

⸻

93. Product Integration

Sales consumes:

* Product
* SKU
* Brand
* Specification
* Unit
* Pricing Context

Product Management remains authoritative for product master data.

⸻

94. Inventory Integration

Sales consumes:

* Availability
* Stock Status
* Reservation Status where applicable
* Warehouse Availability where permitted

Inventory remains authoritative.

⸻

95. Billing Integration

Sales provides confirmed commercial data required for invoicing.

Billing remains authoritative for:

* Invoice
* Tax Accounting
* Receipt
* Payment
* Outstanding
* Credit Note
* Debit Note

Sales may display financial summaries where permission allows.

⸻

96. CRM Integration

CRM remains authoritative for:

* Leads
* Accounts
* Contacts
* Relationship Ownership
* General Activities
* Communication Timeline

Sales should connect opportunities and commercial activity to those records.

⸻

97. Purchase Integration

Sales may eventually inform Purchase about demand or shortages.

Do not automatically generate supplier POs directly from Sales unless an approved procurement workflow defines it.

⸻

98. AI Opportunities

Future AI capabilities may include:

* Opportunity Summary
* Win Probability Assistance
* Suggested Next Action
* Quotation Draft Assistance
* Product Suggestions
* Cross-sell Suggestions
* Communication Drafting
* Lost Opportunity Analysis
* Forecast Assistance

AI recommendations must not bypass pricing, discount, permission, or approval rules.

⸻

99. Empty States

Examples:

No Opportunities

Explain how opportunities are created.

Actions:

* Create Opportunity
* View Qualified Leads

No Quotations

Action:

* Create Quotation

No Sales Orders

Explain that confirmed quotations/orders will appear here.

Do not fill empty states with unnecessary decoration.

⸻

100. Error States

Handle:

* Invalid Pricing
* Product Unavailable
* Approval Required
* Approval Rejected
* Credit Limit Issue
* Stock Changed
* Quotation Expired
* Communication Failure
* PDF Generation Failure
* Permission Denied
* Concurrent Modification

Errors should tell users what they can do next.

⸻

101. Concurrent Commercial Changes

Sales data may be modified by multiple users.

Where important, prevent silent overwrites.

Examples:

* Quotation revised while manager reviews it
* Price changed while quotation is being prepared
* Order modified after approval

Use appropriate version/conflict handling for critical commercial records.

⸻

102. Historical Integrity

Never silently rewrite historical commercial records.

Preserve relevant historical values for:

* Issued Quotations
* Approved Discounts
* Accepted Quotations
* Confirmed Orders

Current product pricing should not retroactively alter old documents.

⸻

103. Audit Requirements

Important events should be auditable:

* Opportunity Ownership Change
* Quotation Created
* Quotation Revised
* Discount Requested
* Discount Approved
* Discount Rejected
* Quotation Sent
* Quotation Accepted
* Order Created
* Order Confirmed
* Order Cancelled

⸻

104. Sales UX Principles

Sales UX should prioritize:

* Speed
* Commercial Clarity
* Accurate Pricing
* Minimal Re-entry
* Fast Product Search
* Clear Approval Status
* Easy Sharing
* Clear Next Action

Salespeople should spend their time selling, not operating complicated software.

⸻

105. Sales Success Metrics

Potential product metrics:

* Opportunity Conversion Rate
* Quotation Turnaround Time
* Quotation Acceptance Rate
* Average Sales Cycle
* Average Deal Value
* Sales Order Value
* Target Achievement
* Discount Approval Time
* Average Discount
* Lost Opportunity Rate
* Follow-up Completion
* Pipeline Accuracy

⸻

106. Initial Sales Release Priorities

Recommended implementation order:

Sales Foundation

* Opportunities
* Opportunity Pipeline
* Opportunity Detail
* CRM Integration

Product & Pricing

* Product Selection
* Applicable Pricing
* Basic Stock Visibility

Quotations

* Quotation Builder
* Calculations
* Draft
* Preview
* PDF
* Send

Commercial Controls

* Discount Permissions
* Approval
* Quotation Versions

Order Conversion

* Acceptance
* Customer PO
* Sales Order
* Downstream Handoff

Sales Management

* Targets
* Forecast
* Sales Analytics

This order should be reconciled with the approved overall development roadmap.

⸻

107. Sales Screen Inventory

Likely screens/views include:

* Sales Home
* Opportunity List
* Opportunity Pipeline
* Opportunity Detail
* Create/Edit Opportunity
* Quotation List
* Quotation Builder
* Quotation Preview
* Quotation Detail
* Approval Queue
* Approval Detail
* Sales Order List
* Sales Order Detail
* Create Sales Order
* Sales Targets
* Sales Forecast
* Sales Analytics

This is not an instruction to build all screens immediately.

⸻

108. Design Requirements

Before designing Sales screens, Claude must:

1. Read PROJECT.md.
2. Read CRM.md.
3. Read SALES.md.
4. Review approved design-system documentation.
5. Understand the exact sales workflow being designed.
6. Identify permissions.
7. Identify commercial calculations.
8. Identify approval requirements.
9. Identify states and edge cases.
10. Identify desktop/mobile behavior.
11. Avoid introducing functionality outside approved scope.

⸻

109. Development Requirements

Before implementing Sales functionality, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read CRM.md.
5. Read SALES.md.
6. Inspect existing implementation.
7. Identify authoritative data sources.
8. Identify database requirements.
9. Identify APIs.
10. Identify permissions.
11. Identify calculations.
12. Identify audit requirements.
13. Identify integration dependencies.
14. Define tests.
15. Implement only approved scope.
16. Verify before reporting completion.

⸻

110. Cross-Module Ownership

CRM Owns

* Leads
* Accounts
* Contacts
* CRM Activities
* Relationship Ownership

Sales Owns

* Opportunities
* Quotations
* Commercial Negotiation
* Sales Orders
* Sales Targets
* Sales Forecast

Product Management Owns

* Product Master
* Product Specifications
* Product Classification

Inventory Owns

* Stock
* Availability
* Reservation
* Stock Movement
* Fulfilment

Billing Owns

* Invoices
* Payments
* Outstanding
* Credit Notes
* Debit Notes
* Financial Ledger

Purchase Owns

* Supplier Procurement
* Supplier Purchase Orders
* Goods Procurement

Sales may consume information from these modules but must not duplicate their authoritative business logic.

⸻

111. Critical Sales Principle

For every active opportunity, the system should make these things immediately understandable:

Who is the customer?
What are they buying?
What is the potential value?
What commercial proposal have we made?
What is blocking the sale?
Who owns it?
What happens next?
When are we expecting to close?

If users need to search through multiple screens to answer these questions, the Sales experience needs improvement.

⸻

112. Quotation Principle

Quotation creation should feel closer to building a modern online order than completing an ERP form.

The desired experience:

Select
↓
Configure
↓
Price
↓
Review
↓
Approve if Required
↓
Send

Complex commercial rules should operate behind a simple user experience.

⸻

113. Sales Order Principle

A confirmed Sales Order represents a commercial commitment.

It should therefore be:

* Accurate
* Traceable
* Permission-controlled
* Auditable
* Connected to its quotation
* Connected to its customer
* Connected to downstream fulfilment and billing

Confirmed orders should not behave like disposable editable drafts.

⸻

114. Final Sales Principle

The Sales module should help the business move from:

Interest → Commercial Intent → Agreement → Order

with as little friction as possible while preserving commercial discipline.

Every major sales workflow should optimize for:

Understand Requirement
↓
Prepare the Right Offer
↓
Get Approval Quickly
↓
Communicate Clearly
↓
Follow Up
↓
Close
↓
Hand Off Cleanly

The product succeeds when salespeople can prepare and close business faster while management retains visibility and control over pricing, discounts, pipeline, and performance.
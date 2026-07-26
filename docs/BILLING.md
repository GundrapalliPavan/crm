BILLING.md

Electrical Distribution CRM — Billing & Payments Module Specification

Version: 1.0
Status: Product Definition
Module: Billing & Payments
Parent Document: PROJECT.md
Related Modules: CRM.md, SALES.md, INVENTORY.md, PURCHASE.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The Billing module manages customer-facing financial transactions generated from completed or approved sales activity.

It should help the organization answer:

* What needs to be invoiced?
* What has already been invoiced?
* How much does each customer owe?
* Which invoices are overdue?
* What payments have been received?
* Which payments are unallocated?
* What is the customer’s outstanding balance?
* What credit terms apply?
* Which invoices require follow-up?
* What credit or debit adjustments exist?
* What taxes were applied?
* What supplier invoices are pending?
* What financial documents are associated with an order?
* What payments are expected today or this week?

The Billing module should provide operational financial clarity without becoming an unnecessarily complex accounting system.

⸻

2. Billing Product Goal

The primary goal is:

Convert completed commercial transactions into accurate invoices, track collections, maintain clear customer outstanding balances, and ensure every payment and adjustment can be traced back to its source.

The system should reduce:

* Manual invoice preparation
* Spreadsheet outstanding tracking
* Missed payment follow-ups
* Duplicate invoices
* Unallocated payments
* Incorrect invoice values
* Incorrect GST calculations
* Lost payment references
* Disconnected sales and billing information
* Manual customer statement preparation

⸻

3. Billing Scope

The Billing module includes:

* Customer Invoices
* Invoice Generation
* Invoice PDF
* Invoice Communication
* GST-ready Billing
* Payment Terms
* Due Dates
* Customer Credit Terms
* Customer Credit Limits
* Receipts
* Customer Payments
* Payment Allocation
* Partial Payments
* Advance Payments
* Outstanding Balances
* Payment Follow-ups
* Payment Reminders
* Credit Notes
* Debit Notes
* Customer Statements
* Supplier Invoice References
* Purchase Invoice Tracking
* Basic Reconciliation
* Billing Reports
* Billing Notifications
* Billing Automation
* Payment Gateway Integration Readiness

⸻

4. Out of Scope

Billing does not automatically become a complete accounting system.

The following should remain outside scope unless explicitly approved:

* General Ledger
* Chart of Accounts
* Journal Entries
* Profit & Loss
* Balance Sheet
* Cash Flow Statements
* Bank Accounting
* Payroll
* Fixed Assets
* Full Accounts Payable
* Full Accounts Receivable Accounting
* Statutory Tax Filing
* GST Return Filing
* TDS Filing
* Financial Audit Software

The architecture should allow future integration with accounting platforms.

⸻

5. Core Module Relationships

Customer revenue flow:

CRM Customer
↓
Sales Order
↓
Fulfilment / Dispatch
↓
Invoice
↓
Customer
↓
Payment
↓
Receipt
↓
Outstanding Updated

Procurement-side reference:

Purchase Order
↓
Goods Receipt
↓
Supplier Invoice
↓
Finance / Accounts

Billing primarily owns customer billing.

Supplier financial processing may remain lighter until a dedicated Finance/Accounts module is required.

⸻

6. Primary Users

Billing Executive

Needs to:

* Review billable orders
* Generate invoices
* Review invoice calculations
* Send invoices
* Record payments
* Allocate payments
* Generate receipts
* Create credit/debit notes
* Track outstanding
* Follow up on payments

⸻

Accounts / Finance User

Needs:

* Invoice visibility
* Payment tracking
* Outstanding balances
* Reconciliation
* Supplier invoice references
* Customer statements
* Credit information
* Tax summaries
* Financial exports

⸻

Sales Executive

Needs controlled visibility into:

* Customer outstanding
* Invoice status
* Payment status
* Credit availability
* Overdue invoices

Sales should not automatically receive unrestricted access to sensitive financial information.

⸻

Sales Manager

Needs:

* Customer outstanding
* Team collection status
* Overdue invoices
* Credit-blocked customers
* Payment follow-up visibility

⸻

Branch Manager

Needs:

* Branch billing
* Collections
* Outstanding
* Overdue invoices
* Credit exposure
* Billing performance

⸻

Management

Needs:

* Total Billing
* Collections
* Outstanding
* Overdue Amount
* Ageing
* Branch Billing
* Customer Exposure
* Billing Trends

⸻

7. Billing Domain Model

Important concepts include:

Invoice

A formal request for payment for supplied goods/services.

Payment

Money received from a customer.

Payment Allocation

Association of a payment with one or more invoices.

Receipt

Acknowledgement of customer payment.

Outstanding

Amount still payable by a customer.

Credit Note

A financial adjustment reducing an invoice/customer balance.

Debit Note

A financial adjustment increasing an amount due where applicable.

Customer Statement

Chronological summary of customer invoices, payments, credits, and outstanding balance.

⸻

8. Invoice Source

Invoices should normally originate from an approved commercial transaction.

Potential sources:

* Sales Order
* Dispatch
* Completed Delivery
* Manual Billing with permission
* Other approved business event

The exact invoicing trigger should be configurable based on business workflow.

⸻

9. Invoice Trigger

Possible business models include:

Sales Order Confirmed
↓
Invoice

or:

Sales Order
↓
Dispatch
↓
Invoice

or:

Sales Order
↓
Delivery
↓
Invoice

The final trigger should be explicitly approved before implementation.

Do not hardcode assumptions prematurely.

⸻

10. Invoice Information

Potential invoice information:

Header

* Invoice Number
* Invoice Date
* Due Date
* Customer
* Billing Address
* Shipping Address
* GSTIN
* Sales Order
* Dispatch Reference
* Salesperson
* Branch

Items

* Product
* SKU
* HSN/SAC
* Quantity
* Unit
* Unit Price
* Discount
* Tax Rate
* Tax Amount
* Line Total

Commercial Summary

* Subtotal
* Discount
* Taxable Value
* CGST
* SGST
* IGST
* Additional Charges
* Rounding
* Grand Total

Payment

* Payment Terms
* Due Date
* Amount Paid
* Outstanding

Other

* Notes
* Terms
* Bank/Payment Information where appropriate

⸻

11. Invoice Numbering

Invoice numbers must be unique according to applicable business and tax requirements.

Example conceptually:

INV/HYD/2026-27/001245

Numbering may depend on:

* Legal Entity
* Branch
* Financial Year
* Invoice Type

Exact numbering should be configurable and reviewed for applicable statutory requirements.

Do not use invoice numbers as database primary keys.

⸻

12. Invoice Status

Practical statuses may include:

* Draft
* Issued
* Partially Paid
* Paid
* Overdue
* Cancelled / Voided where legally permitted
* Credited

Avoid excessive status combinations.

Derived statuses such as overdue should be calculated where possible rather than manually maintained.

⸻

13. Draft Invoice

Draft invoices may:

* Be reviewed
* Be corrected
* Be previewed

They should not yet represent formally issued financial documents.

Once issued, stricter modification rules should apply.

⸻

14. Invoice Finalization

Before invoice issuance, validate:

* Customer
* GST information where required
* Invoice Address
* Products
* Quantity
* Pricing
* Discounts
* Taxes
* Sales Order
* Fulfilled Quantity where applicable
* Invoice Total

Important validation failures should block issuance.

⸻

15. Invoice Calculations

Authoritative invoice calculations must occur on the backend.

Conceptually:

Quantity × Unit Price
↓
Line Discount
↓
Taxable Value
↓
Applicable Tax
↓
Line Total

then:

Subtotal
- Discounts
+ Charges
+ Taxes
± Rounding
= Invoice Total

Never rely exclusively on frontend calculations.

⸻

16. Money Handling

Financial calculations should use decimal-safe arithmetic.

Do not use floating-point arithmetic for authoritative monetary calculations.

Store and process:

* Currency
* Unit Price
* Discount
* Tax
* Charges
* Payments
* Outstanding

with appropriate precision.

⸻

17. GST Readiness

The application is expected to operate initially in India.

Billing architecture should support GST-related requirements where applicable.

Potential information:

* Supplier GSTIN
* Customer GSTIN
* Place of Supply
* HSN/SAC
* GST Rate
* CGST
* SGST
* IGST
* Taxable Value

Actual statutory rules must be validated against current legal/accounting requirements before production implementation.

⸻

18. Intra-State Transactions

Where applicable, an intra-state transaction may involve:

CGST
+
SGST

The application should derive tax treatment from approved tax configuration rather than user guesswork.

⸻

19. Inter-State Transactions

Where applicable, an inter-state transaction may involve:

IGST

Tax determination must be centralized.

⸻

20. HSN/SAC

Products may carry appropriate HSN/SAC information from the Product domain.

Billing should consume this information.

Do not manually recreate HSN configuration for every invoice.

⸻

21. Tax Configuration

Tax configuration should support:

* Tax Rate
* Effective Date
* Product Classification
* Applicable Jurisdiction
* Status

Historical invoices must preserve the tax information used when issued.

Future tax configuration changes must not silently rewrite historical invoices.

⸻

22. Invoice PDF

The system should generate professional invoice documents.

Potential content:

* Company Logo
* Legal Business Information
* GSTIN
* Invoice Number
* Invoice Date
* Customer Information
* Billing Address
* Shipping Address
* Product Details
* HSN/SAC
* Quantity
* Rate
* Discount
* Tax
* Invoice Total
* Amount in Words where required
* Payment Terms
* Bank / Payment Information
* Terms & Conditions

Document generation should use shared infrastructure.

⸻

23. Invoice Sharing

Invoices may be sent through:

* Email
* WhatsApp
* Download
* Secure Link where approved

Communication should use shared communication infrastructure.

⸻

24. WhatsApp Invoice Sharing

Potential flow:

Invoice
↓
Send
↓
WhatsApp
↓
Customer Contact
↓
Select Approved Template
↓
Attach Invoice
↓
Send
↓
Record Communication

The customer record and invoice timeline should reflect communication where technically supported.

⸻

25. Email Invoice Sharing

Potential flow:

Invoice
↓
Email
↓
Customer
↓
Message
↓
Invoice Attachment
↓
Send

Communication history should be recorded where supported.

⸻

26. Payment Terms

Customers may have standard payment terms.

Examples:

* Immediate
* Advance
* 7 Days
* 15 Days
* 30 Days
* 45 Days
* 60 Days
* Custom

Terms should be configurable.

⸻

27. Due Date

Due date may be calculated from:

Invoice Date
+
Payment Terms
=
Due Date

Users should be able to override it only where permitted.

⸻

28. Customer Credit

Selected customers may purchase on credit.

Potential customer credit information:

* Credit Allowed
* Credit Limit
* Credit Period
* Current Outstanding
* Overdue Amount
* Available Credit

Example:

Credit Limit       ₹5,00,000
Outstanding        ₹3,20,000
Available Credit   ₹1,80,000

Exact available-credit calculations should be centralized.

⸻

29. Credit Limit Integration

Sales may request credit status before confirming an order.

Conceptually:

Sales Order
↓
Customer Credit Check
↓
Within Limit
→ Continue
Exceeds Limit
→ Warning / Approval

Billing/Finance should provide the authoritative customer exposure information.

⸻

30. Credit Override

Authorized users may approve exceptions.

Potential reasons:

* Strategic Customer
* Payment Expected
* Management Approval
* Temporary Limit Increase

Overrides should:

* Require permission
* Record reason
* Record approver
* Be auditable

⸻

31. Customer Payment

The system should support recording customer payments.

Potential payment methods:

* Bank Transfer
* UPI
* Cheque
* Cash where applicable
* Card
* Payment Gateway
* Other

Payment methods should be configurable.

⸻

32. Payment Information

Potential fields:

* Payment Number
* Customer
* Payment Date
* Amount
* Payment Method
* Bank Reference / UTR
* Cheque Number
* Payment Gateway Reference
* Notes
* Attachment
* Recorded By

⸻

33. Payment Numbering

Payments/receipts should have unique business references.

Example:

RCPT/HYD/2026-27/00241

Exact numbering should be configurable.

⸻

34. Payment Allocation

A payment may apply to:

* One Invoice
* Multiple Invoices
* Customer Account as Advance

Example:

Payment Received: ₹1,00,000
INV-001    ₹40,000
INV-002    ₹35,000
INV-003    ₹25,000

The allocation must be traceable.

⸻

35. Partial Payment

Example:

Invoice Total      ₹1,00,000
Payment             ₹60,000
Outstanding         ₹40,000

Invoice status becomes:

Partially Paid

The system must support multiple payments against one invoice.

⸻

36. Multiple Invoice Payment

One customer payment may settle several invoices.

Example:

Payment: ₹2,50,000
Invoice A      ₹1,00,000
Invoice B        ₹75,000
Invoice C        ₹50,000
Unallocated      ₹25,000

Do not require separate payment records for each invoice.

⸻

37. Advance Payment

Customers may pay before invoicing.

Example:

Customer Advance
₹1,00,000

Later:

Invoice Generated
↓
Allocate Advance
↓
Outstanding Reduced

Advance balances must remain clearly distinguishable from normal payments.

⸻

38. Unallocated Payment

A payment may be received before its invoice relationship is known.

The system should allow:

Payment Received
↓
Unallocated
↓
Review
↓
Allocate

Unallocated amounts should be visible to Finance.

⸻

39. Payment Reversal

Incorrect payment records should not simply be deleted after they have become authoritative.

Use controlled reversal/correction where appropriate.

Record:

* Original Payment
* Reversal
* Reason
* User
* Timestamp

⸻

40. Payment Receipt

The system should generate a receipt after payment is recorded where required.

Potential content:

* Receipt Number
* Customer
* Date
* Amount
* Payment Method
* Reference
* Invoice Allocation
* Balance

Receipt may be:

* Downloaded
* Emailed
* Shared through WhatsApp

⸻

41. Outstanding Balance

Customer outstanding should be derived from authoritative billing transactions.

Conceptually:

Issued Invoices
+
Debit Adjustments
-
Payments
-
Credit Adjustments
=
Outstanding

The exact financial logic must be centralized.

⸻

42. Customer Outstanding View

Useful information:

* Customer
* Total Outstanding
* Current
* Overdue
* Oldest Invoice
* Credit Limit
* Available Credit
* Salesperson

Views may include:

* All Outstanding
* Overdue
* High Value
* Credit Limit Exceeded
* Due Today
* Due This Week

⸻

43. Invoice Ageing

Typical ageing buckets may include:

* Current
* 1–30 Days
* 31–60 Days
* 61–90 Days
* 91–180 Days
* 180+ Days

Ageing ranges should be configurable where necessary.

⸻

44. Ageing Calculation

Ageing should be based on an approved business definition.

Usually:

Today
-
Due Date
=
Days Overdue

Do not mix invoice age with overdue age.

⸻

45. Payment Follow-up

Payment follow-up is important for distributors operating with customer credit.

Potential follow-up actions:

* Call
* WhatsApp
* Email
* Visit
* Promise to Pay
* Escalation

Billing may use shared CRM activity infrastructure.

⸻

46. Promise to Pay

During collection follow-up, users may record:

* Promised Amount
* Promised Date
* Customer Contact
* Notes

Example:

Customer promises ₹75,000
by 30 Jul 2026

This should help prioritize collection activity.

⸻

47. Broken Promise

If a promised payment date passes without sufficient payment:

Promise Date Passed
+
Amount Not Received
↓
Broken Promise

The system may flag it for follow-up.

Avoid aggressive automatic escalation without configured rules.

⸻

48. Payment Reminders

Potential reminder channels:

* In-App
* WhatsApp
* Email
* SMS

Reminder scenarios:

* Before Due Date
* Due Today
* Overdue
* Significantly Overdue

Rules should be configurable.

⸻

49. Customer Reminder Communication

Reminder templates may use:

{{customer_name}}
{{invoice_number}}
{{invoice_amount}}
{{outstanding_amount}}
{{due_date}}
{{payment_link}}

where applicable.

Templates should support controlled editing.

⸻

50. Reminder Frequency

Avoid repeatedly messaging customers.

The system should track:

* Last Reminder
* Reminder Count
* Channel
* Result

Users should be able to see recent communication before sending another reminder.

⸻

51. Automated Payment Reminders

Potential automation:

Invoice Due Soon
↓
Check Outstanding
↓
Check Reminder Rules
↓
Send Reminder
↓
Record Communication

Automation should respect:

* Customer Preferences
* Communication Consent
* Template Requirements
* Frequency Limits
* User Configuration

⸻

52. Credit Note

Credit notes may be required for:

* Sales Return
* Price Adjustment
* Billing Correction
* Discount Adjustment
* Other Approved Reason

Credit-note creation should be controlled.

⸻

53. Credit Note Information

Potential fields:

* Credit Note Number
* Customer
* Original Invoice
* Date
* Reason
* Products where applicable
* Quantity
* Taxable Value
* Tax
* Credit Amount
* Notes

⸻

54. Sales Return Integration

Conceptually:

Customer Return
↓
Inventory Inspection
↓
Approved Commercial Return
↓
Credit Note
↓
Customer Balance Updated

Physical stock handling belongs to Inventory.

Financial adjustment belongs to Billing.

⸻

55. Credit Note Status

Potential states:

* Draft
* Approval Pending
* Issued
* Applied
* Cancelled where legally permitted

Exact rules should follow applicable accounting requirements.

⸻

56. Debit Note

Debit notes may be used where additional customer amounts become payable under approved business/accounting scenarios.

Potential reasons:

* Price Difference
* Additional Charge
* Billing Adjustment

Usage should follow the organization’s accounting policy.

⸻

57. Adjustment Approval

Financial adjustments may require approval based on:

* Amount
* Reason
* User Role
* Customer
* Branch

Approval history should be preserved.

⸻

58. Invoice Cancellation / Void

Issued invoices should not be casually deleted.

If cancellation/voiding is permitted:

* Require Permission
* Require Reason
* Preserve Original Document
* Preserve Audit History
* Handle downstream payments/credits correctly

Applicable statutory rules must be respected.

⸻

59. Customer Statement

The system should generate customer statements.

Potential statement:

Date        Type       Reference     Debit       Credit      Balance
01 Jul      Invoice    INV-001       ₹50,000                 ₹50,000
05 Jul      Payment    RCPT-001                  ₹20,000     ₹30,000
10 Jul      Invoice    INV-002       ₹40,000                 ₹70,000
15 Jul      Credit     CN-001                    ₹5,000      ₹65,000

⸻

60. Statement Filters

Users may generate statements for:

* Date Range
* Financial Year
* Outstanding Only
* All Transactions

Statements may be:

* Viewed
* Downloaded
* Emailed
* Shared through WhatsApp

⸻

61. Customer Financial Summary

CRM Customer 360 may consume a controlled summary:

Outstanding        ₹3,20,000
Overdue            ₹1,25,000
Credit Limit       ₹5,00,000
Available Credit   ₹1,80,000
Oldest Due         42 Days

CRM should not independently calculate these values.

⸻

62. Billing Timeline

Customer/invoice timelines may include:

* Invoice Created
* Invoice Issued
* Invoice Sent
* Reminder Sent
* Payment Recorded
* Payment Allocated
* Credit Note Issued
* Promise to Pay
* Payment Completed

Low-level accounting events should not clutter general CRM timelines.

⸻

63. Supplier Invoice Tracking

Purchase-side supplier invoices may be tracked at a basic operational level.

Potential information:

* Supplier
* Supplier Invoice Number
* Invoice Date
* PO
* GRN
* Invoice Amount
* Tax Amount
* Due Date
* Attachment
* Processing Status

A future Accounts Payable module may take deeper ownership.

⸻

64. Supplier Invoice Matching

Architecture should support:

Purchase Order
↕
Goods Receipt
↕
Supplier Invoice

Potential mismatches:

* Quantity
* Price
* Tax
* Freight
* Additional Charges

This is commonly referred to as three-way matching.

Detailed accounting posting remains outside this module unless explicitly added.

⸻

65. Supplier Payment Status

Where useful, Purchase may see simplified status:

* Payment Not Due
* Payment Due
* Payment Processing
* Paid

Detailed payment processing should remain Finance-controlled.

⸻

66. Payment Gateway Integration

Future payment integrations may support:

* Payment Links
* Online Payments
* Gateway Status
* Automatic Payment Recording

Possible providers should be selected based on business requirements.

Do not hardcode the Billing domain to a single payment gateway.

⸻

67. Payment Link

Potential flow:

Invoice
↓
Generate Payment Link
↓
WhatsApp / Email
↓
Customer Pays
↓
Gateway Callback
↓
Verify
↓
Record Payment
↓
Allocate
↓
Issue Receipt

Gateway callbacks must be verified securely.

⸻

68. Payment Gateway Safety

Payment integrations must:

* Verify signatures
* Protect credentials
* Handle retries
* Use idempotency
* Prevent duplicate payments
* Preserve gateway references
* Record failures
* Reconcile uncertain states

Never trust frontend payment-success messages as authoritative.

⸻

69. Bank Reconciliation Readiness

Future functionality may support importing bank transactions.

Potential flow:

Bank Transaction
↓
Matching Engine
↓
Customer / Invoice Suggestion
↓
User Review
↓
Payment Allocation

Start with manual payment recording unless bank integration is explicitly required.

⸻

70. Payment Matching

Future matching may use:

* Amount
* UTR / Reference
* Customer
* Invoice Number
* Date
* Payment Link Reference

Automatic matches should be reviewable where confidence is not sufficient.

⸻

71. Billing Home

Billing home should answer:

What needs financial attention today?

Potential areas:

Billing

* Orders Ready for Invoice
* Draft Invoices
* Recently Issued

Collections

* Due Today
* Due This Week
* Overdue
* Promises to Pay

Attention

* High Outstanding
* Credit Limit Exceeded
* Broken Promises
* Unallocated Payments
* Failed Payments

Recent Activity

* Payments Received
* Credit Notes
* Recently Settled Invoices

⸻

72. Invoice List

Useful columns:

* Invoice Number
* Customer
* Invoice Date
* Due Date
* Total
* Paid
* Outstanding
* Status
* Salesperson

Default views:

* All Invoices
* Draft
* Due Today
* Due This Week
* Overdue
* Partially Paid
* Paid

⸻

73. Invoice Detail

Potential structure:

Header

* Invoice Number
* Customer
* Status
* Invoice Total
* Outstanding
* Due Date

Actions:

* Send
* Download
* Record Payment
* Send Reminder
* Create Credit Note
* More

Items

Product and tax breakdown.

Payment Summary

* Total
* Paid
* Outstanding

Payments

Payment history and allocation.

Related

* Sales Order
* Dispatch
* Credit Notes
* Documents

Activity

Billing timeline.

⸻

74. Invoice Creation UX

Where invoice generation requires user interaction:

Source Order
────────────────────────
Customer
Billing / Shipping Address
Items
────────────────────────
Product | Qty | Price | Discount | Tax | Total
Tax Summary
────────────────────────
Taxable
CGST
SGST / IGST
Total
────────────────────────
Grand Total
Payment
────────────────────────
Terms
Due Date
[Save Draft] [Preview] [Issue Invoice]

Most data should be inherited from the authoritative sales transaction.

⸻

75. Payment List

Useful information:

* Payment Number
* Customer
* Date
* Amount
* Method
* Reference
* Allocated
* Unallocated
* Recorded By

Views:

* Recent
* Unallocated
* Partially Allocated
* Fully Allocated
* Reversed

⸻

76. Record Payment UX

Conceptual workflow:

Customer
↓
Payment Amount
↓
Payment Method
↓
Reference
↓
Select Outstanding Invoices
↓
Allocate
↓
Review
↓
Confirm

The system may suggest oldest invoices first but should not force allocation without approved rules.

⸻

77. Outstanding List

Useful columns:

* Customer
* Total Outstanding
* Overdue
* Oldest Due
* Credit Limit
* Available Credit
* Salesperson
* Last Payment
* Next Follow-up

This should be one of the primary collection-management screens.

⸻

78. Collection Workspace

A dedicated collections experience may help billing and sales teams.

Potential information:

Customer
Outstanding
Overdue
Oldest Invoice
Last Payment
Promise to Pay
Last Contact
Owner

Quick actions:

* Call
* WhatsApp
* Email
* Add Follow-up
* Record Promise
* Record Payment

⸻

79. Credit Note List

Useful columns:

* Credit Note Number
* Customer
* Invoice
* Date
* Reason
* Amount
* Status

⸻

80. Customer Statement Screen

Potential structure:

Header

* Customer
* Date Range
* Opening Balance
* Closing Balance

Transactions

* Invoice
* Payment
* Credit
* Debit

Actions:

* Download
* Email
* WhatsApp

⸻

81. Search

Billing search should locate:

* Invoice
* Payment
* Receipt
* Credit Note
* Customer
* Supplier Invoice Reference

Searchable identifiers may include:

* Invoice Number
* Customer Name
* Phone
* GSTIN
* Payment Reference
* UTR
* Receipt Number

⸻

82. Filters

Common filters:

* Customer
* Branch
* Salesperson
* Invoice Status
* Payment Status
* Due Date
* Invoice Date
* Amount Range
* Payment Method
* Ageing Bucket

⸻

83. Saved Views

Potential saved views:

* Due Today
* Due This Week
* Overdue
* 30+ Days
* High Outstanding
* Credit Limit Exceeded
* Unallocated Payments
* Broken Promises
* Recently Paid

⸻

84. Bulk Actions

Potential safe bulk actions:

* Send Payment Reminder
* Export
* Generate Statements

Bulk communication should include safeguards.

Avoid bulk financial modifications.

⸻

85. Billing Notifications

Useful notifications:

* Invoice Ready
* Invoice Issued
* Payment Received
* Payment Failed
* Invoice Due Soon
* Invoice Overdue
* Promise Due
* Promise Broken
* Credit Limit Exceeded
* Payment Unallocated
* Credit Note Approval Required

Notifications should be role-relevant.

⸻

86. Billing Automation

Potential automation:

Invoice Issued

Invoice Issued
↓
Send Customer Communication
↓
Create Due-date Tracking

Payment Received

Payment Received
↓
Verify
↓
Record
↓
Allocate
↓
Update Outstanding
↓
Generate Receipt

Invoice Due

Due Date Approaching
↓
Check Outstanding
↓
Apply Reminder Rules
↓
Notify / Communicate

Overdue

Due Date Passed
+
Outstanding > 0
↓
Mark Derived Overdue State
↓
Create Collection Attention

Automation must remain auditable.

⸻

87. Billing Permissions

Potential permissions:

billing.invoice.view
billing.invoice.create
billing.invoice.update_draft
billing.invoice.issue
billing.invoice.send
billing.invoice.cancel
billing.payment.view
billing.payment.create
billing.payment.allocate
billing.payment.reverse
billing.receipt.view
billing.receipt.generate
billing.credit_note.view
billing.credit_note.create
billing.credit_note.approve
billing.debit_note.view
billing.debit_note.create
billing.debit_note.approve
billing.outstanding.view
billing.credit.view
billing.statement.view
billing.statement.send
billing.supplier_invoice.view
billing.export

Exact naming should follow final RBAC conventions.

⸻

88. Data Visibility

Visibility may depend on:

* Organization
* Legal Entity
* Branch
* Team
* Customer Ownership
* Role
* Permission

Sales Executive may see permitted customer billing summaries.

Billing may see branch-wide transactions.

Management may see organization-wide billing.

Backend must enforce these boundaries.

⸻

89. Financial Data Security

Financial information is sensitive.

Permissions should separately consider access to:

* Invoice Values
* Customer Outstanding
* Credit Limits
* Payments
* Purchase Costs
* Supplier Invoices
* Financial Reports

Do not assume anyone who can view a customer can automatically view all financial information.

⸻

90. Transaction Safety

Critical financial operations must be transactional.

Examples:

Issue Invoice

should either fully succeed or fail safely.

Likewise:

Record + Allocate Payment

must not create inconsistent invoice balances.

⸻

91. Idempotency

Critical financial actions must protect against duplicate processing.

Examples:

* Invoice Generation
* Payment Gateway Callback
* Payment Recording
* Receipt Generation
* Credit Note Application

Network retries must not create duplicate financial transactions.

⸻

92. Concurrent Financial Changes

The system must handle scenarios such as:

Invoice Outstanding: ₹1,00,000
User A records ₹60,000 payment
User B records ₹70,000 payment

The system must prevent incorrect allocations and inconsistent balances.

⸻

93. Historical Integrity

Issued financial documents should not be silently rewritten.

Preserve historical values for:

* Issued Invoice
* Payment
* Receipt
* Credit Note
* Debit Note

Corrections should use approved financial correction workflows.

⸻

94. Audit Requirements

Important events should be auditable:

* Invoice Created
* Invoice Issued
* Invoice Sent
* Invoice Cancelled
* Payment Recorded
* Payment Allocated
* Payment Reversed
* Receipt Generated
* Credit Note Created
* Credit Note Approved
* Debit Note Created
* Credit Override Approved
* Statement Sent
* Payment Reminder Sent

⸻

95. Audit Information

Audit records may include:

* Event
* Record
* User
* Date/Time
* Previous Value
* New Value
* Reason
* Source

Audit information should not be editable by normal users.

⸻

96. Import

Potential imports:

* Opening Customer Outstanding
* Historical Invoices where required
* Historical Payments
* Supplier Invoice References

Imports should require:

* Mapping
* Validation
* Duplicate Detection
* Balance Verification
* Error Report
* Import Summary

Opening balances should remain traceable.

⸻

97. Export

Authorized users may export:

* Invoices
* Payments
* Outstanding
* Ageing
* Customer Statements
* Credit Notes
* Tax Summaries
* Supplier Invoice References

Exports must respect permissions.

⸻

98. CRM Integration

CRM owns:

* Customer
* Contacts
* Communication
* Relationship

Billing provides CRM with authorized summaries such as:

* Outstanding
* Overdue
* Credit Status
* Last Payment
* Recent Invoice

CRM should not independently calculate financial balances.

⸻

99. Sales Integration

Sales provides:

* Sales Order
* Commercial Pricing
* Approved Discounts
* Customer PO
* Payment Terms

Billing provides:

* Invoice Status
* Outstanding
* Payment Status
* Credit Status

Sales should not independently generate financial truth.

⸻

100. Inventory Integration

Inventory provides:

* Dispatch
* Fulfilled Quantity
* Sales Return
* Goods Receipt for supplier-side matching

Billing may use these events depending on approved invoice workflow.

Billing should never alter physical stock.

⸻

101. Purchase Integration

Purchase provides:

* Purchase Order
* Supplier
* Commercial Terms
* Supplier Quote

Inventory provides:

* Goods Receipt

Billing/Finance may associate:

* Supplier Invoice
* PO
* GRN

Purchase should not independently calculate supplier payable balances.

⸻

102. Product Integration

Product Management provides:

* Product
* SKU
* HSN/SAC
* Unit
* Tax Classification where configured

Billing consumes this information.

Historical invoices preserve the information used at issuance.

⸻

103. Communication Integration

Billing uses shared infrastructure for:

* Invoice Email
* Invoice WhatsApp
* Payment Reminder
* Receipt
* Customer Statement
* Payment Link

Do not create provider-specific communication logic inside Billing.

⸻

104. SMS Integration

SMS may be useful for:

* Payment Due Reminder
* Payment Confirmation
* Receipt Notification

SMS should be used selectively due to cost and communication experience.

⸻

105. Accounting Software Integration Readiness

Future integrations may include accounting platforms used by the business.

The architecture should support:

CRM Billing
↓
Integration Layer
↓
Accounting Platform

Potential synchronization:

* Customers
* Invoices
* Payments
* Credit Notes
* Supplier Invoices

The integration layer should avoid coupling core Billing logic to one accounting provider.

⸻

106. Integration Ownership

The system should explicitly determine which platform is authoritative for each financial object when an accounting integration is introduced.

Example:

CRM
→ Operational Invoice Workflow
Accounting Platform
→ Financial Ledger

Do not allow two systems to independently modify the same authoritative financial state without synchronization rules.

⸻

107. Billing Reports

Useful reports include:

* Invoice Register
* Collection Report
* Outstanding Report
* Customer Ageing
* Payment Register
* Credit Note Register
* Tax Summary
* Salesperson Outstanding
* Branch Outstanding
* Customer Statement
* Collection Follow-up Report

Advanced reporting may ultimately belong to REPORTS.md.

⸻

108. Billing Analytics

Potential metrics:

* Total Invoiced
* Total Collected
* Outstanding
* Overdue
* Collection Rate
* Average Collection Time
* Average Days Overdue
* Credit Exposure
* Customer Ageing
* Payment Method Mix

Metrics should support action, not merely dashboard decoration.

⸻

109. Collection Performance

Useful operational indicators may include:

* Amount Due
* Amount Collected
* Overdue Recovered
* Promises Kept
* Broken Promises
* Average Collection Time

Do not use raw call/message volume as the primary measure of collection effectiveness.

⸻

110. Mobile Billing Experience

Future mobile experience should prioritize:

* Invoice Lookup
* Outstanding
* Customer Statement
* Record Payment where permitted
* Send Reminder
* Share Invoice
* Share Receipt

Complex reconciliation and tax reporting should remain desktop-oriented.

⸻

111. Field Collection Workflow

A future field-sales workflow may support:

Customer Visit
↓
View Outstanding
↓
Select Invoice
↓
Record Collection
↓
Payment Reference
↓
Generate Receipt
↓
Send Customer Confirmation

Permissions and payment controls must be carefully defined.

⸻

112. Offline Billing Considerations

Authoritative financial operations should generally require connectivity.

Avoid allowing offline confirmation of:

* Invoice Issuance
* Payment Allocation
* Credit Note Application
* Credit Limit Override

Draft information may be cached where useful.

Financial truth should synchronize through the authoritative backend.

⸻

113. AI Opportunities

Future AI may assist with:

* Collection Prioritization
* Customer Payment Summary
* Suggested Reminder Draft
* Invoice Explanation
* Payment Matching Suggestions
* Overdue Risk Identification
* Collection Forecasting
* Anomaly Detection

AI should recommend.

AI must not independently alter financial balances.

⸻

114. Payment Risk Indicators

Future intelligence may identify customers with:

* Increasing Overdue
* Repeated Late Payments
* Broken Promises
* Credit-limit Pressure
* Reduced Payment Frequency

Such indicators should remain explainable.

Do not introduce opaque automated customer blocking without approved rules.

⸻

115. Empty States

Examples:

No Invoices

Explain that issued invoices will appear here.

No Outstanding

Communicate that there are currently no unpaid customer balances.

No Payments

Explain where recorded payments will appear.

No Overdue Invoices

Communicate that no current invoices are overdue.

Do not fill empty states with unnecessary decoration.

⸻

116. Error States

Handle scenarios such as:

* Invoice Already Issued
* Invalid Tax Configuration
* Missing GST Information
* Invalid Quantity
* Payment Exceeds Allowed Allocation
* Duplicate Payment Reference
* Invoice Already Paid
* Credit Note Exceeds Eligible Amount
* Credit Limit Exceeded
* Payment Gateway Failure
* Communication Failure
* Concurrent Modification
* Permission Denied

Errors should tell users what happened and what action is available.

⸻

117. Billing UX Principles

Billing UX should prioritize:

* Accuracy
* Financial Clarity
* Fast Invoice Generation
* Easy Payment Recording
* Clear Outstanding
* Clear Due Dates
* Clear Tax Breakdown
* Traceability
* Minimal Duplicate Entry

Billing users should not need spreadsheets to determine what customers owe.

⸻

118. Financial Summary Principle

Whenever monetary information is displayed, users should clearly understand what each number means.

Avoid:

Balance ₹1,20,000

when context is ambiguous.

Prefer:

Invoice Total      ₹2,00,000
Paid                 ₹80,000
Outstanding        ₹1,20,000

⸻

119. Collection UX Principle

The collections experience should answer:

Who owes us?
How much?
Since when?
Against which invoices?
When did they last pay?
When did we last contact them?
What did they promise?
What should we do next?

Users should not need to open several modules to answer these questions.

⸻

120. Billing Success Metrics

Potential product metrics:

* Invoice Accuracy
* Invoice Processing Time
* Collection Rate
* Outstanding Value
* Overdue Value
* Average Collection Period
* Ageing Distribution
* Unallocated Payment Value
* Payment Matching Rate
* Reminder Effectiveness
* Credit Exposure
* Billing Error Rate

⸻

121. Initial Billing Release Priorities

Recommended implementation order:

Billing Foundation

* Customer Billing Profile
* Invoice Model
* Invoice Numbering
* Tax Configuration
* Sales Order Integration

Invoice Processing

* Invoice Creation
* Calculations
* Preview
* Issue
* PDF
* Email / WhatsApp Sharing

Payments

* Record Payment
* Partial Payment
* Multiple Invoice Allocation
* Receipt
* Outstanding Calculation

Credit Management

* Payment Terms
* Credit Limits
* Credit Status
* Sales Credit Check

Collections

* Outstanding
* Ageing
* Payment Follow-ups
* Promise to Pay
* Reminders
* Customer Statements

Adjustments

* Credit Notes
* Debit Notes
* Sales Return Integration
* Payment Reversal

Finance Integration

* Supplier Invoice References
* PO/GRN/Invoice Matching Readiness
* Accounting Integration
* Bank Reconciliation Readiness

Billing Intelligence

* Collection Analytics
* Risk Indicators
* Payment Matching Assistance
* AI Assistance

This order should be reconciled with the approved overall development roadmap.

⸻

122. Billing Screen Inventory

Likely screens/views include:

* Billing Home
* Invoice List
* Invoice Detail
* Create Invoice
* Invoice Preview
* Payments List
* Record Payment
* Payment Detail
* Receipts
* Outstanding List
* Collection Workspace
* Customer Outstanding Detail
* Customer Statement
* Credit Notes List
* Credit Note Detail
* Create Credit Note
* Debit Notes
* Credit Approval
* Supplier Invoice References
* Billing Reports
* Billing Settings

This is a screen inventory, not an instruction to build everything immediately.

⸻

123. Billing Home Information Architecture

Potential structure:

Attention Required

* Overdue
* High Outstanding
* Broken Promises
* Credit Limit Exceeded
* Unallocated Payments

Billing

* Ready for Invoice
* Draft
* Recently Issued

Collections

* Due Today
* Due This Week
* Payments Received

Recent Activity

* Invoices
* Payments
* Credit Notes

The screen should prioritize financial actions rather than generic charts.

⸻

124. Customer Billing Detail Information Architecture

Potential structure:

Header

* Customer
* Outstanding
* Overdue
* Credit Status

Actions:

* Create Invoice where permitted
* Record Payment
* Send Reminder
* Generate Statement

Financial Summary

* Credit Limit
* Outstanding
* Available Credit
* Overdue
* Last Payment

Invoices

Customer invoices.

Payments

Payment history.

Adjustments

Credit/debit notes.

Collections

* Follow-ups
* Promises to Pay

Statement

Chronological financial activity.

⸻

125. Billing Design Requirements

Before designing Billing screens, Claude must:

1. Read PROJECT.md.
2. Read CRM.md.
3. Read SALES.md.
4. Read INVENTORY.md.
5. Read PURCHASE.md.
6. Read BILLING.md.
7. Review approved design-system documentation.
8. Understand the exact billing workflow being designed.
9. Identify financial calculations.
10. Identify GST/tax requirements.
11. Identify permissions.
12. Identify approval requirements.
13. Identify Sales/Inventory dependencies.
14. Identify communication requirements.
15. Identify states and edge cases.
16. Avoid introducing functionality outside approved scope.

⸻

126. Billing Development Requirements

Before implementing Billing functionality, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read CRM.md.
5. Read SALES.md.
6. Read INVENTORY.md.
7. Read PURCHASE.md.
8. Read BILLING.md.
9. Inspect existing implementation.
10. Identify authoritative commercial sources.
11. Identify financial calculations.
12. Identify tax configuration.
13. Identify permissions.
14. Identify approval requirements.
15. Identify audit requirements.
16. Identify concurrency risks.
17. Identify idempotency requirements.
18. Identify communication dependencies.
19. Identify accounting integration boundaries.
20. Define tests.
21. Implement only approved scope.
22. Verify before reporting completion.

⸻

127. Cross-Module Ownership

CRM Owns

* Customer
* Contacts
* Relationship
* CRM Communication
* General Activities

Sales Owns

* Opportunities
* Quotations
* Sales Orders
* Commercial Pricing
* Customer PO

Inventory Owns

* Physical Stock
* Reservations
* Dispatch
* Sales Return Stock Handling
* Goods Receipt

Purchase Owns

* Suppliers
* Purchase Orders
* Supplier Commercial Terms
* Procurement

Billing Owns

* Customer Invoices
* Payments
* Receipts
* Outstanding
* Customer Credit Exposure
* Credit Notes
* Debit Notes
* Customer Statements
* Collection Tracking
* Billing Tax Calculations

Future Finance / Accounting Owns

* General Ledger
* Journal Entries
* Financial Statements
* Statutory Accounting
* Supplier Payables
* Bank Accounting
* Tax Filing

Billing may provide financial transactions to Accounting but should not duplicate the accounting ledger.

⸻

128. Critical Billing Principle

For every customer balance, the system should be able to answer:

How much was invoiced?
Against what?
How much has been paid?
Which payments were applied?
What credits were applied?
How much remains outstanding?
When was it due?
How long has it been overdue?

If the balance cannot be explained transaction-by-transaction, financial integrity is compromised.

⸻

129. Invoice Truth Principle

Once an invoice is formally issued, it becomes a historical commercial/financial document.

Do not silently modify:

* Customer
* Products
* Quantity
* Pricing
* Tax
* Total

Use appropriate correction mechanisms.

⸻

130. Payment Truth Principle

Every payment should answer:

Who paid?
How much?
When?
How?
What is the payment reference?
Which invoices did it settle?
Who recorded it?

Unallocated payments should remain visible until resolved.

⸻

131. Outstanding Truth Principle

No other module should independently maintain customer outstanding.

CRM asks Billing.

Sales asks Billing.

Management reports consume Billing.

The authoritative calculation should remain centralized.

⸻

132. Billing vs Accounting Principle

The application should initially solve the distributor’s operational billing problem exceptionally well without attempting to recreate a full accounting platform.

The boundary should remain:

CRM / Sales
↓
Operational Billing
↓
Accounting Integration
↓
Statutory Accounting

If full accounting becomes a future requirement, it should be designed as a dedicated domain rather than gradually mixing accounting logic into Billing.

⸻

133. Final Billing Principle

The Billing module should create a controlled financial journey:

Order
↓
Fulfil
↓
Invoice
↓
Communicate
↓
Collect
↓
Allocate
↓
Receipt
↓
Reconcile

The application should allow the business to understand:

Who owes us money, how much, against what, when it is due, what has been collected, and what requires action next?

without relying on disconnected spreadsheets, handwritten payment registers, personal WhatsApp conversations, or manual outstanding calculations.

Every financial transaction must be:

Accurate.

Traceable.

Permission-controlled.

Auditable.

Safe from duplicate processing.

Connected to its originating business transaction.
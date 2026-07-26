UX.md

Electrical Distribution CRM — UX Design Instructions for Claude

Version: 1.0
Status: Active UX Instruction
Category: Prompt / UX
Purpose: Persistent UX guidance for Claude when designing, reviewing, or modifying the application experience.

⸻

1. Role

When working on UX for this project, act as a:

Senior Product Designer
+
Enterprise CRM UX Specialist
+
B2B Workflow Designer

Design for real operational users rather than creating visually impressive but inefficient dashboard screens.

The application is a CRM and business operations platform for an electrical products distributor dealing primarily with:

* Lights
* Fans
* Wires
* Switches

The platform supports:

* Leads
* Sales Team
* Contacts
* Companies / Customers
* Follow-ups
* Quotations
* Sales Orders
* Products
* Inventory
* Purchase Orders
* Suppliers
* Billing
* Payments
* Reports
* WhatsApp
* Email
* SMS
* Team Management

The primary objective is:

Help teams know:
What needs attention?
Who owns it?
What happened?
What happens next?

⸻

2. UX Vision

The application should feel:

Lightweight
Premium
Fast
Clear
Focused
Professional
Calm
Trustworthy
Operational

It should NOT feel:

Heavy ERP
Old accounting software
Spreadsheet replacement
Overloaded admin panel
Generic template dashboard
Developer-built CRUD interface

The user should feel that the CRM simplifies operations rather than adding another administrative burden.

⸻

3. Core UX Principle

Follow:

Hide complexity. Preserve capability.

The underlying system may contain complex:

* Sales workflows
* Inventory rules
* Purchase operations
* Financial calculations
* Permissions
* Communications
* Reporting

But users should see only the information and controls required for the current task.

Use:

Progressive Disclosure
+
Contextual Actions
+
Strong Defaults
+
Clear Hierarchy

instead of displaying every possible option at once.

⸻

4. Primary Product Goal

The most important operational objective is:

Track Leads
+
Track Sales Team
+
Ensure Follow-ups
+
Move Opportunities Forward

Commercial operations such as:

Quotation
Sales Order
Inventory
Purchase
Invoice
Payment

support this core objective.

When UX priorities conflict, prioritize daily sales and operational productivity over decorative dashboard features.

⸻

5. Primary Users

Design for multiple operational roles.

Potential roles include:

Administrator
Sales Manager
Sales Executive
Inventory Manager
Purchase Manager
Billing User
Management / Owner

Different roles should not necessarily see the same information hierarchy.

⸻

6. Sales Executive

The Sales Executive primarily needs to answer:

What leads are assigned to me?
Who should I contact today?
Which follow-ups are overdue?
Which opportunities are moving?
Which customers need attention?
What did I discuss previously?
Can I quickly send a WhatsApp / Email / SMS?
Can I create a quotation?

The interface should minimize administrative effort.

⸻

7. Sales Manager

The Sales Manager primarily needs:

How is the team performing?
Are leads being followed up?
Which leads are getting ignored?
Who owns each opportunity?
Where is the pipeline blocked?
Which salesperson needs attention?
What is likely to close?
What has changed recently?

Management UX should emphasize:

Exceptions
Trends
Ownership
Actionability

rather than simply showing large numbers.

⸻

8. Management / Owner

Management needs high-level visibility into:

Leads
Conversions
Sales
Team Performance
Outstanding Payments
Inventory
Purchases
Revenue Trends

Avoid requiring management users to navigate through operational screens just to understand business health.

⸻

9. Inventory User

Inventory users primarily need:

What stock is available?
What is reserved?
What is low?
What was received?
What moved?
Why did stock change?

Inventory screens should prioritize:

Product
Warehouse
Available Quantity
Stock Status
Movement History

⸻

10. Purchase User

Purchase users primarily need:

What needs to be purchased?
Which suppliers are involved?
What POs are pending?
What is expected?
What has been partially received?
What remains outstanding?

⸻

11. Billing User

Billing users primarily need:

What needs invoicing?
Which invoices are unpaid?
What is overdue?
What payment was received?
Which invoices should this payment be allocated to?
Can I send the invoice immediately?

Financial screens should emphasize accuracy and clarity over compactness.

⸻

12. UX Hierarchy

Every screen should clearly answer:

Where am I?
What am I looking at?
What matters most?
What can I do?
What happens next?

If these are unclear, redesign the screen.

⸻

13. Application Navigation

Navigation should reflect business mental models rather than technical architecture.

Potential primary areas:

Dashboard
CRM
├── Leads
├── Contacts
├── Companies
└── Follow-ups
Sales
├── Quotations
└── Sales Orders
Products & Inventory
├── Products
├── Inventory
└── Stock Movements
Purchase
├── Purchase Orders
└── Goods Receipts
Billing
├── Invoices
└── Payments
Reports
Team
Settings

Exact navigation must follow approved project scope.

Do not introduce modules merely to make navigation look comprehensive.

⸻

14. Navigation Principle

Keep primary navigation shallow.

Avoid:

Menu
→ Submenu
→ Submenu
→ Submenu
→ Screen

Prefer:

Module
→ Screen

with tabs or contextual navigation inside detail areas where needed.

⸻

15. Navigation Labels

Use language familiar to business users.

Prefer:

Leads
Customers
Products
Inventory
Purchase Orders
Invoices
Payments

Avoid technical terminology such as:

Entities
Records
Objects
Transactions Engine
Communication Objects

⸻

16. Dashboard Philosophy

The dashboard is not a collection of decorative charts.

It should answer:

What requires attention today?

and:

How is the business performing?

⸻

17. Dashboard Priority

For operational users, prioritize:

Follow-ups Due Today
Overdue Follow-ups
New Leads
Assigned Leads
Pipeline Movement
Recent Activity
Tasks Requiring Action

For management:

Lead Volume
Conversion
Pipeline
Sales
Team Performance
Outstanding
Inventory Alerts

Role-aware dashboards are preferable to one enormous universal dashboard.

⸻

18. Dashboard Cards

Do not create KPI cards simply because dashboards traditionally have cards.

Every card must answer a meaningful business question.

Good:

12 Follow-ups Overdue

because it suggests action.

Less useful:

Total Contacts: 14,482

unless that number supports an actual decision.

⸻

19. Actionable Metrics

Where possible, metrics should be clickable.

Example:

Overdue Follow-ups
12

Click:

→ Follow-ups filtered to overdue

Avoid dead-end statistics.

⸻

20. Lead UX

Leads are one of the most important entities in the product.

Lead UX must make these immediately visible:

Lead Name
Company
Contact
Source
Status
Priority
Owner
Last Activity
Next Follow-up

Do not force users to open every lead just to determine whether action is required.

⸻

21. Lead List

The lead list should support:

Search
Filters
Sorting
Pagination
Saved/relevant views where justified
Bulk actions where justified

Important quick filters may include:

My Leads
New
Follow-up Today
Overdue
Qualified
Unassigned
Converted

Only include views supported by actual project requirements.

⸻

22. Lead Row Actions

Avoid displaying many icons permanently on every row.

Use:

Primary contextual action
+
Overflow menu

where appropriate.

Potential actions:

Call
WhatsApp
Add Follow-up
Edit
Assign
Convert

The most frequent action should require the least effort.

⸻

23. Lead Detail Philosophy

The lead detail screen should behave like a workspace.

It should answer:

Who is this?
What is the opportunity?
Who owns it?
What happened?
What should happen next?
How can I contact them?
Can I progress the sale?

⸻

24. Lead Detail Structure

Potential information architecture:

Lead Header
├── Name / Company
├── Status
├── Owner
├── Priority
└── Primary Actions
Key Information
Next Follow-up
Activity Timeline
Communication History
Notes / Details
Related Quotations
Conversion Information

Do not place everything into equally weighted cards.

⸻

25. Activity Timeline

CRM history should be understandable chronologically.

Example:

Today
10:45 AM
WhatsApp sent
"Quotation shared with customer"
9:30 AM
Follow-up completed
Customer requested revised pricing
Yesterday
4:20 PM
Lead reassigned
Amit → Rahul

Prioritize human-readable activity.

⸻

26. Follow-up UX

Follow-up is not just a date field.

It is a primary productivity mechanism.

A user should be able to quickly:

Schedule
Reschedule
Complete
Cancel
Add outcome
Schedule next follow-up

⸻

27. Follow-up Completion

When completing a follow-up, consider a lightweight flow:

Outcome
+
Optional Note
+
Next Follow-up

This encourages continuity without forcing unnecessary forms.

⸻

28. Overdue Follow-ups

Overdue items should be noticeable without making the interface visually aggressive.

Use:

Status
Icon
Subtle semantic treatment

Do not cover the interface in warning colors.

⸻

29. Contact UX

Contact screens should prioritize:

Name
Company
Role
Phone
Email
Communication
Related Activity

Provide direct communication actions where permissions allow.

⸻

30. Company / Customer UX

Company details should act as a business relationship hub.

Potential sections:

Overview
Contacts
Activity
Quotations
Sales Orders
Invoices
Payments
Communication

Avoid forcing users to separately search each module to understand one customer.

⸻

31. Customer 360 Principle

The user should be able to understand a customer relationship from one place.

But do not create an enormous single page.

Use:

Summary
+
Tabs / Sections
+
Progressive Disclosure

⸻

32. Product UX

Product lists should prioritize:

Product Name
SKU
Category
Brand
Unit
Selling Price
Stock Status
Active Status

depending on user permissions.

Avoid showing every technical/product field in the main list.

⸻

33. Product Selection

Product selectors used in:

Quotation
Sales Order
Purchase Order
Invoice

must be optimized for speed.

Search should work by:

Product Name
SKU

and optionally:

Brand
Category

⸻

34. Product Selection Experience

When selecting a product, useful contextual information may include:

SKU
Product
Brand
Available Stock
Unit
Price

Do not require opening another screen to check basic availability.

⸻

35. Inventory UX

Inventory should emphasize current availability and explainability.

Users should quickly understand:

On Hand
Reserved
Available
Low Stock

Avoid presenting stock as one unexplained number if reservations are part of the workflow.

⸻

36. Stock Movement UX

Movement history should clearly communicate:

Date
Product
Movement
Quantity
Warehouse
Reference
Reason
User

Example:

+40
Purchase Receipt
PO-00182
-10
Sales Issue
SO-00241

The user should understand why stock changed.

⸻

37. Inventory Adjustment UX

Adjustments are sensitive.

The UX should require:

Product
Warehouse
Adjustment Quantity
Reason
Optional Notes

Clearly communicate whether stock is increasing or decreasing.

Avoid ambiguous fields such as:

New Stock

without explaining the resulting adjustment.

⸻

38. Quotation UX

Quotation creation should feel closer to creating a commercial document than filling a database form.

Structure:

Customer
↓
Products
↓
Pricing
↓
Tax / Discount
↓
Terms
↓
Review

⸻

39. Quotation Builder

Prefer an editable line-item experience.

Columns may include:

Product
Quantity
Unit
Price
Discount
Tax
Amount

Keep totals visible.

⸻

40. Quotation Summary

Display:

Subtotal
Discount
Tax
Total

clearly.

Do not make users calculate or infer totals from line items.

⸻

41. Quotation Actions

Potential primary actions:

Save Draft
Send
Convert to Sales Order

depending on status.

Do not display actions that are invalid for the current quotation state.

⸻

42. Sales Order UX

Sales order screens should clearly communicate:

Customer
Order Status
Products
Quantity
Stock Availability
Order Value
Expected Delivery
Source Quotation

⸻

43. Workflow Status

Workflow states should be visually understandable.

Example:

Draft → Confirmed → Processing → Completed

But do not turn every detail page into a large decorative stepper.

Use a stepper only when it meaningfully improves comprehension.

⸻

44. Purchase Order UX

PO creation should optimize repeated product entry.

Users should quickly:

Select Supplier
Add Products
Set Quantities
Set Purchase Price
Review Tax
Set Expected Delivery
Submit / Approve

⸻

45. Goods Receipt UX

Receiving should emphasize:

Ordered
Previously Received
Receiving Now
Remaining

Example:

Ordered            100
Previously Received 40
Receiving Now       30
Remaining            30

This is clearer than asking users to infer partial receipt state.

⸻

46. Billing UX

Billing screens should prioritize:

Accuracy
Confidence
Traceability

over extreme visual compactness.

The user should clearly see:

Customer
Invoice Number
Invoice Date
Due Date
Tax
Total
Paid
Outstanding
Status

⸻

47. Invoice Creation

Where an invoice comes from a sales order:

Sales Order
↓
Create Invoice

should prefill known information.

Do not make users re-enter:

* Customer
* Products
* Prices
* Addresses

unless modification is explicitly permitted.

⸻

48. Invoice Status

Use understandable states such as:

Draft
Issued
Partially Paid
Paid
Overdue
Cancelled

according to BILLING.md.

Do not rely solely on color.

⸻

49. Payment UX

Recording payment should be efficient.

Potential structure:

Customer
Payment Date
Amount
Method
Reference
↓
Outstanding Invoices
↓
Allocation

⸻

50. Payment Allocation

Make allocation understandable.

Example:

Payment Received: ₹1,00,000
Invoice INV-1042
Outstanding ₹60,000
Allocate    ₹60,000
Invoice INV-1058
Outstanding ₹55,000
Allocate    ₹40,000
Remaining to Allocate: ₹0

Prevent confusing over-allocation through UX and backend validation.

⸻

51. Communication UX

Communication should feel integrated into CRM workflows.

Users should not have to navigate to a completely separate tool just to send:

WhatsApp
Email
SMS

to a lead/customer.

⸻

52. Contextual Communication

From a lead/customer screen, provide actions such as:

WhatsApp
Email
SMS

where configured and permitted.

The communication composer should already know:

Recipient
Related Lead / Customer
Relevant Context

⸻

53. Communication Composer

Keep it lightweight.

Potential:

Channel
Recipient
Template
Message
Attachment
Send

Only display fields relevant to the selected channel.

⸻

54. WhatsApp UX

Where templates are required:

Choose Template
↓
Preview Message
↓
Review Variables
↓
Send

Do not expose provider terminology unless users genuinely need it.

⸻

55. Invoice Communication

From an invoice:

Send Invoice

should allow:

WhatsApp
Email

depending on available integrations.

The invoice attachment should be automatically included where appropriate.

⸻

56. Communication History

Show:

Channel
Direction
Message
Status
Time
User

Statuses may include:

Queued
Sent
Delivered
Read
Failed

Only show statuses actually supported by the selected channel/provider.

⸻

57. Failed Communication

Failures should provide:

Clear status
Useful reason
Retry action where appropriate

Avoid exposing raw provider error codes as the primary user message.

⸻

58. Reports UX

Reports should answer business questions.

Do not start with:

Which chart should we use?

Start with:

What decision should this report support?

⸻

59. Report Structure

A report may use:

Title
Description
Date Range
Filters
Summary Metrics
Visualization
Detailed Table
Export

Not every report requires every element.

⸻

60. Report Filters

Keep commonly used filters visible.

Move secondary filters into:

More Filters

if necessary.

Avoid presenting 15 filters above every report.

⸻

61. Charts

Charts should be:

Simple
Readable
Comparable
Purposeful

Avoid:

3D charts
Decorative gauges
Excessive donut charts
Overloaded legends
Unnecessary gradients

⸻

62. Tables

Tables are essential in this product.

Treat table UX as a primary design system pattern.

Tables should support where relevant:

Search
Filters
Sorting
Pagination
Selection
Bulk Actions
Row Actions
Column Alignment
Empty States
Loading States

⸻

63. Table Density

Use balanced density.

The application should feel efficient without becoming cramped.

Avoid:

Huge rows with excessive whitespace

and:

Spreadsheet-level visual density everywhere

⸻

64. Table Alignment

Generally:

Text
→ Left
Numbers
→ Right
Money
→ Right
Quantities
→ Right
Status
→ Consistent alignment
Actions
→ Right

This improves scanning.

⸻

65. Table Actions

Do not display 5–8 action icons in every row.

Prefer:

Primary action where necessary
+
More menu

⸻

66. Filters

Filters should reflect actual user questions.

Examples:

Assigned to Me
Status
Source
Team
Date
Customer
Brand
Category
Warehouse

Do not create filters simply because the corresponding database column exists.

⸻

67. Filter State

Clearly indicate active filters.

Provide:

Clear All

when multiple filters are active.

Users should never wonder why records disappeared.

⸻

68. Search

Search should be forgiving.

Users may search using:

Name
Phone
Company
SKU
Invoice Number
PO Number

depending on module.

Use clear placeholders.

Example:

Search leads by name, company or phone

instead of simply:

Search...

where additional context improves usability.

⸻

69. Forms

Forms should be structured by user intent.

Do not mirror database tables.

Example lead form:

Contact Information
Business Information
Lead Details
Assignment
Notes

rather than presenting fields in schema order.

⸻

70. Form Length

For long forms use:

Sections
Progressive Disclosure
Conditional Fields

Avoid multi-step wizards unless:

* The process genuinely has distinct stages
* The user benefits from reduced cognitive load
* Data cannot reasonably be entered on one structured screen

⸻

71. Required Fields

Do not overuse required fields.

Ask:

Do we genuinely need this information to complete the task?

A CRM that requires excessive data entry will reduce adoption.

⸻

72. Defaults

Use safe defaults wherever possible.

Examples:

Current User as Lead Owner
Today's Date
Default Warehouse
Default Currency
Default Payment Terms

Only where business rules allow.

Defaults should reduce work, not hide important decisions.

⸻

73. Validation

Validation should occur as close as practical to the relevant field.

Example:

Enter a valid GSTIN.

Avoid generic:

Something went wrong.

for known validation problems.

⸻

74. Error Messages

Error messages should explain:

What happened?
Why?
What can the user do?

Example:

Only 12 units are currently available.
Reduce the quantity or choose another warehouse.

⸻

75. Confirmation Dialogs

Do not ask for confirmation for routine reversible actions.

Use confirmation for consequential actions such as:

Cancel Invoice
Delete Draft
Remove User
Adjust Stock
Cancel Purchase Order

depending on business rules.

⸻

76. Confirmation Content

Bad:

Are you sure?

Better:

Cancel this purchase order?
The order will no longer be available for receiving stock.

Explain consequences.

⸻

77. Success Feedback

Routine successful operations should use lightweight feedback.

Example:

Lead updated

Do not show a modal after every successful action.

⸻

78. Destructive Actions

Use semantic destructive treatment sparingly.

Do not make every secondary action look dangerous.

Destructive actions should be visually distinguishable and require appropriate confirmation.

⸻

79. Empty States

Every meaningful list should have an intentional empty state.

Differentiate:

No data exists

from:

No results match your filters

Example:

No leads yet.
Add your first lead to start tracking opportunities.

versus:

No leads match these filters.
Clear or change the filters to see more results.

⸻

80. Loading States

Use:

Skeletons
Inline loading
Button progress

where appropriate.

Avoid blocking the entire application for a small local action.

⸻

81. Saving States

Prevent duplicate submissions.

Example button states:

Save
↓
Saving...
↓
Saved

or appropriate lightweight feedback.

⸻

82. Long-running Operations

For:

Import
Export
Bulk Communication
Large Report

do not force users to wait on a frozen screen.

Use:

Queued
Processing
Completed
Failed

status where appropriate.

⸻

83. Unsaved Changes

For forms where losing edits would be costly, warn users before navigating away.

Do not apply unsaved-change prompts to trivial interactions.

⸻

84. Status Design

Status should use:

Label
+
Semantic treatment

not color alone.

Example:

● Paid

instead of a green dot without text.

⸻

85. Color Usage

Follow COLORS.md.

Color should primarily communicate:

Hierarchy
State
Action
Feedback

Avoid decorative overuse.

The application should remain visually calm.

⸻

86. Typography

Follow TYPOGRAPHY.md.

Use typography to establish:

Page Hierarchy
Section Hierarchy
Readability
Scanning

Avoid excessive font sizes and weights.

⸻

87. Components

Follow COMPONENTS.md.

Reuse approved components before creating new variants.

Do not solve every screen with unique components.

⸻

88. Visual Density

The product should feel lightweight and premium through:

Whitespace
Alignment
Typography
Subtle Borders
Controlled Elevation
Clear Grouping

not through oversized cards and decorative graphics.

⸻

89. Card Usage

Do not wrap everything in cards.

Use cards when they represent meaningful grouping.

Avoid:

Card inside Card inside Card

Use whitespace and section hierarchy where sufficient.

⸻

90. Borders and Shadows

Prefer subtle borders and restrained elevation.

Avoid heavy shadows that make the product feel like a consumer landing page.

Operational applications benefit from visual stability.

⸻

91. Icons

Use approved icon libraries defined by the project/design system.

Icons should support comprehension.

Do not use icons simply to decorate every label.

⸻

92. Icon-only Actions

Use icon-only buttons only when the meaning is widely understood or supported by tooltip/accessibility labeling.

Examples:

Close
More
Search

Less obvious business actions should usually include text.

⸻

93. Tooltips

Use tooltips for:

Icon explanation
Abbreviation explanation
Additional context

Do not hide essential information exclusively inside tooltips.

⸻

94. Modals

Use modals for focused short interactions.

Examples:

Assign Lead
Schedule Follow-up
Record Payment
Confirm Action
Send Message

Avoid putting large complex workflows inside cramped modals.

⸻

95. Drawers

Side drawers may be useful for:

Quick Record Preview
Filters
Lightweight Editing
Activity Context

Use only where they preserve context and reduce unnecessary navigation.

⸻

96. Full Page vs Modal

Use a full page when the task requires:

Significant data entry
Multiple sections
Complex line items
Deep review

Examples:

Create Quotation
Create Purchase Order
Create Invoice

Use a modal for short contextual tasks.

⸻

97. Breadcrumbs

Use breadcrumbs where hierarchy is meaningful.

Example:

Sales / Quotations / QT-00124

Do not use breadcrumbs mechanically on shallow screens.

⸻

98. Page Header

A standard detail-page header may contain:

Breadcrumb
Title
Status
Metadata
Primary Action
Secondary Actions

Keep the action hierarchy obvious.

⸻

99. Primary Action

Each screen should ideally have one visually dominant primary action.

Examples:

Add Lead
Create Quotation
Confirm Order
Issue Invoice
Record Payment

Do not present multiple equally dominant buttons unless genuinely necessary.

⸻

100. Sticky Actions

For long commercial documents, consider keeping important actions accessible.

Example:

Save Draft
Review
Submit

Do not make users scroll several screens just to save.

⸻

101. Responsive Design

All screens must be responsive.

Design desktop-first where operational density requires it, but do not create layouts that inherently fail on smaller screens.

⸻

102. Desktop

Primary desktop target should support efficient:

Tables
Side Navigation
Detail Workspaces
Commercial Documents
Reports

⸻

103. Tablet

Tablet layouts should preserve:

Readable tables
Usable forms
Navigation
Primary actions

Complex tables may require:

Horizontal scroll
Column prioritization
Alternative row presentation

depending on context.

⸻

104. Mobile Web

Mobile web should support essential operational tasks.

Prioritize:

Leads
Follow-ups
Contacts
Communication
Basic Customer Information

Do not attempt to squeeze a desktop data table into a 360px viewport unchanged.

⸻

105. Future Native Mobile

The future mobile application will likely prioritize sales-field workflows.

Therefore desktop UX should establish consistent concepts for:

Lead
Customer
Follow-up
Activity
Communication
Quotation

without depending on desktop-only interactions such as hover.

⸻

106. Touch Targets

Interactive elements must remain usable on touch devices.

Do not create tiny action targets solely to increase table density.

⸻

107. Hover

Hover may enhance desktop UX.

Never make hover the only way to discover or execute an essential operation.

⸻

108. Accessibility

Design for reasonable accessibility from the beginning.

Ensure:

Readable Contrast
Keyboard Navigation
Visible Focus
Clear Labels
Semantic Status
Accessible Forms
Reasonable Touch Targets

⸻

109. Keyboard Efficiency

Power users may repeatedly perform:

Lead Entry
Follow-up
Quotation Entry
Product Selection

Support sensible keyboard navigation.

Avoid unnecessary mouse-only interaction.

⸻

110. Focus States

All interactive components must have visible focus states.

Do not remove browser/application focus indicators without providing an accessible replacement.

⸻

111. Data Formatting

Use consistent formats.

Currency:

₹1,25,000.00

Locale:

en-IN

Dates should use the project-approved display format consistently.

API/internal formats remain defined by API.md.

⸻

112. Large Numbers

Use Indian grouping for INR where displayed.

Example:

₹12,50,000

not:

₹1,250,000

unless an explicitly different locale is required.

⸻

113. Phone Numbers

Display phone numbers readably.

Store/operate using normalized values according to technical documentation.

Communication actions should use the normalized underlying value.

⸻

114. Document Numbers

Commercial document numbers are important identifiers.

Display them prominently.

Examples:

QT/HYD/2026-27/00124
SO/HYD/2026-27/00098
INV/HYD/2026-27/001245

Users should be able to search by document number.

⸻

115. Permissions UX

If a user cannot perform an action:

* Hide it when it is irrelevant.
* Disable it with explanation when understanding the restriction is useful.

Do not expose inaccessible workflows merely to make the interface look complete.

⸻

116. Approval UX

Where approval exists, clearly show:

Current Status
Who submitted
Who can approve
Approval result
Relevant notes

Do not bury approval inside an overflow menu if it is the primary task.

⸻

117. Audit vs Activity

Do not expose technical audit logs as the normal CRM timeline.

User-facing activity should be understandable.

Administrative audit history may be shown separately where required.

⸻

118. Communication vs Activity

Communication should appear within the relevant activity context where useful.

Example timeline:

Follow-up completed
WhatsApp sent
Quotation created
Quotation emailed
Lead reassigned

This gives users one understandable history.

⸻

119. Cross-module Context

Preserve context when moving between related records.

Example:

Lead
↓
Quotation
↓
Sales Order
↓
Invoice

The user should be able to navigate backward to the source record.

⸻

120. Related Record Links

Display meaningful references.

Example:

Created from:
QT/HYD/2026-27/00124

rather than only showing an internal UUID.

⸻

121. Avoid Duplicate Data Entry

Whenever data already exists, prefill it.

Examples:

Lead → Customer
Quotation → Sales Order
Sales Order → Invoice
Purchase Order → Goods Receipt

The system should carry information forward.

⸻

122. Smart Defaults

Use known context.

Example:

From:

Customer → Create Quotation

automatically populate:

Customer
Primary Contact
Billing Address
Payment Terms

where available.

⸻

123. Contextual Creation

Allow records to be created from relevant contexts.

Examples:

Lead → Add Follow-up
Lead → Create Quotation
Customer → Create Quotation
Sales Order → Create Invoice
Purchase Order → Receive Goods
Invoice → Record Payment
Invoice → Send

This is preferable to making users repeatedly navigate to module list pages.

⸻

124. Quick Actions

Quick actions should focus on high-frequency operations.

Potential examples:

Add Lead
Add Follow-up
Create Quotation
Record Payment

Do not create a giant global “Create” menu containing every database entity.

⸻

125. Global Search

If implemented, global search should prioritize business records.

Potential:

Lead
Company
Contact
Product
Quotation
Sales Order
Invoice
Purchase Order

Results should clearly show entity type.

Do not implement global search unless included in project scope.

⸻

126. Sales Pipeline

If pipeline visualization is included in SALES.md/CRM.md, optimize it for:

Opportunity Stage
Value
Owner
Next Action
Age

Do not create Kanban simply because CRMs often use Kanban.

Use it only if it improves the approved workflow.

⸻

127. Kanban

When Kanban is justified:

* Keep cards concise.
* Avoid excessive metadata.
* Make status movement clear.
* Support accessibility beyond drag-and-drop.
* Validate transitions through backend rules.

Drag-and-drop must not bypass workflow validation.

⸻

128. Lead Aging

Where useful, communicate aging subtly.

Example:

No activity for 8 days

This is often more actionable than simply showing:

Created 21 days ago

⸻

129. Attention Signals

Use attention signals for genuinely actionable situations:

Overdue Follow-up
Lead Without Owner
Low Stock
PO Delayed
Invoice Overdue
Communication Failed

Do not create alerts for routine information.

⸻

130. Notification UX

Notifications should help users act.

Good:

Follow-up with ABC Electricals is overdue.

Better if actionable:

View Lead

Avoid generic:

You have a notification.

⸻

131. Notification Fatigue

Do not notify users about every minor database change.

Notifications should represent meaningful:

Assignment
Deadline
Approval
Failure
Exception

events.

⸻

132. Premium Experience

Premium does NOT mean:

More gradients
More shadows
More animation
More cards
More decorative illustrations

Premium means:

Precise spacing
Strong typography
Predictable interactions
Fast workflows
Clean information hierarchy
Polished states
Useful defaults
Consistent components

⸻

133. Animation

Use subtle motion only where it communicates:

State Change
Navigation Context
Loading
Expansion
Confirmation

Avoid decorative animation in operational workflows.

⸻

134. Performance Perception

UX should feel immediate.

Use:

Optimistic UI

only for operations where failure can be safely reconciled.

Do not optimistically show:

Payment Recorded
Stock Updated
Invoice Issued

before the server confirms critical operations.

⸻

135. Critical Operations

For:

Inventory
Billing
Payment
Approval
Document Issue

prefer correctness and explicit confirmation over perceived speed.

⸻

136. Desktop Layout Principle

Prefer a stable application shell.

Conceptually:

┌─────────────────────────────────────────────────────┐
│ Application Header                                  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Navigation   │ Main Workspace                       │
│              │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘

Do not redesign navigation patterns independently for every module.

⸻

137. Detail Workspace Pattern

Potential:

Header
────────────────────────────────────
Summary / Important Information
Tabs or Sections
────────────────────────────────────
Overview | Activity | Documents | Communication

Use where entity complexity warrants it.

⸻

138. List → Detail Pattern

Primary operational pattern:

List
↓
Detail
↓
Action

Keep this relationship predictable across modules.

⸻

139. Avoid Dashboardification

Not every module requires:

4 KPI Cards
+
Chart
+
Table

For example:

Contacts
Products
Units
Brands

may simply need excellent list and detail experiences.

⸻

140. Avoid CRUD Thinking

Do not design screens as:

Create
Read
Update
Delete

Design around tasks:

Qualify Lead
Schedule Follow-up
Prepare Quotation
Confirm Order
Receive Stock
Issue Invoice
Record Payment

⸻

141. UX Decision Priority

When making a UX decision, prioritize:

1. User Task Completion
2. Business Accuracy
3. Clarity
4. Speed
5. Consistency
6. Accessibility
7. Visual Polish
8. Novelty

Never sacrifice task completion for visual novelty.

⸻

142. Design System Compliance

Before designing any screen, read:

COLORS.md
TYPOGRAPHY.md
COMPONENTS.md

Do not invent:

New colors
New typography styles
New button styles
New spacing patterns
New table styles

unless a genuine system gap exists.

If a gap exists, identify it explicitly before introducing a new pattern.

⸻

143. Module Compliance

Before designing a module, read its corresponding document.

Examples:

CRM
→ CRM.md
Sales
→ SALES.md
Inventory
→ INVENTORY.md
Purchase
→ PURCHASE.md
Billing
→ BILLING.md
Reports
→ REPORTS.md

Do not introduce functionality outside the approved module scope.

⸻

144. Technical Awareness

UX should understand technical constraints defined in:

ARCHITECTURE.md
DATABASE.md
API.md

However:

Database Structure
≠
Screen Structure

Never mirror technical architecture directly into UX unless it matches user mental models.

⸻

145. Existing Pattern First

Before creating a new interaction:

Check existing component
↓
Check existing screen pattern
↓
Reuse if appropriate
↓
Extend only when necessary

Consistency has higher value than novelty.

⸻

146. Screen Design Process

For every new screen, Claude should first identify:

1. User
2. User Goal
3. Primary Task
4. Secondary Tasks
5. Required Information
6. Decisions User Must Make
7. Primary Action
8. Secondary Actions
9. States
10. Permissions
11. Responsive Behavior

Only then design the layout.

⸻

147. Screen State Requirement

Every screen design must consider relevant:

Default
Loading
Empty
No Search Results
Filtered Empty
Error
Permission Restricted
Success
Disabled
Partial Data

Not every screen needs every state.

Claude must identify which are relevant.

⸻

148. Component State Requirement

Interactive components should account for:

Default
Hover
Focus
Active
Disabled
Loading
Error
Success

where relevant.

⸻

149. UX Flow Requirement

When designing a workflow, document:

Entry Point
Main Path
Alternative Path
Validation
Error Path
Success Result
Next Logical Action

Do not design only the happy path.

⸻

150. Example: Lead Follow-up Flow

Lead Detail
↓
Add Follow-up
↓
Choose Date / Time
↓
Add Purpose / Note
↓
Assign
↓
Save
↓
Follow-up appears in timeline
↓
Follow-up appears in user's upcoming work

Consider:

Past date
Missing required data
Permission restriction
Duplicate submission

⸻

151. Example: Invoice Send Flow

Invoice
↓
Send
↓
Choose Channel
↓
Recipient Prefilled
↓
Choose / Preview Message
↓
Invoice Attached
↓
Send
↓
Queued
↓
Sent / Delivered / Failed

Do not imply instant delivery if provider communication is asynchronous.

⸻

152. Figma Structure

When Claude is creating screens in Figma:

Use:

Auto Layout

consistently.

Avoid orphan layers.

Use reusable components.

Use component variants for states where appropriate.

Follow the established design-system structure.

⸻

153. Figma Naming

Use understandable names.

Good:

Lead/List/Table
Lead/Detail/Header
Lead/Status
FollowUp/Create/Modal

Avoid:

Frame 582
Group 34
Rectangle 192

⸻

154. Figma Layer Hierarchy

Layers should reflect UI structure.

Example:

Lead Detail
├── Page Header
├── Summary
├── Follow-up
├── Activity
└── Related Records

Do not leave generated layers unstructured.

⸻

155. Figma Auto Layout

Use Auto Layout for:

Page sections
Cards
Forms
Tables where practical
Buttons
Navigation
Lists
Modals
Drawers
Headers

Avoid manual positioning unless genuinely required.

⸻

156. Responsive Figma Design

Frames should use:

Constraints
Auto Layout
Fill Container
Hug Contents
Min / Max behavior

appropriately.

Do not create desktop screens composed entirely of fixed-width elements.

⸻

157. Component Reuse

Before creating:

Button
Input
Select
Badge
Modal
Table
Tabs
Card
Toast
Tooltip

check COMPONENTS.md and existing design-system components.

⸻

158. UX Review Checklist

Before considering a screen complete, verify:

Does the user know where they are?
Is the primary action obvious?
Is unnecessary information removed?
Can the task be completed efficiently?
Are common actions easy?
Are destructive actions safe?
Are statuses understandable?
Are errors handled?
Are empty states handled?
Are loading states handled?
Does it work responsively?
Does it use existing components?
Does it follow module requirements?
Does it avoid unnecessary complexity?

⸻

159. CRM Review Checklist

For CRM screens verify:

Owner visible?
Status visible?
Last activity understandable?
Next follow-up visible?
Communication accessible?
History accessible?
Conversion path clear?

⸻

160. Sales Review Checklist

For sales screens verify:

Customer clear?
Document status clear?
Products easy to add?
Quantity clear?
Price clear?
Discount clear?
Tax clear?
Total obvious?
Next workflow action clear?
Source document traceable?

⸻

161. Inventory Review Checklist

Verify:

Product clear?
Warehouse clear?
On-hand visible?
Reserved visible?
Available visible?
Movement understandable?
Reference visible?
Adjustments intentional?

⸻

162. Purchase Review Checklist

Verify:

Supplier clear?
PO status clear?
Ordered quantity clear?
Received quantity clear?
Remaining quantity clear?
Expected delivery visible?
Receiving workflow efficient?

⸻

163. Billing Review Checklist

Verify:

Invoice number clear?
Customer clear?
Due date clear?
Tax understandable?
Total clear?
Paid clear?
Outstanding clear?
Payment state clear?
Send action available?
Historical document integrity respected?

⸻

164. Communication Review Checklist

Verify:

Channel clear?
Recipient clear?
Message clear?
Attachment clear?
Business context preserved?
Status visible?
Failure understandable?
Retry available where appropriate?

⸻

165. Reports Review Checklist

Verify:

Business question clear?
Date range obvious?
Filters understandable?
Metric meaningful?
Visualization useful?
Details accessible?
Export available where required?

⸻

166. What Claude Must Not Do

Do NOT:

* Add features outside approved scope
* Design generic admin templates
* Create excessive dashboard cards
* Put every section inside a card
* Overuse modals
* Use multi-step forms unnecessarily
* Mirror database structure into screens
* Show every field in list tables
* Display too many row actions
* Use color as the only status indicator
* Create decorative charts
* Hide important actions behind hover
* Use technical provider terminology unnecessarily
* Force duplicate data entry
* Create desktop-only interactions
* Ignore empty/loading/error states
* Invent design-system styles
* Create new components unnecessarily
* Use excessive animation
* Use excessive shadows
* Create deep navigation
* Make financial workflows visually ambiguous
* Make inventory adjustments casual
* Assume communication delivery is instantaneous
* Design only the happy path

⸻

167. Claude UX Response Format

When asked to design a new module or major workflow, first provide a concise UX definition containing:

Module Goal
Primary Users
Primary Tasks
Information Architecture
Main Screens
Critical User Flows
Key UX Decisions
Important States
Responsive Considerations

Then proceed with detailed screen design.

Do not generate dozens of screens before establishing the workflow.

⸻

168. Claude Screen Definition Format

Before creating an individual screen, define:

Screen:
Purpose:
Primary User:
Primary Goal:
Entry Points:
Information Hierarchy:
Primary Action:
Secondary Actions:
Sections:
Key Components:
States:
Permissions:
Responsive Behavior:
Next Logical Step:

Keep this concise enough to remain actionable.

⸻

169. Claude Figma Design Instruction

When asked to directly design screens in Figma:

1. Read project documentation.
2. Read relevant module documentation.
3. Read COLORS.md.
4. Read TYPOGRAPHY.md.
5. Read COMPONENTS.md.
6. Inspect existing Figma design system.
7. Inspect previously designed screens for reusable patterns.
8. Define the user goal.
9. Define the flow.
10. Design the screen using existing components.
11. Use Auto Layout.
12. Maintain consistent spacing.
13. Create necessary states.
14. Verify responsiveness.
15. Review against UX.md.
16. Do not introduce functionality outside project scope.

⸻

170. UX Quality Standard

The experience should make a salesperson feel:

I know what I need to do today.

A manager should feel:

I know what my team is doing and where attention is required.

An inventory user should feel:

I know what stock we have and why it changed.

A purchase user should feel:

I know what was ordered, received, and remains pending.

A billing user should feel:

I know what was invoiced, what was paid, and what remains outstanding.

Management should feel:

I can understand the state of the business without chasing information across teams.

⸻

171. Final UX Principle

The CRM must optimize for:

Clarity
+
Speed
+
Context
+
Actionability
+
Consistency

The interface should make complex business operations feel simpler without hiding information users genuinely need.

Every UX decision should ultimately reduce one or more of:

Time to understand
Time to act
Number of clicks
Duplicate data entry
Missed follow-ups
Operational ambiguity
User errors

while preserving:

Business accuracy
Financial integrity
Inventory integrity
Traceability
Permission boundaries

The product should feel like a modern sales and distribution workspace—not a traditional ERP with a new visual theme.
COMPONENTS.md

Electrical Distribution CRM — Component Design System

Version: 1.0
Status: Design System Specification
Category: Design System — Components
Parent Document: PROJECT.md
Related Documents: CLAUDE.md, COLORS.md, TYPOGRAPHY.md, PROJECT_SETUP.md

⸻

1. Purpose

This document defines the authoritative component system for the Electrical Distribution CRM.

It governs reusable UI components across:

* Dashboard
* CRM
* Contacts
* Companies
* Leads
* Opportunities
* Sales
* Quotations
* Sales Orders
* Inventory
* Products
* Warehouses
* Purchase
* Purchase Orders
* Billing
* Invoices
* Payments
* Reports
* Team Management
* Communication
* WhatsApp
* Email
* SMS
* Settings
* Future Mobile Application

The objective is to create a consistent, lightweight, premium business application without repeatedly designing or implementing the same UI patterns.

Claude must use this document as the source of truth when creating Figma components or implementing frontend components.

⸻

2. Component Philosophy

The application should feel:

* Lightweight
* Premium
* Fast
* Calm
* Consistent
* Business-focused
* Data-efficient
* Easy to learn

Components should prioritize:

Clarity
+
Consistency
+
Efficiency
+
Accessibility
+
Reusability

Do not add visual decoration without functional value.

⸻

3. Core Rule

Before creating any UI element:

Check existing component
        ↓
Can existing component handle the requirement?
        ↓
YES → Reuse it
        ↓
NO
        ↓
Can an existing component variant handle it?
        ↓
YES → Add/reuse variant
        ↓
NO
        ↓
Is this a reusable product pattern?
        ↓
YES → Add to design system
        ↓
NO → Create local composition using existing primitives

Do not create a new component simply because one screen needs slightly different spacing.

⸻

4. Component Architecture

The design system should follow four conceptual levels:

Primitives
↓
Components
↓
Patterns
↓
Features

⸻

5. Primitives

Primitives include:

* Typography
* Colors
* Icons
* Spacing
* Radius
* Borders
* Shadows
* Dividers

These form the foundation of components.

⸻

6. Components

Examples:

* Button
* Input
* Select
* Checkbox
* Radio
* Toggle
* Badge
* Avatar
* Tooltip
* Dropdown
* Tabs
* Pagination

Components should be reusable across modules.

⸻

7. Patterns

Patterns combine components.

Examples:

* Search + Filters
* Data Table
* Page Header
* KPI Card
* Activity Timeline
* Record Header
* Filter Bar
* Form Section
* Empty State
* Confirmation Dialog

⸻

8. Feature Compositions

Feature compositions use patterns to create business functionality.

Examples:

Lead List
Lead Detail
Sales Order Form
Invoice Detail
Purchase Order Form
Inventory Overview
Customer Timeline

Feature compositions are not necessarily design-system components.

⸻

9. Figma Component Structure

Recommended structure:

Components/
├── Actions/
├── Inputs/
├── Selection/
├── Navigation/
├── Data Display/
├── Feedback/
├── Overlays/
├── Tables/
├── Filters/
├── Communication/
├── CRM/
├── Commerce/
└── Layout/

Avoid one giant unstructured component page.

⸻

10. Figma Naming

Use semantic names.

Good:

Button/Primary/Medium
Input/Text/Default
Badge/Status/Success
Table/Cell/Text
Navigation/Sidebar/Item

Avoid:

Blue Button
Box 04
Input Copy 3
Gray Card
Component 126

⸻

11. Auto Layout Rule

All reusable Figma components must use Auto Layout where appropriate.

Do not manually position internal component layers when Auto Layout can handle them.

Components must correctly support:

* Hug Contents
* Fill Container
* Fixed Width when genuinely required
* Dynamic Text
* Optional Icons
* Long Labels
* Responsive Width

⸻

12. No Orphan Layers

Every meaningful layer should belong to:

* Auto Layout
* Component
* Component Instance
* Logical Container

Avoid disconnected floating layers.

⸻

13. Component Variants

Use Figma variants for predictable component states.

Example:

Button
Type:
Primary
Secondary
Tertiary
Destructive
Size:
Small
Medium
Large
State:
Default
Hover
Pressed
Focus
Disabled
Icon:
None
Leading
Trailing
Only

Do not create separate disconnected components for each state.

⸻

14. Component States

Interactive components should consider:

Default
Hover
Pressed
Focus
Disabled
Loading
Error
Selected

Only relevant states need to be implemented for each component.

⸻

15. Spacing Foundation

Use a consistent spacing system.

Recommended:

2px
4px
6px
8px
12px
16px
20px
24px
32px
40px
48px
64px

Primary working increments:

4
8
12
16
24
32

Avoid arbitrary spacing such as:

11px
17px
23px
29px

unless technically necessary.

⸻

16. Border Radius

Recommended radius system:

Small      4px
Medium     6px
Large      8px
XL         12px
Round      999px

Suggested usage:

Input           6px
Button          6px
Card            8px
Dropdown        8px
Modal           12px
Badge           999px
Avatar          999px

Avoid excessively rounded interfaces.

⸻

17. Shadows

Shadows should be subtle.

Use shadows mainly for:

* Dropdowns
* Popovers
* Modals
* Floating Panels

Cards should primarily use borders rather than heavy shadows.

Premium does not mean floating everything.

⸻

18. Icons

Use one consistent icon system.

Preferred:

* Material Symbols / Material Icons

Font Awesome may be used only where a required icon is unavailable.

Do not mix icon families unnecessarily.

⸻

19. Icon Sizes

Recommended:

Small       14px
Default     16px
Medium      20px
Large       24px

Most operational controls should use:

16px

or:

20px

icons.

⸻

20. Icon Rule

Icons should:

* Support comprehension
* Reduce scanning effort
* Clarify actions

Icons should not:

* Decorate every label
* Replace important text
* Create visual noise

⸻

21. Buttons

Supported button types:

Primary
Secondary
Tertiary
Destructive
Icon Button

⸻

22. Primary Button

Use for the main action in a context.

Examples:

Add Lead
Create Quotation
Create Sales Order
Save Changes
Send Invoice

Use COLORS.md primary action colors.

Typography:

typography.button

⸻

23. Primary Action Rule

A screen should generally have one visually dominant primary action.

Avoid:

[Add Lead] [Import] [Export] [Assign] [Send Message]

all appearing as primary blue buttons.

Prefer:

[+ Add Lead]   [Import] [Export] [More]

with only Add Lead primary.

⸻

24. Secondary Button

Use for secondary actions.

Examples:

Cancel
Export
Preview
Duplicate
Download

Do not automatically make Cancel red.

⸻

25. Tertiary Button

Use for low-priority actions.

Examples:

View details
Clear filters
Show more

⸻

26. Destructive Button

Use only for genuinely destructive actions.

Examples:

Delete Lead
Delete Product
Remove User Permanently

Actions such as:

Cancel
Close
Back
Reject

should not automatically use destructive styling.

⸻

27. Button Sizes

Recommended:

Small

Height: 32px
Horizontal Padding: 12px

Medium

Height: 36px
Horizontal Padding: 14px

Large

Height: 40px
Horizontal Padding: 16px

Medium should be the standard desktop size.

⸻

28. Button Icon Gap

Recommended:

8px

Example:

[+] Add Lead

⸻

29. Icon Button

Use for recognizable compact actions.

Examples:

* More
* Close
* Edit
* Delete
* Download
* Refresh

Recommended desktop size:

32–36px

Mobile touch target should generally reach approximately:

44px

even if the visual icon remains smaller.

⸻

30. Button Loading State

Example:

[spinner] Saving...

During loading:

* Prevent repeated submission
* Preserve approximate button width
* Communicate progress

Do not simply disable the button without feedback.

⸻

31. Text Input

Base structure:

Label
↓
Input Container
↓
Helper / Error

Standard desktop height:

36–40px

Recommended default:

40px

⸻

32. Input Variants

Support where required:

Text
Email
Phone
Number
Currency
Percentage
Password
Search
URL

These may share the same base component.

⸻

33. Input States

Support:

Default
Hover
Focus
Filled
Disabled
Read-only
Error

Success should only be introduced where explicit verification matters.

⸻

34. Input Icons

Support:

Leading Icon
Trailing Icon
Both where genuinely necessary

Examples:

Search
Phone
Email
Calendar
Currency

Avoid unnecessary icons in ordinary fields.

⸻

35. Currency Input

Currency inputs should support Indian formatting.

Example:

₹ 1,25,000

The component must distinguish between:

* Display Formatting
* Stored Numeric Value

Do not store formatted strings as financial values.

⸻

36. Number Input

Useful for:

* Quantity
* Discount
* Reorder Level
* Credit Days

Do not automatically show increment/decrement steppers where they reduce usability.

⸻

37. Textarea

Use for:

* Notes
* Comments
* Terms
* Descriptions

Recommended minimum height:

96px

Allow expansion where appropriate.

⸻

38. Search Input

Search is a high-frequency CRM component.

Recommended structure:

[Search icon] Search leads, customers...

Optional:

Clear
Keyboard Shortcut

Search should be visually lighter than primary form inputs where appropriate.

⸻

39. Select

Select component should support:

Single Select
Searchable Select
Multi Select

Use searchable selection when datasets become large.

Examples:

* Customer
* Product
* Salesperson
* Supplier
* Warehouse

⸻

40. Select Rule

Do not render hundreds of records in a basic dropdown.

For large datasets use:

Search
+
Async Loading where necessary
+
Result List

⸻

41. Multi Select

Selected values may appear as chips.

Avoid filling the input with dozens of chips.

For many selections use:

3 selected

with expanded management.

⸻

42. Combobox

Use when users need to:

* Search
* Select
* Possibly create a record

Example:

Select customer
No customer found
+ Create new customer

Use carefully to prevent accidental duplicate records.

⸻

43. Checkbox

Use for independent multiple selections.

Examples:

Select table rows
Communication preferences
Product selection

States:

Unchecked
Checked
Indeterminate
Disabled

⸻

44. Radio Button

Use for mutually exclusive options when all important options should remain visible.

Example:

Payment Type
○ Full Payment
○ Partial Payment

⸻

45. Toggle

Use for immediate binary settings.

Examples:

Allow Credit
Enable Notifications
Active Product

Do not use toggles for actions requiring explicit Save/Submit unless the behavior is clear.

⸻

46. Date Picker

Support:

Single Date
Date Range

Examples:

* Follow-up Date
* Invoice Date
* Due Date
* Delivery Date
* Report Range

Date format should follow application conventions.

⸻

47. Date Range Picker

Common presets may include:

Today
Yesterday
Last 7 Days
Last 30 Days
This Month
Last Month
This Quarter
Custom

Do not overload the component with unnecessary presets.

⸻

48. Time Picker

Use only where exact time matters.

Examples:

* Follow-up
* Meeting
* Reminder

Do not ask for time where a date is sufficient.

⸻

49. File Upload

Required for:

* PO Attachments
* Invoice Documents
* Customer Documents
* Product Files
* Communication Attachments

Support:

Browse
Drag & Drop
Upload Progress
Success
Failure
Remove
Retry

⸻

50. File Upload State

Each file should communicate:

File Name
File Type / Size
Upload Progress
Status
Actions

Do not hide upload failures.

⸻

51. Form Section

Long forms should be divided into logical sections.

Example Sales Order:

Customer
↓
Order Details
↓
Products
↓
Pricing & Tax
↓
Delivery
↓
Notes

Do not place dozens of fields in one undifferentiated card.

⸻

52. Form Layout

Desktop forms may use:

1 Column
2 Columns

depending on information type.

Do not automatically force every form into two columns.

Long fields such as:

* Address
* Notes
* Terms

should generally use full width.

⸻

53. Form Actions

Primary action should usually appear at the end of the form.

Example:

Cancel                    Save Changes

For long forms, a sticky action bar may be appropriate.

⸻

54. Form Validation

Validation should occur:

* At appropriate field interaction
* On submit
* Server-side where required

Errors must clearly identify:

* What failed
* Where
* How to correct it

Avoid generic:

Something went wrong

when specific feedback is available.

⸻

55. Cards

Cards should organize related information.

Default:

Background: Surface
Border: Default
Radius: Large

Avoid heavy shadows.

⸻

56. Card Structure

Possible structure:

Header
├── Title
├── Supporting Text
└── Actions
Content
Footer

Not every card needs all sections.

⸻

57. Card Rule

Do not place every section inside a card.

Excessive cards create:

Card inside Card inside Card

and make enterprise interfaces visually fragmented.

Use whitespace and section hierarchy where possible.

⸻

58. KPI Card

Structure:

Label
Value
Comparison / Context
Optional small visualization

Example:

Monthly Sales
₹18,40,000
↑ 8.4% vs last month

Typography and semantic color rules come from TYPOGRAPHY.md and COLORS.md.

⸻

59. KPI Rule

Do not make every KPI card a different color.

Default cards remain neutral.

Semantic emphasis should be limited to meaningful data.

⸻

60. Badge

Use badges for compact status communication.

Examples:

Qualified
Paid
Overdue
Low Stock

Variants:

Neutral
Information
Success
Warning
Danger

Use semantic rules from COLORS.md.

⸻

61. Badge Rule

Avoid assigning a unique color to every workflow status.

Most ordinary workflow states should remain neutral.

⸻

62. Chip

Use chips primarily for:

* Filters
* Tags
* Multi-selection

Examples:

Hyderabad ×
Fans ×
Assigned to Me ×

Do not use chips as a substitute for every label.

⸻

63. Avatar

Variants:

Image
Initials
Fallback Icon

Sizes may include:

24px
32px
40px
48px

Most table/list contexts should use 24–32px.

⸻

64. Avatar Group

Useful for team assignment.

Example:

[PK][RS][AM] +3

Limit visible avatars.

Do not render large stacks.

⸻

65. Tooltip

Use for:

* Icon-only Actions
* Truncated Information
* Clarification

Do not place important workflow instructions only inside tooltips.

⸻

66. Divider

Use subtle dividers for structural separation.

Prefer spacing over dividers when separation is already obvious.

⸻

67. Tabs

Use tabs for sibling views of the same context.

Example customer detail:

Overview
Activity
Orders
Invoices
Payments

Do not use tabs to represent sequential workflow steps.

⸻

68. Tab Rule

Keep tab count manageable.

If there are too many tabs, reconsider information architecture.

⸻

69. Segmented Control

Use for small mutually exclusive view modes.

Example:

[Table] [Pipeline]

or:

[Monthly] [Quarterly] [Yearly]

Do not use segmented controls for long labels or large option sets.

⸻

70. Breadcrumb

Use where hierarchy genuinely benefits navigation.

Example:

Sales / Orders / SO-2026-00124

Do not add breadcrumbs to shallow pages unnecessarily.

⸻

71. Sidebar Navigation

The desktop application uses a persistent primary navigation system.

Navigation should:

* Remain visually light
* Clearly identify active module
* Support logical grouping
* Avoid unnecessary nesting

⸻

72. Sidebar Item

Structure:

Icon
Label
Optional Count / Indicator
Optional Expand Control

States:

Default
Hover
Active
Expanded
Disabled

⸻

73. Navigation Depth

Prefer:

Maximum 2 meaningful levels

Avoid deeply nested ERP-style navigation.

Complexity should be handled inside module pages.

⸻

74. Top Bar

Potential content:

Global Search
Quick Create
Notifications
Help
User Menu

Keep the top bar restrained.

Do not duplicate all sidebar actions in the top bar.

⸻

75. Global Search

Global search should eventually support searching across relevant entities such as:

* Lead
* Customer
* Contact
* Product
* Sales Order
* Purchase Order
* Invoice

Results should clearly identify entity type.

Example:

Sri Lakshmi Electricals
Customer
INV-2026-00124
Invoice
Atomberg Renesa 1200mm
Product

⸻

76. Command / Quick Create

A lightweight quick-create control may provide access to high-frequency actions.

Examples:

New Lead
New Contact
New Sales Order
New Invoice

Do not turn this into an oversized command system unless usage justifies it.

⸻

77. Page Header

Standard page header:

Title
Optional Description
Optional Context
Actions

Example:

Leads
Manage and follow up sales opportunities.
[Import] [+ Add Lead]

⸻

78. Page Header Rule

The page header should not consume excessive vertical space.

Operational software should expose useful information quickly.

⸻

79. Record Header

Detail pages should use a reusable record-header pattern.

Example:

Sri Lakshmi Electricals
Customer • Hyderabad
[Call] [WhatsApp] [Email] [More]
Owner: Rahul
Outstanding: ₹2,45,000

The exact information depends on the entity.

⸻

80. Record Header Actions

High-frequency actions should remain visible.

Lower-frequency actions belong under:

More

Avoid showing ten buttons in the header.

⸻

81. Data Table

Tables are a core CRM component.

Tables should support combinations of:

* Sorting
* Filtering
* Search
* Selection
* Pagination
* Column Configuration
* Row Actions
* Bulk Actions
* Loading
* Empty State

Not every table requires every feature.

⸻

82. Table Structure

Typical structure:

Toolbar
↓
Header
↓
Rows
↓
Pagination

⸻

83. Table Density

Default density should be comfortable but efficient.

Recommended row height:

44–48px

Compact mode may be introduced later if actual user demand exists.

Do not start with excessively dense 32px rows.

⸻

84. Table Header

Table header should:

* Remain subtle
* Use typography.table-header
* Clearly communicate sortable columns
* Match data alignment

Avoid heavy dark headers.

⸻

85. Table Cell Types

Reusable cell patterns should include:

Text
Primary + Secondary Text
Number
Currency
Date
Status
Avatar + Text
Link
Checkbox
Actions
Progress
Product
Contact

⸻

86. Table Primary + Secondary Cell

Example:

Sri Lakshmi Electricals
Hyderabad

Primary:

typography.table-primary

Secondary:

typography.body-small / caption

Useful for reducing unnecessary columns.

⸻

87. Table Actions

Avoid showing multiple permanent icons on every row.

Prefer:

Primary click behavior
+
[More]

or a limited set of high-frequency actions.

⸻

88. Row Click

If the row opens a detail view:

* Make interaction clear
* Do not interfere with checkbox/action controls
* Support keyboard access

Do not create ambiguous clickable regions.

⸻

89. Table Sorting

Sortable headers should communicate:

Unsorted
Ascending
Descending

Sorting state should remain visible.

⸻

90. Table Selection

Support:

Individual Row
Select All Visible
Bulk Selection
Indeterminate State

Bulk action UI should appear only when selection exists.

⸻

91. Bulk Actions

Example:

5 selected
[Assign] [Change Status] [Export] [More]

Do not permanently display bulk controls when no rows are selected.

⸻

92. Column Configuration

Where tables become complex, allow users to:

* Show/Hide Columns
* Potentially Reorder Columns

Do not implement customization on every simple table.

⸻

93. Sticky Table Header

Use for long tables when beneficial.

Ensure sticky behavior does not interfere with:

* Filters
* Page Header
* Mobile Layout

⸻

94. Pagination

Pagination should support:

Previous
Page Information
Next

For large datasets:

Rows Per Page

may be useful.

⸻

95. Pagination Rule

Prefer server-side pagination for large operational datasets.

Do not load thousands of CRM records merely to paginate them client-side.

⸻

96. Filter Bar

Typical structure:

Search
Filter Controls
Date Range
Owner
Status
More Filters

Keep common filters visible.

Move uncommon filters into expanded filter UI.

⸻

97. Active Filters

Display active filters clearly.

Example:

Status: Qualified ×
Owner: Rahul ×
City: Hyderabad ×
Clear all

Users must be able to understand why results are filtered.

⸻

98. Filter Drawer

For complex filters, use a drawer or popover.

Group filters logically.

Example:

Lead Details
Assignment
Location
Dates
Value
Status

⸻

99. Saved Views

Data-heavy CRM screens may support saved views where requirements justify them.

Examples:

My Leads
Unassigned Leads
Follow-up Today
High Value Leads

Do not implement saved views prematurely unless required by project scope.

⸻

100. Dropdown Menu

Use for contextual actions.

Example:

Edit
Duplicate
Export
Archive
Delete

Destructive actions should be visually separated when appropriate.

⸻

101. Dropdown Rule

Do not place unrelated navigation, settings, and destructive actions into the same unstructured menu.

Use logical grouping.

⸻

102. Popover

Use for lightweight contextual interaction.

Examples:

* Quick Filter
* Assignment
* Date Selection
* Small Detail Preview

Use drawers/modals for complex tasks.

⸻

103. Modal

Use for:

* Confirmation
* Small Forms
* Focused Tasks
* Critical Decisions

Avoid putting long workflows into modals.

⸻

104. Modal Sizes

Suggested:

Small       ~400px
Medium      ~560px
Large       ~720px

Use responsive constraints rather than blindly fixed widths.

⸻

105. Modal Actions

Typical:

Cancel        Confirm

or:

Cancel        Save

Destructive confirmation:

Cancel        Delete

⸻

106. Drawer

Use for contextual work that benefits from retaining page context.

Examples:

* Lead Quick View
* Filters
* Edit Contact
* Communication Composer
* Activity Details

⸻

107. Drawer Rule

Use drawers for tasks that are:

More substantial than popover
but
Do not require full page navigation

⸻

108. Drawer Width

Suggested desktop widths:

Small      360–400px
Medium     480–520px
Large      600–720px

Use responsive behavior.

⸻

109. Confirmation Dialog

Required for destructive or high-impact actions.

Structure:

Title
Explanation
Optional Consequence
Cancel
Confirm

Example:

Delete lead?
This lead and its associated notes will be permanently removed.
Cancel        Delete

⸻

110. Alert

Use alerts for persistent contextual information.

Variants:

Information
Success
Warning
Danger

Alerts should not be used for every successful action.

Use toast for temporary feedback.

⸻

111. Toast

Use for short-lived feedback.

Examples:

Lead created
Invoice sent
Payment recorded
Unable to upload file

Toast should not contain complex instructions.

⸻

112. Loading Spinner

Use for short, localized loading operations.

Examples:

* Button Submission
* Small Panel Refresh

Do not show a large spinner for every page load.

⸻

113. Skeleton

Use skeleton loading for:

* Tables
* Cards
* Detail Pages
* Dashboard Data

Skeleton structure should approximate final content.

⸻

114. Empty State

Structure:

Optional Icon / Illustration
Title
Description
Primary Action
Optional Secondary Action

Example:

No leads yet
Add your first lead to start tracking your sales pipeline.
[+ Add Lead]

⸻

115. Filtered Empty State

Differentiate:

No Data Exists

from:

No Results Match Filters

Example:

No leads match these filters.
Clear filters or adjust your search.
[Clear Filters]

Do not prompt users to create new records when records simply fail the current filters.

⸻

116. Error State

Error states should explain:

* What happened
* Whether data is safe
* What user can do

Example:

Unable to load invoices.
Check your connection and try again.
[Retry]

⸻

117. Offline / Connectivity State

Because this is operational software, network failure should be communicated clearly.

Future mobile implementation may require stronger offline handling.

Do not imply that unsaved data has been stored when it has not.

⸻

118. Activity Timeline

Critical for CRM.

Timeline events may include:

* Lead Created
* Call Logged
* Note Added
* Email Sent
* WhatsApp Sent
* SMS Sent
* Status Changed
* Quotation Created
* Order Created
* Invoice Sent
* Payment Recorded
* Owner Changed

⸻

119. Timeline Item

Structure:

Icon / Avatar
Actor + Action
Supporting Content
Timestamp
Optional Actions

Example:

Rahul changed lead status to Qualified
Today, 10:42 AM

⸻

120. Timeline Grouping

For long histories, group by:

Today
Yesterday
Earlier

or dates.

Do not create visually heavy timeline graphics.

⸻

121. Note Composer

Support internal notes.

Structure:

Textarea
Optional Mention
Optional Attachment
Add Note

Clearly distinguish internal notes from customer communication.

⸻

122. Communication Composer

The CRM should support communication through:

* WhatsApp
* Email
* SMS

These should share a consistent composer architecture where practical.

⸻

123. Communication Channel Selector

Example:

[WhatsApp] [Email] [SMS]

Switching channel should adapt relevant fields.

Do not force email-specific fields into SMS or WhatsApp.

⸻

124. WhatsApp Composer

Potential structure:

Recipient
Template / Message Type
Message
Variables
Attachments where supported
Preview
Send

Actual capabilities depend on the selected WhatsApp provider/API and approved templates.

Do not design functionality unsupported by the integration.

⸻

125. Email Composer

Structure:

To
Cc/Bcc when needed
Subject
Message
Attachments
Template
Send

Advanced formatting should remain controlled.

The CRM does not need a complex document editor for routine email.

⸻

126. SMS Composer

Structure:

Recipient
Message
Character Count
Send

Where provider billing depends on message segments, communicate segment count when relevant.

⸻

127. Communication Status

Messages should support relevant statuses such as:

Queued
Sent
Delivered
Read
Failed

Status availability depends on provider capability.

Do not promise read receipts where the provider does not expose them.

⸻

128. Communication History

Customer/lead records should provide a unified communication history where practical.

Each item should identify:

Channel
Direction
Sender
Recipient
Timestamp
Status
Message Preview

⸻

129. Click-to-Call

Where phone integration is available, phone numbers may expose:

Call

actions.

If telephony integration is not configured, fall back to supported device/browser behavior.

⸻

130. Quick Communication Actions

Record headers may expose:

Call
WhatsApp
Email

only when relevant contact data exists.

Do not display enabled communication actions when no valid destination exists.

⸻

131. Lead Status Component

Use the standard badge/status system.

Do not create a separate visual language solely for leads.

Status options come from CRM.md.

⸻

132. Lead Owner

Reusable assignment component:

Avatar
Name
Dropdown / Change Action

May be used across:

* Leads
* Customers
* Opportunities
* Tasks
* Orders

⸻

133. Lead Score

Only implement a lead-score component if scoring exists in approved CRM requirements.

Do not introduce AI scoring merely because CRM products commonly provide it.

⸻

134. Pipeline Board

If CRM requirements include pipeline/Kanban:

Stage
Count
Optional Value
↓
Lead / Opportunity Cards

Cards should remain compact.

Avoid excessive card metadata.

⸻

135. Pipeline Card

Potential content:

Customer / Lead
Opportunity
Value
Owner
Next Follow-up

Show only information required to make pipeline decisions.

⸻

136. Drag and Drop

If pipeline stages support drag-and-drop:

* Provide visual destination
* Validate allowed transitions
* Update optimistically only when safe
* Handle API failure
* Maintain accessible alternative

Do not rely solely on drag-and-drop.

⸻

137. Product Selector

Sales and purchase workflows require a robust product selector.

Support:

Search by Name
SKU
Brand
Category

Result may show:

Product
SKU
Available Stock
Selling / Purchase Price where appropriate

⸻

138. Product Line Item

Reusable pattern:

Product
Quantity
Rate
Discount
Tax
Amount
Remove

May be adapted for:

* Quotation
* Sales Order
* Purchase Order
* Invoice

⸻

139. Line Item Table

Line-item editing should remain efficient.

Support:

* Product Selection
* Keyboard Navigation where practical
* Quantity Editing
* Rate Editing based on permission
* Discount
* Tax
* Automatic Totals

⸻

140. Totals Summary

Reusable financial summary:

Subtotal          ₹1,00,000
Discount             ₹5,000
Tax                  ₹17,100
────────────────────────────
Grand Total       ₹1,12,100

Use consistent right alignment and tabular numerals.

⸻

141. Tax Display

Tax presentation should support the project’s applicable tax structure.

For India this may include:

CGST
SGST
IGST

depending on transaction context.

Tax calculation logic belongs to business/domain logic, not visual components.

⸻

142. Discount Component

Discount may support:

Percentage
Fixed Amount

where allowed by business requirements.

Clearly communicate which mode is active.

⸻

143. Payment Status

Use semantic status badges.

Examples:

Paid
Partially Paid
Due
Overdue
Failed

Follow BILLING.md and COLORS.md.

⸻

144. Payment Recording Form

Potential structure:

Invoice
Outstanding Amount
Payment Amount
Payment Date
Payment Method
Reference Number
Notes
Attachment

Do not permit invalid amounts without explicit supported business logic.

⸻

145. Payment Method Selector

Potential options depend on configured business methods.

Examples may include:

Cash
Bank Transfer
UPI
Cheque
Card
Other

Do not hardcode payment methods if configuration is intended.

⸻

146. Inventory Quantity

Inventory components must distinguish:

On Hand
Reserved
Available
Incoming

when the underlying inventory model supports these concepts.

Do not collapse different stock concepts into one number if business logic differentiates them.

⸻

147. Stock Status

Use semantic treatment:

Healthy
Low Stock
Out of Stock

Healthy stock should often remain neutral to reduce visual noise.

⸻

148. Stock Indicator

Possible compact structure:

Available
124

or:

24 available

Avoid decorative progress bars unless they represent a meaningful threshold.

⸻

149. Warehouse Selector

Where multiple warehouses exist, use reusable searchable selection.

Warehouse context must be explicit when inventory quantities depend on location.

⸻

150. Purchase Order Status

Use shared status component.

Examples may include:

Draft
Pending Approval
Approved
Sent
Partially Received
Received
Cancelled

Exact states come from PURCHASE.md.

⸻

151. Goods Receipt Pattern

Receiving UI should allow users to compare:

Ordered
Previously Received
Receiving Now
Remaining

This is more useful than a generic quantity input.

⸻

152. Invoice Status

Use standard semantic badges.

Examples:

Draft
Issued
Partially Paid
Paid
Overdue

Exact behavior comes from BILLING.md.

⸻

153. Document Actions

For documents such as:

* Quotation
* Sales Order
* PO
* Invoice

common actions may include:

Preview
Download PDF
Send
Print
Duplicate
More

Only expose actions supported by the document’s current state.

⸻

154. Document Preview

Document preview may use:

Drawer
Modal
Dedicated Page

depending on document complexity.

For invoices and POs, a dedicated preview/page is often preferable to a small modal.

⸻

155. Send Document

Sending documents should use the communication infrastructure.

Example:

Send Invoice
Channel:
○ Email
○ WhatsApp
Recipient:
...
Message:
...
Attachment:
INV-2026-00124.pdf
[Send]

Only supported channels should be offered.

⸻

156. Request Component

The system may need to send:

* Payment Requests
* Document Requests
* Information Requests
* Order Confirmations

Use communication patterns rather than creating unrelated messaging interfaces for each module.

⸻

157. Notification Center

Potential structure:

Notification
Context
Timestamp
Read/Unread
Action

Examples:

Lead assigned to you
Invoice INV-124 is overdue
PO-458 has been approved

⸻

158. Notification Rule

Notifications should be actionable and relevant.

Do not notify users about every minor database event.

⸻

159. User Menu

Typical:

Profile
Preferences
Settings where authorized
Sign Out

Keep account navigation separate from operational navigation.

⸻

160. Permission-Aware Components

Components must respect role permissions.

If a user cannot perform an action:

Prefer:

Hide unavailable action

when discovering it provides no value.

Use disabled state with explanation when users need to understand that the capability exists but is unavailable.

⸻

161. Permission Rule

Do not rely only on frontend hiding.

Authorization must be enforced by backend/API.

Component-level permission handling is UX, not security.

⸻

162. Responsive Breakpoints

Exact breakpoints should follow frontend architecture.

Conceptually support:

Desktop
Tablet
Mobile

Components should adapt rather than simply shrink.

⸻

163. Desktop Layout

Desktop should prioritize:

* Efficient Navigation
* Tables
* Multi-column Forms
* Contextual Side Panels
* Fast Data Scanning

⸻

164. Tablet Layout

Tablet may:

* Collapse Sidebar
* Reduce Columns
* Adapt Tables
* Use Drawers More Frequently
* Increase Touch Targets

⸻

165. Mobile Layout

Mobile should prioritize:

* Core Tasks
* Touch Interaction
* Simplified Navigation
* Readable Forms
* Quick Communication
* Lead/Customer Updates
* Sales Team Workflows

Do not reproduce the desktop layout at smaller scale.

⸻

166. Future Mobile App Principle

Components should be designed conceptually so business patterns can translate to a future native/cross-platform mobile application.

Share:

* Design Tokens
* Business Semantics
* Status Meanings
* Component Naming
* Interaction Principles

Do not assume web components themselves will be reused directly in the mobile codebase.

⸻

167. Mobile Navigation

Future mobile application may use:

Bottom Navigation
+
Contextual Screens
+
More Menu

rather than the desktop sidebar.

Navigation architecture should preserve module semantics.

⸻

168. Mobile Actions

High-frequency sales-team actions should be easy to reach.

Examples:

Add Lead
Call
WhatsApp
Add Note
Schedule Follow-up
Update Status

This should influence web architecture without prematurely building the mobile app.

⸻

169. Mobile Forms

Mobile forms should:

* Use single-column layout
* Provide adequate touch targets
* Use appropriate mobile keyboards
* Minimize unnecessary typing
* Support camera/file access where relevant

⸻

170. Mobile Data Tables

Do not compress complex desktop tables into tiny mobile tables.

Transform into:

* Lists
* Cards
* Priority Fields
* Expandable Detail

depending on context.

⸻

171. Touch Targets

Interactive mobile controls should generally provide approximately:

44 × 44px

touch area.

Visual icon size may remain smaller.

⸻

172. Accessibility

All components should support:

* Keyboard Navigation
* Focus Visibility
* Semantic HTML
* Screen Readers
* Appropriate ARIA where necessary
* Color Contrast
* Touch Accessibility
* Browser Zoom

⸻

173. Keyboard Navigation

Users should be able to operate high-frequency workflows using keyboard where practical.

Important:

* Forms
* Dropdowns
* Tables
* Modals
* Search
* Product Selection

⸻

174. Focus Management

When opening:

Modal
Drawer
Popover
Dropdown

focus should move appropriately.

When closing, focus should return to the triggering control where practical.

⸻

175. Escape Key

Where expected:

Escape

should close:

* Dropdown
* Popover
* Modal where safe
* Drawer where safe

Do not allow Escape to silently discard critical unsaved work.

⸻

176. Unsaved Changes

Forms with meaningful unsaved data should warn users before accidental loss where appropriate.

Example:

Discard changes?
You have unsaved changes.
Keep Editing     Discard

⸻

177. Disabled vs Read-only

Disabled:

Cannot interact

Read-only:

Can read/copy but cannot edit

Do not treat them as identical.

⸻

178. Loading State Rule

Every async component should answer:

Is something happening?
Can I interact?
Did it succeed?
Did it fail?

Do not leave users guessing after an action.

⸻

179. Optimistic UI

Optimistic updates may be used for low-risk actions.

Examples:

* Mark Notification Read
* Simple Preference Toggle

Be cautious for:

* Payments
* Billing
* Inventory
* Purchase
* Order Confirmation

Financial and inventory operations should prioritize integrity over perceived speed.

⸻

180. Destructive Action Rule

Destructive actions must consider:

Can it be undone?

If yes:

Prefer:

Action
+
Undo

where practical.

If permanent:

Use confirmation where consequence is significant.

⸻

181. Archive vs Delete

Where business records should remain historically traceable, prefer:

Archive

over permanent deletion.

Business rules come from module documentation.

⸻

182. Loading Button Rule

After submit:

Save Changes
↓
Saving...
↓
Saved / Error

Prevent duplicate submissions.

⸻

183. Server Error

Server failures should preserve entered form data whenever possible.

Do not clear a long sales order because the API request failed.

⸻

184. Network Retry

Retry should be available where an operation can safely be repeated.

Avoid retrying non-idempotent financial operations blindly.

⸻

185. Data Freshness

For operational information such as inventory, provide refresh/revalidation behavior where needed.

Do not display misleading “live” language unless the data actually updates live.

⸻

186. Confirmation Before Financial Actions

Actions that materially affect financial state may require stronger confirmation.

Examples:

* Void Invoice
* Record Large Payment
* Issue Credit
* Delete Payment Record where permitted

Confirmation requirements should reflect business risk.

⸻

187. Auditability

Where the backend supports audit logs, UI components should expose relevant history in a readable way.

Example:

Status changed
Draft → Confirmed
By Rahul Sharma
26 Jul 2026, 10:45 AM

⸻

188. Progressive Disclosure

Hide complexity until users need it.

Example:

Instead of displaying 15 filters:

Search
Status
Owner
Date
More Filters

This is a core UX principle for the CRM.

⸻

189. Default vs Advanced Controls

High-frequency controls should remain visible.

Advanced controls should remain accessible but secondary.

Do not optimize the primary interface for edge cases.

⸻

190. Component Density

The CRM should feel compact but not cramped.

Use:

* Controlled padding
* 14px operational typography
* 44–48px table rows
* 36–40px desktop controls
* Clear section spacing

Avoid oversized consumer-app components.

⸻

191. Premium Component Principle

Premium does NOT mean:

* Glassmorphism
* Heavy gradients
* Excessive shadows
* Huge rounded corners
* Floating cards everywhere
* Animated controls everywhere
* Decorative illustrations everywhere

Premium comes from:

Precision
+
Consistency
+
Spacing
+
Typography
+
Subtle Interaction
+
Fast Workflows

⸻

192. Motion

Motion should be subtle and functional.

Possible uses:

* Dropdown Opening
* Drawer Transition
* Modal Transition
* Toast Appearance
* Small State Change

Avoid unnecessary animation in data-heavy screens.

⸻

193. Motion Duration

Typical micro-interactions may use approximately:

120–200ms

Longer transitions should be rare.

Respect reduced-motion preferences.

⸻

194. Component Content Rules

Components should be tested with realistic business content.

Do not design only with:

John Doe
ABC Ltd
₹1,000

Test examples such as:

Sri Venkateswara Electricals & Home Appliances
₹12,45,67,890
INV/HYD/2026-27/001245

⸻

195. Long Text Testing

Components should be tested with:

* Long Customer Names
* Long Product Names
* Long Addresses
* Large Currency Values
* Long Email Addresses
* International Phone Numbers
* Long Notes

⸻

196. Empty Content

Components should handle missing optional data.

Example:

Instead of:

Phone:

with nothing after it, consider:

Not available

or omit the field where appropriate.

⸻

197. Zero Is Data

Do not treat:

0

as missing.

Examples:

Stock: 0
Outstanding: ₹0
Discount: 0%

are meaningful values.

⸻

198. Component API Principle

Frontend components should expose clear, reusable APIs.

Avoid components tied to one screen’s exact data structure.

Example:

Prefer a reusable:

StatusBadge

over:

LeadStatusBlueBadge

⸻

199. Domain Components

Domain-specific reusable components are acceptable when they encapsulate real business behavior.

Examples:

ProductSelector
CustomerSelector
MoneyDisplay
StatusBadge
LineItemEditor
CommunicationComposer
RecordActivityTimeline

These should still use design-system primitives.

⸻

200. Money Display

Use a reusable money-display pattern.

Responsibilities:

* Correct Locale Formatting
* Currency Symbol
* Decimal Handling
* Negative Values
* Tabular Numerals

Initial locale:

en-IN

Example:

₹12,50,000

Do not manually concatenate currency strings throughout the application.

⸻

201. Quantity Display

Quantity should optionally support units.

Examples:

24 pcs
12 coils
50 boxes

Units should come from product/domain data rather than hardcoded UI assumptions.

⸻

202. Percentage Display

Use consistent formatting.

Examples:

12%
12.5%

Do not show unnecessary decimals.

⸻

203. Phone Display

Reusable phone presentation should support:

* Country Code
* Click-to-call
* Copy
* WhatsApp where supported

Example:

+91 98765 43210

⸻

204. Address Display

Address component may support:

Address Lines
City
State
Postal Code
Country
Copy
Map Link where appropriate

Do not overload simple list screens with full addresses.

⸻

205. User Assignment

Assignment component should support:

* Current Owner
* Search Team Member
* Reassign
* Unassigned State

Permission checks must apply.

⸻

206. Status Transition

Status updates may use:

Dropdown
Popover
Pipeline Movement
Dedicated Action

depending on complexity.

If transition requires additional information, do not perform it instantly.

Example:

Changing opportunity to:

Lost

may require:

Loss Reason

if defined in CRM requirements.

⸻

207. Action Menu Priority

Actions should follow:

Primary
↓
Secondary
↓
More

Avoid showing every possible action simultaneously.

⸻

208. Context Preservation

When users open drawers/modals from filtered lists, returning should preserve:

* Search
* Filters
* Sort
* Pagination
* Scroll Position where practical

Do not make users rebuild context after every detail interaction.

⸻

209. Deep Linking

Major business records should have stable navigable routes.

Examples:

Lead Detail
Customer Detail
Sales Order
Purchase Order
Invoice

Do not make critical records accessible only through temporary modal state.

⸻

210. Component State Persistence

Where appropriate, preserve user preferences such as:

* Table Columns
* Rows Per Page
* Saved Filters

Only persist settings that provide repeat value.

⸻

211. Figma Responsive Rule

Every major reusable component should be tested at:

Wide Desktop
Standard Desktop
Narrow Container
Mobile where applicable

Do not design components only at one fixed width.

⸻

212. Figma Component Properties

Use component properties for:

* Text
* Boolean Visibility
* Instance Swap
* Variants

Example button properties:

Label
Leading Icon
Trailing Icon
Type
Size
State

Avoid detaching instances merely to change content.

⸻

213. Figma Instance Rule

Screens should use component instances.

Do not recreate components manually.

Do not detach instances unless absolutely necessary and justified.

If detachment repeatedly becomes necessary, the component needs improvement.

⸻

214. Figma Nested Components

Use nested components for reusable internal structures.

Example:

Table
└── Row
    └── Cell
        ├── Text
        ├── Badge
        └── Actions

Avoid over-engineering nesting to the point where editing becomes difficult.

⸻

215. Figma Variables

Components should use variables from:

COLORS.md

and typography styles from:

TYPOGRAPHY.md

Do not hardcode arbitrary colors or text styles.

⸻

216. Figma Auto Layout Direction

Use meaningful nesting.

Example button:

Button
Auto Layout: Horizontal
Align: Center
Gap: 8
Padding: 0 14
Height: 36

Example card:

Card
Auto Layout: Vertical
Padding: 16
Gap: 16

Values may vary by defined component variant.

⸻

217. Figma Constraints

Components should behave correctly when:

* Width increases
* Width decreases
* Text grows
* Optional content disappears
* Icons change
* Data becomes long

Do not rely on fixed-position hacks.

⸻

218. Figma Prototype States

Where useful, prototypes should demonstrate:

* Hover
* Dropdown
* Modal
* Drawer
* Tabs
* Navigation
* Pipeline Movement

Do not prototype every trivial interaction.

⸻

219. Development Component Structure

Frontend should broadly mirror reusable design-system concepts.

Potential organization:

components/
├── ui/
├── forms/
├── data-display/
├── navigation/
├── feedback/
├── overlays/
├── tables/
├── communication/
└── domain/

Exact project structure follows PROJECT_SETUP.md.

⸻

220. UI Components

Generic UI components may include:

Button
Input
Select
Checkbox
Radio
Toggle
Badge
Avatar
Tooltip
Modal
Drawer
Popover
Tabs

⸻

221. Domain Components

Domain components may include:

CustomerSelector
ProductSelector
UserSelector
MoneyDisplay
LineItemEditor
ActivityTimeline
CommunicationComposer
StatusTransition

Do not put domain business logic into generic UI primitives.

⸻

222. Business Logic Separation

Example:

Button

should not know how invoices are created.

Instead:

Invoice Feature
↓
Uses Button
↓
Calls Invoice Service/API

Keep components maintainable.

⸻

223. API State

Data-driven components should explicitly handle:

Initial
Loading
Success
Empty
Error
Refreshing

Do not design only the successful state.

⸻

224. Component Testing

Important reusable components should be tested for:

* Visual States
* Interaction
* Accessibility
* Long Content
* Empty Data
* Loading
* Errors
* Permissions
* Responsive Behavior

⸻

225. Design-to-Code Consistency

Implementation should match:

* Color Tokens
* Typography
* Spacing
* Radius
* Component States
* Interaction Hierarchy

Do not approximate the design system differently screen by screen.

⸻

226. Do Not Duplicate Components

Before creating:

CustomerSelect
LeadCustomerSelect
InvoiceCustomerDropdown
SalesCustomerPicker

determine whether they can all use:

CustomerSelector

with context-specific configuration.

⸻

227. Avoid Mega Components

Do not create components with dozens of unrelated flags such as:

isLead
isInvoice
isPurchase
isCompact
isDashboard
isGreen
isSpecial

Prefer composition and clearly defined variants.

⸻

228. Component Documentation

Important components should document:

Purpose
Variants
States
Usage
Do
Don't
Accessibility
Responsive Behavior

Figma component descriptions should be used where practical.

⸻

229. Component Governance

A new design-system component should be created when:

1. The pattern appears repeatedly.
2. The interaction behavior is consistent.
3. Reuse improves consistency.
4. The component has a clear responsibility.

Do not add every screen-specific layout to the design system.

⸻

230. Component Change Rule

When modifying an existing shared component:

1. Identify all affected usages.
2. Confirm change is globally appropriate.
3. Update Figma component.
4. Update documentation if needed.
5. Update implementation.
6. Test affected modules.

Do not modify a global component to solve one local screen problem.

⸻

231. Claude Design Workflow

Before designing a screen, Claude must:

1. Read PROJECT.md
2. Read relevant module MD
3. Read COLORS.md
4. Read TYPOGRAPHY.md
5. Read COMPONENTS.md
6. Inspect existing Figma components
7. Identify reusable components
8. Identify required states
9. Design using Auto Layout
10. Verify responsive behavior
11. Verify realistic data
12. Verify accessibility

⸻

232. Claude Component Creation Rule

Before creating a new component, Claude must determine:

Does it already exist?
↓
Can it be composed?
↓
Can a variant solve it?
↓
Is the pattern reusable?

Only then should a new shared component be created.

⸻

233. Claude Figma Instruction

Claude must:

* Use Auto Layout
* Use existing Figma variables
* Use existing text styles
* Use component instances
* Avoid detached instances
* Avoid arbitrary colors
* Avoid arbitrary typography
* Avoid arbitrary spacing
* Avoid orphan layers
* Use logical layer names
* Create variants instead of duplicate components
* Test long content
* Design empty/loading/error states where relevant
* Consider responsive behavior
* Preserve accessibility

⸻

234. Claude Development Instruction

Before implementing a component, Claude must:

1. Inspect existing component library.
2. Check whether the component already exists.
3. Reuse design tokens.
4. Reuse typography tokens.
5. Match Figma behavior.
6. Implement required states.
7. Support keyboard interaction.
8. Support accessibility.
9. Handle loading/error states.
10. Handle long content.
11. Handle permissions.
12. Maintain responsive behavior.
13. Avoid unnecessary business logic in generic components.
14. Avoid raw colors where tokens exist.
15. Avoid duplicate components.

⸻

235. Forbidden Practices

Do not:

* Create screen-specific button styles
* Create module-specific component themes
* Use random border radii
* Use random spacing
* Use random colors
* Use arbitrary typography
* Use heavy shadows on every card
* Create rainbow KPI cards
* Create deeply nested navigation
* Show every possible action simultaneously
* Use modals for long workflows
* Shrink desktop tables into unreadable mobile tables
* Detach Figma instances unnecessarily
* Manually position layers that should use Auto Layout
* Create duplicate selectors
* Hide critical errors
* Clear form data after API failure
* Use frontend permissions as security
* Assume every API request succeeds
* Create unsupported integration functionality
* Use destructive styling for ordinary Cancel actions
* Make every status colorful
* Add functionality outside approved project scope

⸻

236. Component Decision Framework

When deciding what UI pattern to use:

Is it a primary action?
→ Primary Button
Is it a secondary action?
→ Secondary / Tertiary Button
Is it contextual?
→ Dropdown / Popover
Is it a short focused task?
→ Modal
Does it need page context?
→ Drawer
Is it a substantial workflow?
→ Full Page
Is it structured repeated data?
→ Table / List
Is it compact status?
→ Badge
Is it temporary feedback?
→ Toast
Is it persistent contextual information?
→ Alert
Is data loading?
→ Skeleton / Spinner
Is no data available?
→ Empty State

⸻

237. Screen Complexity Rule

When a screen becomes visually complex, do not solve it by:

Adding more cards
Adding more colors
Adding more tabs
Adding more icons

Instead evaluate:

Information Priority
Progressive Disclosure
Grouping
Filtering
Navigation
Contextual Actions

⸻

238. Business Workflow Principle

The CRM should optimize for frequent real-world distributor workflows.

Examples:

Lead
↓
Follow-up
↓
Quotation
↓
Sales Order
↓
Invoice
↓
Payment

and:

Stock Requirement
↓
Purchase Order
↓
Goods Receipt
↓
Inventory Update

Components should help users move through these workflows without repeatedly re-entering information.

⸻

239. Sales Team Principle

Because team and lead tracking are primary objectives, components should especially optimize:

* Lead Capture
* Assignment
* Follow-up
* Calls
* WhatsApp
* Email
* SMS
* Notes
* Status Updates
* Opportunity Tracking
* Quick Customer Lookup
* Mobile Readiness

These workflows should remain faster than administrative workflows.

⸻

240. Distributor Principle

This is not a generic SaaS dashboard.

It is an operational CRM for an electrical products distributor handling:

* Lights
* Fans
* Wires
* Switches
* Customers
* Dealers
* Leads
* Sales Team
* Quotations
* Orders
* Inventory
* Purchase
* Billing
* Payments

Component decisions should reflect actual distributor workflows.

⸻

241. Final Component Principle

The component system should make the product feel like one coherent application.

Users should not feel that:

CRM
Sales
Inventory
Purchase
Billing
Reports

were built as separate products.

They should share:

Buttons
Inputs
Tables
Status Language
Cards
Navigation
Forms
Overlays
Feedback
Spacing
Typography
Colors
Interaction Patterns

The design system succeeds when new screens can mostly be assembled from existing components rather than designed from scratch.

The desired experience is:

Lightweight enough for daily sales use.

Structured enough for operational control.

Fast enough for lead management.

Reliable enough for billing and inventory.

Premium without unnecessary decoration.

Responsive enough to support a future mobile application.

Consistent enough that users learn an interaction once and understand it everywhere.
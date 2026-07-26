TYPOGRAPHY.md

Electrical Distribution CRM — Typography Design System

Version: 1.0
Status: Design System Specification
Category: Design System — Typography
Parent Document: PROJECT.md
Related Documents: CLAUDE.md, COLORS.md, COMPONENTS.md

⸻

1. Purpose

This document defines the authoritative typography system for the Electrical Distribution CRM.

It governs typography across:

* Web Application
* Future Mobile Application
* CRM
* Sales
* Inventory
* Purchase
* Billing
* Reports
* Communication
* Forms
* Tables
* Dashboards
* Drawers
* Modals
* Documents
* Figma Designs
* Application Components

Claude must use this document as the source of truth for typography.

Do not introduce arbitrary:

* Font Families
* Font Sizes
* Font Weights
* Line Heights
* Letter Spacing
* Heading Styles

inside individual screens.

⸻

2. Typography Goals

Typography should make the application feel:

* Premium
* Lightweight
* Professional
* Calm
* Modern
* Precise
* Highly Readable
* Business-focused

The system must work particularly well for:

* Dense CRM Records
* Large Tables
* Customer Information
* Product Catalogs
* Sales Data
* Inventory Quantities
* Purchase Information
* Invoice Values
* Financial Figures
* Reports
* Forms

Typography should provide hierarchy without making the interface feel oversized.

⸻

3. Font Families

The application uses two primary font families.

Display / Page Title Font

Merriweather

Use selectively for:

* Major Page Titles
* Important High-level Empty-state Titles
* Select Authentication / Welcome Headings
* Rare High-level Presentation Moments

Merriweather should NOT become the general interface font.

⸻

Interface Font

Inter

Use for:

* Navigation
* Buttons
* Inputs
* Tables
* Forms
* Cards
* Labels
* Body Text
* Numbers
* Reports
* Filters
* Badges
* Tabs
* Tooltips
* Modals
* Drawers
* Operational Headings
* Data-heavy UI

Inter is the primary working font of the application.

⸻

4. Typography Principle

The typography model should broadly follow:

Merriweather
→ High-level identity and page-level hierarchy
Inter
→ Everything users operate, scan, compare, enter, and manage

Do not alternate fonts merely for visual variety.

⸻

5. Font Stack

Merriweather

Conceptual stack:

"Merriweather", Georgia, serif

Inter

Conceptual stack:

"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Exact implementation should follow PROJECT_SETUP.md.

⸻

6. Font Loading

Only required font weights should be loaded.

Recommended Merriweather weights:

400
700

Recommended Inter weights:

400
500
600
700

Avoid loading every available weight.

⸻

7. Font Weight Philosophy

Use weight intentionally.

400 — Regular

Use for:

* Body Text
* Descriptions
* Table Data
* Supporting Information

500 — Medium

Use for:

* Labels
* Navigation
* Table Headers
* Secondary Buttons
* Important Metadata

600 — Semibold

Use for:

* Section Headings
* Card Titles
* Primary Buttons
* Important Values
* Operational Headings

700 — Bold

Use sparingly for:

* Major Metrics
* Strong Page-level Emphasis
* Merriweather Titles where required

Do not make the entire application semibold.

⸻

8. Base Font Size

Primary interface body size:

14px

This is intentional.

The CRM contains:

* Tables
* Forms
* Product Information
* Customer Data
* Financial Information
* Operational Workflows

A 14px base interface size provides good information density while remaining readable.

Long-form explanatory content may use 16px.

⸻

9. Typography Scale

Use the following controlled scale:

12px
13px
14px
16px
18px
20px
24px
28px
32px

Avoid arbitrary sizes such as:

15px
17px
19px
21px
22px
26px
30px

unless a design-system update explicitly introduces them.

⸻

10. Core Text Styles

The primary typography styles are:

Display
Page Title
Section Title
Subsection Title
Card Title
Body Large
Body
Body Small
Label
Label Small
Caption
Button
Table Header
Table Body
Metric Large
Metric
Numeric Data
Link

These should become reusable Figma text styles and implementation tokens.

⸻

11. Display

Use very sparingly.

Font Family     Merriweather
Font Size       32px
Font Weight     700
Line Height     42px
Letter Spacing  -0.3px

Token:

typography.display

Possible use:

* Welcome Screen
* Authentication
* Rare High-level Product Moment

Do not use this inside routine operational dashboards.

⸻

12. Page Title

Primary page title:

Font Family     Merriweather
Font Size       24px
Font Weight     700
Line Height     32px
Letter Spacing  -0.2px

Token:

typography.page-title

Examples:

Contacts
Sales
Inventory
Purchase Orders
Billing
Reports

Page titles should feel distinctive without becoming oversized.

⸻

13. Operational Page Title Alternative

Some dense operational screens may benefit from Inter instead of Merriweather.

Example:

Invoice INV/HYD/2026-27/001245

Recommended:

Font Family     Inter
Font Size       20px
Font Weight     600
Line Height     28px
Letter Spacing  -0.1px

Token:

typography.page-title-operational

Use when the title itself contains operational data or identifiers.

⸻

14. Section Title

Font Family     Inter
Font Size       18px
Font Weight     600
Line Height     26px
Letter Spacing  -0.1px

Token:

typography.section-title

Examples:

Contact Information
Order Details
Payment History
Stock Availability
Sales Performance

⸻

15. Subsection Title

Font Family     Inter
Font Size       16px
Font Weight     600
Line Height     24px
Letter Spacing  0

Token:

typography.subsection-title

Use for nested content groups.

⸻

16. Card Title

Font Family     Inter
Font Size       14px
Font Weight     600
Line Height     20px
Letter Spacing  0

Token:

typography.card-title

Examples:

Recent Leads
Outstanding Invoices
Low Stock
Upcoming Follow-ups

⸻

17. Body Large

Font Family     Inter
Font Size       16px
Font Weight     400
Line Height     24px
Letter Spacing  0

Token:

typography.body-large

Use for:

* Introductory Text
* Important Descriptions
* Empty-state Descriptions
* Longer Reading Content

⸻

18. Body

Primary application body:

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px
Letter Spacing  0

Token:

typography.body

Use extensively across the application.

⸻

19. Body Small

Font Family     Inter
Font Size       13px
Font Weight     400
Line Height     18px
Letter Spacing  0

Token:

typography.body-small

Use for:

* Secondary Descriptions
* Compact Information
* Table Supporting Data
* Metadata

⸻

20. Label

Primary form label:

Font Family     Inter
Font Size       14px
Font Weight     500
Line Height     20px
Letter Spacing  0

Token:

typography.label

Examples:

Customer Name
Phone Number
Payment Terms
Warehouse

⸻

21. Label Small

Font Family     Inter
Font Size       12px
Font Weight     500
Line Height     16px
Letter Spacing  0

Token:

typography.label-small

Use for compact controls or supporting labels.

⸻

22. Caption

Font Family     Inter
Font Size       12px
Font Weight     400
Line Height     16px
Letter Spacing  0

Token:

typography.caption

Use for:

* Timestamps
* Supporting Metadata
* Secondary Notes
* Helper Information

Do not use caption size for important information.

⸻

23. Button Text

Font Family     Inter
Font Size       14px
Font Weight     600
Line Height     20px
Letter Spacing  0

Token:

typography.button

Examples:

Add Lead
Create Order
Save Changes
Send Invoice

Avoid uppercase buttons.

Use:

Create Order

Not:

CREATE ORDER

⸻

24. Small Button Text

For compact controls:

Font Family     Inter
Font Size       13px
Font Weight     600
Line Height     18px
Letter Spacing  0

Token:

typography.button-small

⸻

25. Navigation Text

Sidebar navigation:

Font Family     Inter
Font Size       14px
Font Weight     500
Line Height     20px
Letter Spacing  0

Token:

typography.navigation

Active navigation may remain 500 or move to 600 when stronger emphasis is required.

Do not rely only on font weight to indicate active navigation.

⸻

26. Navigation Group Label

Font Family     Inter
Font Size       12px
Font Weight     500
Line Height     16px
Letter Spacing  0.2px

Token:

typography.navigation-label

Prefer title case.

Avoid aggressive uppercase section labels.

⸻

27. Tabs

Font Family     Inter
Font Size       14px
Font Weight     500
Line Height     20px
Letter Spacing  0

Token:

typography.tab

Active tab may use 600 where needed.

⸻

28. Input Text

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px
Letter Spacing  0

Token:

typography.input

⸻

29. Placeholder

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px
Letter Spacing  0

Token:

typography.placeholder

Placeholder hierarchy should come primarily from color rather than smaller typography.

⸻

30. Helper Text

Font Family     Inter
Font Size       12px
Font Weight     400
Line Height     16px
Letter Spacing  0

Token:

typography.helper

⸻

31. Validation Text

Font Family     Inter
Font Size       12px
Font Weight     400
Line Height     16px
Letter Spacing  0

Token:

typography.validation

Error meaning should be communicated through both text and semantic color.

⸻

32. Table Header

Font Family     Inter
Font Size       12px
Font Weight     600
Line Height     16px
Letter Spacing  0.1px

Token:

typography.table-header

Use title case:

Customer Name

Avoid:

CUSTOMER NAME

⸻

33. Table Body

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px
Letter Spacing  0

Token:

typography.table-body

⸻

34. Table Primary Value

Important table-cell information may use:

Font Family     Inter
Font Size       14px
Font Weight     500
Line Height     20px

Token:

typography.table-primary

Example:

Sri Lakshmi Electricals

with supporting data:

Hyderabad • Customer since 2024

using body-small or caption.

⸻

35. Table Numeric Data

Font Family     Inter
Font Size       14px
Font Weight     400 / 500
Line Height     20px
Font Variant    Tabular Numbers where supported

Token:

typography.table-number

Tabular numerals are strongly recommended for columns containing:

* Quantity
* Price
* Invoice Total
* Outstanding
* Percentages
* Stock
* Dates where appropriate

⸻

36. Numeric Typography

Operational numbers should use Inter.

Examples:

1,250
₹1,25,000
18.4%
INV-001245

Do not use Merriweather for transactional numbers.

⸻

37. Tabular Numerals

Where supported, use:

font-variant-numeric: tabular-nums;

for:

* Financial Tables
* Inventory Quantities
* Reports
* KPI Comparisons
* Invoice Data
* Purchase Data

This improves vertical alignment.

⸻

38. Financial Figures

Primary financial figure:

Font Family     Inter
Font Size       14px
Font Weight     500
Line Height     20px
Font Variant    Tabular Numbers

Example:

₹1,25,000.00

Use decimals only when the context requires them.

⸻

39. Currency Formatting

For the initial Indian deployment, use Indian number grouping.

Prefer:

₹12,50,000

instead of:

₹1,250,000

Where decimals are necessary:

₹12,50,000.00

Do not mix number-formatting conventions within the same application.

⸻

40. Large Metric

For important dashboard KPIs:

Font Family     Inter
Font Size       28px
Font Weight     600
Line Height     36px
Letter Spacing  -0.3px
Font Variant    Tabular Numbers

Token:

typography.metric-large

Example:

₹18,40,000

⸻

41. Standard Metric

Font Family     Inter
Font Size       20px
Font Weight     600
Line Height     28px
Letter Spacing  -0.1px
Font Variant    Tabular Numbers

Token:

typography.metric

Use for compact dashboard cards.

⸻

42. Metric Label

Font Family     Inter
Font Size       13px
Font Weight     500
Line Height     18px

Token:

typography.metric-label

Example:

Monthly Sales

⸻

43. Metric Supporting Information

Font Family     Inter
Font Size       12px
Font Weight     400 / 500
Line Height     16px

Example:

8.4% vs last month

Use semantic color only when the business meaning is understood.

⸻

44. Dashboard Typography

Dashboard hierarchy should generally be:

Page Title
↓
Metric Label
Metric Value
Supporting Comparison
↓
Section Title
↓
Card / Table Content

Avoid oversized numbers competing across the entire dashboard.

⸻

45. Report Chart Typography

Chart labels:

Inter
12px
400

Chart axis:

Inter
12px
400

Chart legend:

Inter
12px
400 / 500

Chart tooltip:

Inter
12px / 13px

Chart title:

Inter
14px
600

Charts should not introduce a separate typography system.

⸻

46. Badge Typography

Font Family     Inter
Font Size       12px
Font Weight     500
Line Height     16px
Letter Spacing  0

Token:

typography.badge

Examples:

Qualified
Paid
Low Stock
Overdue

Avoid uppercase badge labels.

⸻

47. Tooltip Typography

Font Family     Inter
Font Size       12px
Font Weight     400
Line Height     16px

Token:

typography.tooltip

Tooltips should remain concise.

⸻

48. Toast Typography

Title:

Inter
14px
600
20px

Message:

Inter
13px
400
18px

Do not use Merriweather in notifications.

⸻

49. Modal Title

Font Family     Inter
Font Size       18px
Font Weight     600
Line Height     26px

Token:

typography.modal-title

Merriweather should generally not be used inside modals.

⸻

50. Drawer Title

Font Family     Inter
Font Size       18px
Font Weight     600
Line Height     26px

Token:

typography.drawer-title

⸻

51. Dialog Supporting Text

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px

⸻

52. Breadcrumb

Font Family     Inter
Font Size       13px
Font Weight     400 / 500
Line Height     18px

Token:

typography.breadcrumb

Current location may use 500.

⸻

53. Link Typography

Standard inline links inherit surrounding typography.

Use:

Font Weight     500 where emphasis is required

Do not underline every application link by default if color and interaction clearly communicate clickability.

However, accessibility and context should determine final treatment.

⸻

54. Record Identifier

Operational identifiers such as:

SO-2026-00124
PO-2026-00458
INV/HYD/2026-27/001245

should use:

Font Family     Inter
Font Size       13px / 14px
Font Weight     500
Font Variant    Tabular Numbers where useful

Do not use decorative monospace typography unless there is a clear technical requirement.

⸻

55. Customer Names

Customer names should normally use:

Inter
14px
500

when appearing in lists/tables.

On customer detail screens:

Inter
20px
600

may be used as the operational record title.

⸻

56. Product Names

Product names should normally use:

Inter
14px
500

SKU/model information:

Inter
12px / 13px
400

Avoid oversized product names in operational screens.

⸻

57. Product SKU

Example:

FAN-ATOM-1200-WHT

Recommended:

Inter
12px / 13px
500

A monospace font is not necessary.

⸻

58. Dates

Dates should use Inter.

Recommended application format should be consistent.

Example:

26 Jul 2026

For compact tables:

26 Jul 2026

For timestamps:

26 Jul 2026, 10:45 AM

Do not mix:

26/07/26
07/26/2026
2026-07-26
26 Jul 2026

across the interface without a functional reason.

⸻

59. Relative Time

Relative time may be useful for recent activity:

5 min ago
2 hours ago
Yesterday

When exact timing matters, provide the absolute timestamp through context or tooltip.

⸻

60. Phone Numbers

Phone numbers should remain easy to scan.

Example:

+91 98765 43210

Use Inter regular or medium.

Do not reduce phone numbers to caption size when they are primary contact information.

⸻

61. Email Addresses

Use:

Inter
14px
400

Long email addresses may truncate in compact layouts, but the full address should remain accessible.

⸻

62. Long Text

Long notes/descriptions should use:

Inter
14px / 16px
400
Line Height 20px / 24px

Do not use dense 12px typography for paragraphs.

⸻

63. Notes & Activity Content

Activity timeline message:

Inter
14px
400
20px

Author:

Inter
13px
500
18px

Timestamp:

Inter
12px
400
16px

This provides clear hierarchy without visual noise.

⸻

64. Form Typography Hierarchy

A form field should generally follow:

Label
↓
Input
↓
Helper / Validation

Recommended:

Label        14px / 500
Input        14px / 400
Helper       12px / 400

Do not use oversized form labels.

⸻

65. Required Field Indicator

Example:

Customer Name *

The asterisk should inherit label typography.

Color may use the danger semantic token.

Do not make required indicators visually dominant.

⸻

66. Optional Fields

Where useful:

GSTIN (Optional)

Optional may use secondary text color but should generally retain the same label size.

⸻

67. Section Description

Below a section title:

Inter
14px
400
20px

Use secondary text color.

Avoid long explanatory paragraphs in routine screens.

⸻

68. Empty State Title

Font Family     Inter
Font Size       16px
Font Weight     600
Line Height     24px

Token:

typography.empty-title

Merriweather may be used only for rare major empty states.

⸻

69. Empty State Description

Font Family     Inter
Font Size       14px
Font Weight     400
Line Height     20px

Token:

typography.empty-description

⸻

70. Error Page Typography

Major error title:

Merriweather
24px
700
32px

Description:

Inter
14px / 16px
400

Action:

Standard button typography.

⸻

71. Authentication Typography

Authentication screens may use slightly more expressive hierarchy.

Title:

Merriweather
28px
700
38px

Description:

Inter
14px / 16px
400

Form:

Standard application typography.

Do not introduce another font system for authentication.

⸻

72. Invoice Typography

Generated invoice documents should prioritize readability.

Recommended general structure:

Document Title       Inter / Merriweather where branding permits
Company Details      Inter
Customer Details     Inter
Table Header         Inter 10–11pt / 600
Table Body           Inter 10–11pt / 400
Totals               Inter 11–12pt / 600
Terms                Inter 9–10pt / 400

PDF typography may require technical font substitutions depending on document-generation infrastructure.

Visual hierarchy should remain consistent with the application.

⸻

73. Quotation Typography

Quotation documents should use the same document typography principles as invoices.

Avoid creating a completely different visual identity for:

* Quotation
* Sales Order
* Purchase Order
* Invoice
* Receipt

They belong to the same business.

⸻

74. Purchase Order Typography

PO documents should prioritize:

* Supplier
* PO Number
* Product
* Quantity
* Price
* Delivery Information
* Total

Typography should support scanning and printing.

⸻

75. Financial Document Numbers

Important totals may use stronger weight.

Example:

Grand Total
₹1,48,750

Recommended:

Label     Inter 12–14px / 500
Value     Inter 16–18px / 600

Avoid oversized invoice totals.

⸻

76. Text Alignment

Default:

Left Align

Use right alignment for numeric table columns where comparison benefits.

Examples:

Quantity
Price
Tax
Total
Outstanding

Do not center-align large data tables.

⸻

77. Numeric Alignment

Financial and quantity columns should generally be right-aligned.

Example:

Product                  Qty        Rate          Total
Atomberg Fan               12      ₹4,500       ₹54,000
Wire Coil                  25      ₹2,250       ₹56,250

This improves numeric comparison.

⸻

78. Table Header Alignment

Table headers should follow the alignment of the underlying data.

Text column:

Left

Numeric column:

Right

Selection/action columns may use appropriate control alignment.

⸻

79. Line Length

Long-form text should avoid excessively wide lines.

Recommended reading width:

Approximately 60–80 characters

Operational UI does not require strict reading-width constraints for tables and forms.

⸻

80. Line Height Principle

Dense UI:

Font Size × approximately 1.4–1.5

Long-form content:

Font Size × approximately 1.5

Do not use cramped line heights simply to fit more data.

⸻

81. Letter Spacing

Default body text:

0

Large headings may use slightly negative spacing.

Small labels may use slight positive spacing where necessary.

Avoid exaggerated letter spacing.

⸻

82. Capitalization

Preferred:

Sentence case

or natural title case where appropriate.

Examples:

Create sales order
Payment history
Customer information

Avoid excessive:

CUSTOMER INFORMATION

Uppercase should be reserved for standardized abbreviations such as:

GSTIN
SKU
PO
GST
HSN

⸻

83. Button Capitalization

Use:

Add lead
Create quotation
Send invoice
Record payment

Do not use:

ADD LEAD
CREATE QUOTATION
SEND INVOICE

⸻

84. Navigation Capitalization

Use natural labels:

Dashboard
CRM
Sales
Inventory
Purchase
Billing
Reports

Avoid stylized uppercase navigation.

⸻

85. Truncation

Use truncation when necessary in:

* Tables
* Compact Cards
* Navigation
* Breadcrumbs
* Select Controls

Example:

Sri Venkateswara Electrical Distribut...

The complete value should remain accessible through:

* Tooltip
* Detail View
* Expanded State

depending on context.

⸻

86. Important Data Must Not Be Hidden

Do not truncate critical information when users need the full value to make a decision.

Examples:

* Invoice Total
* Outstanding
* Quantity
* Payment Status
* Critical Error Message

Layout should adapt instead.

⸻

87. Multi-Line Truncation

Descriptions may use:

2-line clamp

or:

3-line clamp

where appropriate.

Do not clamp operational notes when the complete note is necessary for the workflow.

⸻

88. Responsive Typography

Typography should remain relatively stable across desktop and mobile.

Avoid dramatic responsive scaling.

Example:

Desktop Page Title:

24px

Mobile Page Title:

20px

Body:

14px

may remain consistent.

⸻

89. Mobile Page Title

Recommended:

Font Family     Merriweather
Font Size       20px
Font Weight     700
Line Height     28px

For operational records:

Inter
18px
600
26px

⸻

90. Mobile Body

Primary mobile body:

Inter
14px
400
20px

Do not shrink text merely to fit desktop density onto mobile.

Mobile layouts should adapt structurally.

⸻

91. Mobile Form Inputs

Mobile input text should generally be at least:

16px

where required to avoid browser zoom behavior and improve touch usability.

The implementation may therefore use mobile-specific input sizing while retaining the same semantic typography role.

⸻

92. Mobile Tables

Do not solve wide desktop tables by reducing typography to unreadable sizes.

Instead consider:

* Priority Columns
* Horizontal Scrolling
* Cards
* Expandable Rows
* Detail Views

Typography should remain readable.

⸻

93. Accessibility

Typography should support WCAG accessibility requirements.

Important principles:

* Do not use tiny text for important information.
* Maintain sufficient color contrast.
* Support browser zoom.
* Avoid fixed-height containers that clip enlarged text.
* Do not rely only on font weight to communicate state.
* Ensure interactive text remains identifiable.

⸻

94. Browser Zoom

The interface should remain usable at:

200% browser zoom

where reasonably applicable.

Layouts should reflow rather than clip important information.

⸻

95. Font Weight Accessibility

Do not use:

Inter 300

for important body text.

Regular 400 should be the minimum standard body weight.

⸻

96. Font Size Accessibility

Avoid routine use below:

12px

Text below 12px should require a specific justified design-system exception.

⸻

97. Premium Typography Principle

Premium typography does NOT mean:

* Huge Headings
* Excessive Serif Usage
* Thin Fonts
* Excessive Font Weights
* Oversized Metrics
* Decorative Letter Spacing

Premium typography comes from:

Consistent Hierarchy
+
Excellent Spacing
+
Readable Line Heights
+
Controlled Weight
+
Strong Alignment
+
Restraint

⸻

98. Lightweight Typography Principle

Operational screens should feel efficient.

Example hierarchy:

Contacts                       ← Merriweather 24
Manage customer relationships  ← Inter 14
Customer Name     Phone     Owner     Status
──────────────────────────────────────────────
ABC Electricals   ...       ...       ...

The title establishes identity.

The interface beneath it stays compact.

⸻

99. Merriweather Usage Restriction

Merriweather should NOT be used for:

* Buttons
* Inputs
* Table Headers
* Table Rows
* Navigation
* Tabs
* Badges
* Filters
* Dropdowns
* KPI Values
* Financial Figures
* Tooltips
* Toasts
* Operational IDs

Use it only where page-level visual identity benefits.

⸻

100. Inter Usage

Inter should account for the large majority of application text.

Expected:

Approximately 90%+ of UI typography

This keeps the CRM cohesive and highly readable.

⸻

101. Typography Hierarchy Example

A customer detail screen may follow:

Sri Lakshmi Electricals
Merriweather / 24 / 700
Customer since March 2024
Inter / 13 / 400
Outstanding
Inter / 13 / 500
₹2,45,000
Inter / 20 / 600
Contact Information
Inter / 18 / 600
Primary Contact
Inter / 14 / 500
Ramesh Kumar
Inter / 14 / 400

⸻

102. Billing Typography Example

Invoice INV/HYD/2026-27/001245
Inter / 20 / 600
Sri Lakshmi Electricals
Inter / 14 / 500
Invoice Total
Inter / 13 / 500
₹1,48,750
Inter / 20 / 600
Outstanding
Inter / 13 / 500
₹48,750
Inter / 20 / 600

Operational record titles use Inter rather than Merriweather.

⸻

103. Inventory Typography Example

Inventory
Merriweather / 24 / 700
Atomberg Renesa 1200mm
Inter / 14 / 500
SKU: FAN-REN-1200-WHT
Inter / 12 / 400
Available
Inter / 12 / 500
124
Inter / 14 / 500

⸻

104. Report Typography Example

Sales Performance
Merriweather / 24 / 700
Total Sales
Inter / 13 / 500
₹42,50,000
Inter / 28 / 600
12.4% vs previous month
Inter / 12 / 500
Sales by Month
Inter / 14 / 600

⸻

105. Typography Token Structure

Recommended conceptual token hierarchy:

Typography/
├── Display
├── Page Title
├── Page Title Operational
├── Section Title
├── Subsection Title
├── Card Title
│
├── Body/
│   ├── Large
│   ├── Default
│   └── Small
│
├── Label/
│   ├── Default
│   └── Small
│
├── Caption
├── Helper
├── Validation
│
├── Button/
│   ├── Default
│   └── Small
│
├── Navigation
├── Navigation Label
├── Tab
│
├── Input
├── Placeholder
│
├── Table/
│   ├── Header
│   ├── Body
│   ├── Primary
│   └── Number
│
├── Metric/
│   ├── Large
│   ├── Default
│   └── Label
│
├── Badge
├── Tooltip
├── Modal Title
├── Drawer Title
├── Breadcrumb
└── Empty State

⸻

106. Figma Text Styles

Figma should contain reusable text styles corresponding to semantic typography roles.

Recommended naming:

Typography/Display
Typography/Page Title
Typography/Page Title Operational
Typography/Section Title
Typography/Subsection Title
Typography/Card Title
Typography/Body/Large
Typography/Body/Default
Typography/Body/Small
Typography/Label/Default
Typography/Label/Small
Typography/Caption
Typography/Button/Default
Typography/Button/Small
Typography/Navigation/Default
Typography/Navigation/Label
Typography/Input
Typography/Table/Header
Typography/Table/Body
Typography/Table/Primary
Typography/Table/Number
Typography/Metric/Large
Typography/Metric/Default
Typography/Metric/Label
Typography/Badge
Typography/Tooltip
Typography/Modal Title
Typography/Drawer Title

⸻

107. Figma Rule

When Claude creates Figma designs:

DO:

Use existing typography styles.

DO NOT:

Manually create 14px Inter Semibold

inside individual screens when an equivalent semantic text style already exists.

⸻

108. Figma Auto Layout

Text layers must behave correctly inside Auto Layout.

Use appropriate:

* Hug Contents
* Fill Container
* Fixed Width only where necessary

Avoid manually positioning text.

Long-content behavior should be intentionally designed.

⸻

109. Development Typography Tokens

Components should consume semantic typography tokens/classes.

Conceptually:

PageTitle
→ typography.page-title
SectionTitle
→ typography.section-title
Body
→ typography.body
TableHeader
→ typography.table-header
Metric
→ typography.metric

Do not repeatedly recreate typography definitions inside components.

⸻

110. CSS Variable / Utility Readiness

Typography architecture may map to centralized CSS or Tailwind configuration.

Conceptually:

--font-display
--font-interface
--text-page-title
--text-section-title
--text-body
--text-caption
--text-table
--text-metric

Exact technical implementation should follow the project’s frontend architecture.

⸻

111. Component Ownership

Typography styles belong to the design system.

Individual components may select appropriate typography tokens but should not redefine them.

Example:

Button
→ typography.button
Input
→ typography.input
Table
→ typography.table-body

⸻

112. Content Density

Typography and spacing must work together.

Do not reduce typography below readable sizes to increase density.

Instead adjust:

* Padding
* Information Priority
* Progressive Disclosure
* Column Visibility
* Layout

⸻

113. Information Hierarchy

Before increasing font size, consider:

1. Weight
2. Color
3. Spacing
4. Position
5. Grouping

Font size should not carry the entire hierarchy.

⸻

114. Avoid Excessive Heading Levels

A typical application screen should rarely require more than:

Page Title
↓
Section Title
↓
Card / Subsection Title
↓
Body

Avoid creating:

H1
H2
H3
H4
H5
H6

simply because HTML supports them.

Semantic HTML heading structure should still remain accessible, but visual styles can map appropriately.

⸻

115. Semantic HTML

Visual typography and document semantics are separate concerns.

For example:

<h1>

may visually use:

typography.page-title

while:

<h2>

may use:

typography.section-title

Maintain logical document structure for accessibility.

⸻

116. Dynamic Content

Typography must handle unpredictable business data.

Examples:

* Very Long Customer Names
* Long Product Names
* Long Email Addresses
* Large Financial Values
* Long Invoice Numbers
* Multi-language Customer Names

Do not design only for ideal short sample data.

⸻

117. Large Numbers

Layouts should support values such as:

₹12,45,67,890

without breaking KPI cards.

If space becomes constrained:

* Allow responsive sizing within approved limits
* Increase available width
* Adjust layout

Do not arbitrarily shrink important numbers to tiny text.

⸻

118. Internationalization Readiness

The initial application may primarily use English.

Typography architecture should not assume all future content has identical character widths.

Future localization may require:

* Different Line Lengths
* Different Wrapping
* Font Fallbacks
* Adjusted Component Heights

Do not hardcode layouts around exact English text lengths.

⸻

119. Icon and Text Alignment

Icons used beside text should align optically.

Example:

[icon] Add lead

Icon size should generally relate to text size.

Typical 14px interface text may use:

16px icon

or another component-defined size.

Exact icon sizing belongs in COMPONENTS.md.

⸻

120. Icon-Only Controls

Icon-only buttons require:

* Tooltip where appropriate
* Accessible Name
* Sufficient Touch/Click Target

Typography may not be visible, but semantic labeling is still required.

⸻

121. Typography and Color

Typography hierarchy should work with COLORS.md.

Examples:

Page Title:

typography.page-title
+
color.text.primary

Description:

typography.body
+
color.text.secondary

Caption:

typography.caption
+
color.text.tertiary

Do not create hierarchy through lighter and lighter unreadable gray text.

⸻

122. Typography and Components

COMPONENTS.md should reference this typography system.

Example:

Primary Button
→ typography.button
Input Label
→ typography.label
Input Value
→ typography.input
Table Header
→ typography.table-header
Badge
→ typography.badge

Components should not create independent typography rules.

⸻

123. Forbidden Practices

Do not:

* Introduce additional UI font families
* Use Merriweather throughout the application
* Use font sizes outside the approved scale without justification
* Use uppercase for routine interface labels
* Use font weights below 400 for important text
* Use 12px for important body content
* Use oversized dashboard numbers
* Use different typography by module
* Use random line heights
* Use decorative letter spacing
* Use monospace for ordinary IDs
* Shrink tables to unreadable sizes
* Manually recreate existing Figma text styles
* Use typography to compensate for poor layout

⸻

124. Claude Design Instruction

Before designing any application screen, Claude must:

1. Read TYPOGRAPHY.md.
2. Read COLORS.md.
3. Use existing Figma text styles.
4. Use Merriweather only for approved high-level contexts.
5. Use Inter for operational UI.
6. Use approved font sizes.
7. Use approved weights.
8. Maintain appropriate line heights.
9. Use tabular numerals for financial and numerical comparison where supported.
10. Respect table alignment rules.
11. Design for realistic long content.
12. Avoid unnecessary typography variants.
13. Preserve hierarchy through spacing and layout, not font size alone.
14. Maintain accessibility.
15. Avoid introducing typography outside this system.

⸻

125. Claude Development Instruction

Before implementing typography, Claude must:

1. Read TYPOGRAPHY.md.
2. Inspect existing typography tokens.
3. Inspect Figma styles.
4. Reuse semantic typography definitions.
5. Avoid component-level font definitions where shared tokens exist.
6. Ensure font loading is optimized.
7. Support browser zoom.
8. Preserve responsive typography behavior.
9. Use tabular numerals where appropriate.
10. Verify financial number formatting.
11. Verify text wrapping and truncation.
12. Test long business data.
13. Maintain semantic HTML.
14. Verify implementation against Figma.
15. Do not modify the typography scale without an approved design-system change.

⸻

126. Typography Decision Hierarchy

When deciding which typography style to use:

Is this the main page identity?
↓
Page Title
Is this an operational record title?
↓
Page Title Operational
Is this a major content section?
↓
Section Title
Is this a nested section?
↓
Subsection Title
Is this a card heading?
↓
Card Title
Is this normal content?
↓
Body
Is this supporting content?
↓
Body Small / Caption
Is this a form field name?
↓
Label
Is this table data?
↓
Table Body
Is this a major KPI?
↓
Metric
Is this an operational number?
↓
Numeric / Table Number

Do not create a new style simply because none immediately feels visually interesting.

⸻

127. Typography Quick Reference

DISPLAY
Merriweather / 32 / 700 / 42
PAGE TITLE
Merriweather / 24 / 700 / 32
OPERATIONAL PAGE TITLE
Inter / 20 / 600 / 28
SECTION TITLE
Inter / 18 / 600 / 26
SUBSECTION TITLE
Inter / 16 / 600 / 24
CARD TITLE
Inter / 14 / 600 / 20
BODY LARGE
Inter / 16 / 400 / 24
BODY
Inter / 14 / 400 / 20
BODY SMALL
Inter / 13 / 400 / 18
LABEL
Inter / 14 / 500 / 20
LABEL SMALL
Inter / 12 / 500 / 16
CAPTION
Inter / 12 / 400 / 16
BUTTON
Inter / 14 / 600 / 20
BUTTON SMALL
Inter / 13 / 600 / 18
NAVIGATION
Inter / 14 / 500 / 20
TAB
Inter / 14 / 500 / 20
INPUT
Inter / 14 / 400 / 20
TABLE HEADER
Inter / 12 / 600 / 16
TABLE BODY
Inter / 14 / 400 / 20
TABLE PRIMARY
Inter / 14 / 500 / 20
BADGE
Inter / 12 / 500 / 16
METRIC LARGE
Inter / 28 / 600 / 36
METRIC
Inter / 20 / 600 / 28
METRIC LABEL
Inter / 13 / 500 / 18
TOOLTIP
Inter / 12 / 400 / 16

⸻

128. Final Typography Principle

Typography should make large amounts of business information feel easy to understand.

The system should follow:

Merriweather
→ Identity
Inter
→ Operation
Weight
→ Hierarchy
Spacing
→ Structure
Tabular Numbers
→ Data Clarity
Consistency
→ Premium Experience

The user should be able to quickly distinguish:

* Where they are
* What the screen is about
* What information matters
* What is supporting information
* What can be acted upon
* Which values need comparison

without relying on oversized headings, excessive bold text, or decorative typography.

The typography system succeeds when the CRM feels:

Professional.

Calm.

Compact without feeling cramped.

Premium without being decorative.

Readable even when data-heavy.

Consistent across CRM, Sales, Inventory, Purchase, Billing, and Reports.
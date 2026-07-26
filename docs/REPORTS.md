REPORTS.md

Electrical Distribution CRM — Reports & Analytics Module Specification

Version: 1.0
Status: Product Definition
Module: Reports & Analytics
Parent Document: PROJECT.md
Related Modules: CRM.md, SALES.md, INVENTORY.md, PURCHASE.md, BILLING.md
Technical Foundation: PROJECT_SETUP.md

⸻

1. Purpose

The Reports & Analytics module transforms operational CRM data into useful business information.

It should help the organization answer:

* How many leads are coming in?
* Where are leads coming from?
* How effectively are leads being converted?
* How is each salesperson performing?
* What does the current sales pipeline look like?
* What sales are being generated?
* Which customers generate the most business?
* Which products, brands, and categories perform best?
* What inventory is available?
* What stock is moving slowly?
* What products need replenishment?
* How much are we purchasing?
* Which suppliers are performing well?
* How much have we invoiced?
* How much have we collected?
* How much is outstanding?
* Which customers are overdue?
* Which branches and teams are performing well?
* What requires management attention?

Reports should help users make decisions rather than simply display charts.

⸻

2. Product Goal

The primary goal is:

Give every authorized user the right level of business visibility without requiring spreadsheets, manual calculations, or separate reporting systems for everyday operational decisions.

The reporting experience should be:

* Fast
* Clear
* Actionable
* Role-aware
* Filterable
* Exportable
* Consistent
* Traceable to operational data

⸻

3. Reporting Philosophy

Reports should follow:

Operational Data
↓
Authoritative Domain
↓
Reporting Query / Metric
↓
Business Insight
↓
Action

Reports should never become an independent source of transactional truth.

For example:

CRM
→ Lead Data
Sales
→ Order Data
Inventory
→ Stock Data
Purchase
→ Procurement Data
Billing
→ Invoice / Payment Data

Reports consumes these sources.

⸻

4. Scope

Reports & Analytics includes:

* Management Dashboard
* CRM Reports
* Lead Reports
* Pipeline Reports
* Conversion Reports
* Activity Reports
* Sales Team Reports
* Sales Reports
* Customer Reports
* Product Reports
* Brand Reports
* Category Reports
* Inventory Reports
* Purchase Reports
* Supplier Reports
* Billing Reports
* Collection Reports
* Outstanding Reports
* Branch Reports
* Team Reports
* Communication Reports
* Performance Trends
* Comparative Analysis
* Saved Reports
* Scheduled Reports
* Export
* Drill-down
* Role-based Analytics
* Future AI Insights

⸻

5. Out of Scope

Reports should not become:

* A General Ledger
* A Financial Accounting Engine
* A BI Data Warehouse in the initial release
* A Full Custom SQL Report Builder
* An Unrestricted Database Query Interface
* A Replacement for Statutory Accounting Reports

Advanced enterprise BI may be introduced later if required.

⸻

6. Reporting Categories

The reporting system should be organized around practical business domains.

Recommended categories:

Overview
CRM & Leads
Sales
Customers
Products
Inventory
Purchase
Billing & Collections
Team Performance
Communication

Avoid exposing dozens of unrelated report names in one long menu.

⸻

7. Report Types

The system may support several presentation types.

Summary

High-level KPIs.

Table

Detailed operational records.

Trend

Performance over time.

Comparison

Compare:

* Periods
* Branches
* Teams
* Salespeople
* Products
* Brands

Funnel

Useful for:

* Lead Conversion
* Sales Pipeline

Distribution

Useful for:

* Lead Source
* Product Category
* Payment Method

Visual format should depend on the question being answered.

Do not use charts merely because data exists.

⸻

8. Global Reporting Filters

Common filters may include:

* Date Range
* Branch
* Team
* Salesperson
* Customer
* Lead Source
* Product
* Brand
* Category
* Supplier
* Warehouse
* Status

Only relevant filters should appear for each report.

⸻

9. Date Range

Common presets:

* Today
* Yesterday
* This Week
* Last Week
* This Month
* Last Month
* This Quarter
* Last Quarter
* This Financial Year
* Last Financial Year
* Custom Range

Date semantics must be clear for each metric.

⸻

10. Period Comparison

Where useful, reports may compare:

This Month
vs
Last Month

or:

This Financial Year
vs
Previous Financial Year

Comparison should display:

* Current Value
* Previous Value
* Absolute Difference
* Percentage Change

Avoid implying that every increase is positive or every decrease is negative.

⸻

11. Drill-Down

Summary metrics should support drill-down where useful.

Example:

Total Sales
₹42,50,000
↓
Branch
↓
Salesperson
↓
Customer
↓
Sales Order

Users should be able to move from insight to underlying records.

⸻

12. Drill-Through Principle

Whenever practical:

Report
↓
Metric
↓
Underlying Records

Example:

Overdue Amount
₹8,40,000
↓
View Customers
↓
View Invoices

Reports should not become informational dead ends.

⸻

13. Management Overview

Management should have a concise overview of business health.

Potential sections:

CRM

* New Leads
* Qualified Leads
* Conversion Rate
* Open Opportunities

Sales

* Sales Value
* Orders
* Pipeline Value
* Average Order Value

Inventory

* Stock Value
* Low-stock Products
* Out-of-stock Products
* Dead-stock Value

Purchase

* Purchase Value
* Open POs
* Delayed POs

Billing

* Invoiced
* Collected
* Outstanding
* Overdue

Team

* Sales Performance
* Lead Conversion
* Follow-up Status

The overview should prioritize exceptions and trends.

⸻

14. Management Attention

A useful management area may show:

* High-value Leads Without Follow-up
* Stalled Opportunities
* Orders Awaiting Fulfilment
* Low-stock Critical Products
* Delayed Purchase Orders
* High Customer Outstanding
* Credit Limit Exceptions
* Broken Payment Promises

This may provide more value than additional charts.

⸻

15. CRM Overview Report

Potential metrics:

* Total Leads
* New Leads
* Active Leads
* Qualified Leads
* Lost Leads
* Converted Leads
* Conversion Rate
* Average Conversion Time

Filters:

* Period
* Branch
* Salesperson
* Lead Source

⸻

16. Lead Funnel

Example:

New             1,250
↓
Contacted         940
↓
Qualified         520
↓
Opportunity       310
↓
Won               180

The funnel should use the approved CRM lifecycle.

Do not invent funnel stages inside Reports.

⸻

17. Lead Conversion Rate

Conceptually:

Converted Leads
─────────────── × 100
Eligible Leads

The exact denominator must be defined consistently.

Do not allow different screens to calculate conversion differently.

⸻

18. Lead Source Report

Potential sources:

* Website
* WhatsApp
* Phone
* Referral
* Walk-in
* Campaign
* Salesperson
* Existing Customer
* Import
* Other

Useful metrics:

* Leads
* Qualified
* Converted
* Conversion Rate
* Sales Value

This helps evaluate lead quality rather than just lead volume.

⸻

19. Lead Source Effectiveness

Example:

Source       Leads   Converted   Conversion   Sales
Website       200       25          12.5%      ₹8,50,000
Referral       80       30          37.5%     ₹12,20,000
WhatsApp      150       18          12.0%      ₹6,40,000

This can reveal that a lower-volume source may produce higher-value customers.

⸻

20. Lead Status Report

Show distribution across approved CRM statuses.

Useful for identifying:

* Too Many New Leads
* Contact Backlog
* Qualification Bottlenecks
* Stalled Leads

⸻

21. Lead Ageing

Potential buckets:

* 0–1 Days
* 2–3 Days
* 4–7 Days
* 8–14 Days
* 15–30 Days
* 30+ Days

Exact buckets may be configurable.

This report helps identify neglected leads.

⸻

22. Lead Response Time

Potential metric:

First Meaningful Sales Activity
-
Lead Created Time
=
First Response Time

Useful dimensions:

* Salesperson
* Team
* Lead Source
* Branch

The definition of meaningful response must be explicit.

⸻

23. Lead Follow-up Report

Potential metrics:

* Follow-ups Due
* Follow-ups Completed
* Follow-ups Missed
* Leads Without Next Action
* Leads Without Recent Activity

This should be operationally useful for sales managers.

⸻

24. Lost Lead Report

Potential dimensions:

* Lost Reason
* Salesperson
* Lead Source
* Product Interest
* Competitor
* Period

This helps understand why leads fail to convert.

⸻

25. Lost Reason Analysis

Potential reasons may include approved CRM reasons such as:

* Price
* No Requirement
* Competitor
* Product Unavailable
* No Response
* Delivery Timeline
* Credit Terms
* Other

Reports should consume configured reasons rather than maintaining a separate list.

⸻

26. Pipeline Report

Potential information:

* Pipeline Value
* Opportunities
* Stage Distribution
* Expected Closing
* Salesperson
* Customer
* Probability where approved

⸻

27. Pipeline by Stage

Example:

Qualification        ₹12,00,000
Quotation            ₹28,00,000
Negotiation          ₹18,50,000
Approval              ₹9,00,000

Stages should come from SALES.md.

⸻

28. Pipeline by Salesperson

Potential columns:

* Salesperson
* Opportunities
* Pipeline Value
* Weighted Pipeline
* Won Value
* Conversion Rate

Weighted pipeline should only be used if opportunity probabilities are part of the approved Sales model.

⸻

29. Pipeline Ageing

Identify opportunities that have remained too long in a stage.

Potential information:

* Opportunity
* Customer
* Stage
* Value
* Days in Stage
* Owner
* Next Action

This should support direct navigation to the opportunity.

⸻

30. Sales Overview

Potential metrics:

* Sales Orders
* Sales Value
* Average Order Value
* Quantity Sold
* Customers
* New Customers
* Repeat Customers

Filters:

* Date
* Branch
* Salesperson
* Product
* Brand
* Category

⸻

31. Sales Trend

Potential periods:

* Daily
* Weekly
* Monthly
* Quarterly
* Financial Year

The chart granularity should adapt to the selected date range.

⸻

32. Salesperson Performance

Potential metrics:

* Leads Assigned
* Leads Converted
* Conversion Rate
* Opportunities Won
* Sales Orders
* Sales Value
* Average Order Value
* Collection Amount where permitted
* Outstanding where permitted

Avoid reducing performance to one opaque score.

⸻

33. Sales Team Performance

Potential comparison:

Salesperson     Leads   Converted   Orders   Sales
Person A         120       25         20      ₹8,40,000
Person B          90       28         24     ₹10,20,000
Person C         150       20         18      ₹7,10,000

Managers should be able to understand the reason behind performance differences.

⸻

34. Target vs Achievement

If sales targets are introduced:

Target        ₹20,00,000
Achievement   ₹17,50,000
Achievement       87.5%

Targets may exist by:

* Salesperson
* Team
* Branch
* Period

Target functionality should only be introduced if approved as part of Sales/Team scope.

⸻

35. Customer Sales Report

Potential columns:

* Customer
* Sales Value
* Orders
* Average Order Value
* Last Order
* Outstanding
* Salesperson

Useful views:

* Top Customers
* New Customers
* Repeat Customers
* Inactive Customers

⸻

36. Customer 360 Reporting

Authorized users may analyze:

Customer
├── Leads
├── Opportunities
├── Quotations
├── Sales
├── Products Purchased
├── Outstanding
├── Payments
└── Communication

This should consume domain data rather than duplicate it.

⸻

37. Customer Purchase Frequency

Potential metrics:

* First Purchase
* Last Purchase
* Number of Orders
* Average Days Between Orders
* Total Sales Value

Useful for identifying repeat-purchase patterns.

⸻

38. Inactive Customer Report

Potential definition:

Previously Purchased
+
No Sales Activity
>
Configured Period

The inactivity threshold should be configurable.

This may help sales teams identify reactivation opportunities.

⸻

39. Product Sales Report

Potential metrics:

* Product
* Quantity Sold
* Sales Value
* Orders
* Customers
* Average Selling Price

Filters:

* Branch
* Salesperson
* Brand
* Category
* Period

⸻

40. Brand Performance

Electrical distributors may find brand reporting particularly important.

Potential metrics:

* Brand
* Sales Value
* Quantity Sold
* Customers
* Purchase Value
* Stock Value
* Stock Movement

Where commercially appropriate, reports may compare sales and stock position.

⸻

41. Category Performance

Potential categories:

* Lights
* Fans
* Wires
* Switches
* Other approved categories

Metrics:

* Sales
* Quantity
* Customers
* Orders
* Stock
* Purchase

Categories must come from Product Management.

⸻

42. Product Growth

Potential comparison:

Product A
Previous Month    ₹4,20,000
Current Month     ₹5,10,000
Growth            +21.4%

Growth should be calculated against comparable periods.

⸻

43. Product Customer Analysis

Useful questions:

* Which customers buy this product?
* Which salesperson sells it?
* Which branch sells it?
* How frequently is it purchased?

This may help both sales and inventory planning.

⸻

44. Inventory Overview Report

Potential metrics:

* Total Products
* Total On Hand
* Available Stock
* Reserved Stock
* Incoming Stock
* Stock Value
* Low-stock Products
* Out-of-stock Products
* Dead Stock

Cost/value metrics must respect permissions.

⸻

45. Warehouse Stock Report

Potential columns:

* Product
* SKU
* Warehouse
* On Hand
* Reserved
* Available
* Incoming
* Reorder Level

Users should be able to drill into Inventory.

⸻

46. Branch Stock Report

Useful for multi-branch operations.

Potential structure:

Product          Hyderabad   Vijayawada   Visakhapatnam
Fan Model A         250          120           80
Wire Model B        500          300          220

This can help identify transfer opportunities.

⸻

47. Low Stock Report

Potential information:

* Product
* Warehouse
* Available
* Reorder Level
* Incoming
* Open Demand

Quick action may lead to:

* Inventory
* Purchase Requirement

Reports should not independently create procurement transactions unless the approved workflow explicitly supports it.

⸻

48. Out-of-Stock Report

Potential information:

* Product
* Warehouse
* Last Available Date
* Incoming Quantity
* Expected Delivery
* Open Demand

Useful for Sales and Purchase.

⸻

49. Stock Movement Report

Potential columns:

* Date
* Product
* Warehouse
* Movement Type
* Quantity
* Reference
* User

This report should consume the Inventory stock ledger.

⸻

50. Stock Ageing Report

Potential buckets:

* 0–30 Days
* 31–60 Days
* 61–90 Days
* 91–180 Days
* 180+ Days

Useful metrics:

* Quantity
* Stock Value
* Product Count

⸻

51. Slow-Moving Stock

Potential criteria may consider:

* Low outbound movement
* Low sales
* Stock age

The definition should be configurable and transparent.

⸻

52. Dead Stock Report

Potential information:

* Product
* Warehouse
* Quantity
* Value
* Last Movement
* Last Sale
* Days Without Movement

Management may use this for stock optimization.

⸻

53. Inventory Turnover

Where sufficient data exists, inventory turnover may be calculated using an approved financial/operational definition.

Do not invent accounting formulas independently of the business’s chosen valuation approach.

⸻

54. Inventory Accuracy Report

Potential information:

* Stock Counts
* Variances
* Adjustment Quantity
* Adjustment Value
* Warehouse
* Product

Useful for warehouse control.

⸻

55. Purchase Overview

Potential metrics:

* Purchase Value
* Purchase Orders
* Open PO Value
* Pending Quantity
* Delayed POs
* Suppliers
* Average Lead Time

⸻

56. Purchase Trend

Analyze:

* Purchase Value by Month
* Purchase Quantity
* Purchase by Supplier
* Purchase by Brand
* Purchase by Category

⸻

57. Supplier Purchase Report

Potential columns:

* Supplier
* PO Count
* Purchase Value
* Products
* Average Lead Time
* Pending PO Value

⸻

58. Supplier Performance Report

Potential metrics:

* On-time Delivery
* Fill Rate
* Average Lead Time
* Purchase Value
* Return Rate
* Quality Issues

Metrics should remain explainable.

⸻

59. Purchase Price Trend

Potential analysis:

Product X
Jan    ₹1,850
Feb    ₹1,900
Mar    ₹1,875
Apr    ₹1,950

Users may filter by supplier.

This helps procurement understand pricing movement.

⸻

60. Purchase Price Variance

Potential comparison:

Previous Purchase     ₹1,900
Current Purchase      ₹2,000
Variance                 +5.3%

Large changes may be highlighted.

⸻

61. Open Purchase Order Report

Potential columns:

* PO
* Supplier
* Order Date
* Expected Delivery
* Ordered
* Received
* Pending
* Value
* Status

⸻

62. Delayed Purchase Order Report

Potential information:

* PO
* Supplier
* Expected Date
* Days Delayed
* Pending Quantity
* Purchase Executive
* Related Sales Demand

This report should support follow-up.

⸻

63. Billing Overview

Potential metrics:

* Invoiced
* Collected
* Outstanding
* Overdue
* Credit Notes
* Unallocated Payments

Billing remains authoritative for these numbers.

⸻

64. Invoice Register

Potential columns:

* Invoice
* Date
* Customer
* Sales Order
* Taxable Value
* Tax
* Total
* Paid
* Outstanding
* Status

⸻

65. Billing Trend

Potential analysis:

* Daily Billing
* Monthly Billing
* Branch Billing
* Salesperson Billing
* Customer Billing

⸻

66. Collection Report

Potential metrics:

* Amount Due
* Amount Collected
* Collection Rate
* Customers Paying
* Payments
* Average Payment Value

Filters:

* Period
* Branch
* Salesperson
* Customer

⸻

67. Collection Rate

Conceptually:

Eligible Amount Collected
───────────────────────── × 100
Eligible Amount Due

The exact definition must be approved and used consistently.

⸻

68. Outstanding Report

Potential columns:

* Customer
* Outstanding
* Overdue
* Oldest Due Date
* Oldest Overdue Days
* Credit Limit
* Salesperson
* Last Payment

This is a critical operational report.

⸻

69. Outstanding Ageing

Potential buckets:

Current
1–30 Days
31–60 Days
61–90 Days
91–180 Days
180+ Days

Show both:

* Customer Count
* Outstanding Amount

⸻

70. Salesperson Outstanding

Potential columns:

* Salesperson
* Customers
* Total Outstanding
* Overdue
* 30+ Days
* 60+ Days
* 90+ Days

This helps sales managers coordinate collections.

⸻

71. Customer Collection History

Potential information:

* Customer
* Invoice Value
* Payments
* Average Payment Time
* Overdue History
* Last Payment
* Promise-to-Pay History

Sensitive financial access must be permission-controlled.

⸻

72. Promise-to-Pay Report

Potential columns:

* Customer
* Promised Amount
* Promise Date
* Owner
* Status
* Actual Payment

Views:

* Due Today
* Upcoming
* Kept
* Broken

⸻

73. Credit Exposure Report

Potential information:

* Customer
* Credit Limit
* Outstanding
* Available Credit
* Overdue
* Credit Utilization

Potential indicator:

Credit Utilization =
Outstanding / Credit Limit

Customers without credit limits should be handled separately rather than producing meaningless percentages.

⸻

74. Branch Performance

Potential metrics:

* Leads
* Conversion
* Sales
* Purchase
* Stock
* Billing
* Collections
* Outstanding

Branch comparison should respect data permissions.

⸻

75. Team Performance

Potential metrics:

* Leads Assigned
* Follow-ups
* Conversion
* Opportunities
* Sales
* Collections

Reports should emphasize business outcomes over activity volume.

⸻

76. Activity Report

Potential activity types:

* Calls
* Meetings
* Follow-ups
* Tasks
* Notes
* WhatsApp
* Email

Useful dimensions:

* User
* Team
* Customer
* Lead
* Period

⸻

77. Activity Effectiveness

Avoid simplistic conclusions such as:

More Calls = Better Salesperson

Instead, activity may be viewed alongside:

* Lead Conversion
* Opportunity Progression
* Sales
* Customer Follow-up Completion

Activity reports should provide context.

⸻

78. Communication Report

Potential channels:

* WhatsApp
* Email
* SMS

Potential metrics:

* Sent
* Delivered where available
* Failed
* Read where available
* Replies where technically supported

Communication provider data may be incomplete depending on integration capabilities.

⸻

79. WhatsApp Reporting

Potential metrics:

* Messages Sent
* Delivered
* Failed
* Template Usage
* Conversation Volume

Avoid interpreting message volume as sales effectiveness by itself.

⸻

80. Email Reporting

Potential metrics:

* Emails Sent
* Delivered where supported
* Failed
* Opened where supported and appropriate
* Replied where supported

Tracking should respect applicable privacy and provider limitations.

⸻

81. SMS Reporting

Potential metrics:

* Sent
* Delivered
* Failed
* Cost where provider data supports it

⸻

82. Cross-Module Reports

Some reports may combine domains.

Example:

Lead to Revenue

Lead
↓
Opportunity
↓
Quotation
↓
Sales Order
↓
Invoice
↓
Payment

Potential metrics:

* Lead Source
* Converted Customers
* Sales
* Invoiced
* Collected

⸻

83. Lead-to-Revenue Attribution

Where reliable relationships exist, the system may answer:

* Which lead sources generate revenue?
* Which campaigns generate customers?
* Which salespeople convert leads into revenue?
* What is the time from lead to first sale?

Attribution should remain transparent.

Do not create complex marketing attribution models without explicit requirements.

⸻

84. Sales-to-Collection Report

Potential flow:

Sales Order
↓
Invoice
↓
Payment

Potential metrics:

* Sales Value
* Invoiced Value
* Collected Value
* Outstanding

Useful for understanding commercial realization.

⸻

85. Product Demand vs Stock

Potential comparison:

Product
Sales Demand
Available Stock
Reserved
Incoming
Purchase Pending

This can help Inventory and Purchase planning.

⸻

86. Product Sales vs Purchase

Potential metrics:

* Sales Quantity
* Purchase Quantity
* Current Stock
* Sales Value
* Purchase Value

Do not interpret the difference as profit unless approved costing logic exists.

⸻

87. Profitability Reports

Gross-margin/profitability reporting should only be introduced when cost and valuation rules are clearly defined.

Potential future model:

Sales Revenue
-
Approved Cost Basis
=
Gross Margin

Do not calculate misleading profit using arbitrary purchase prices.

⸻

88. Saved Reports

Users may save frequently used report configurations.

Saved configuration may include:

* Report
* Filters
* Date Logic
* Grouping
* Sort
* Columns

Example:

"My Hyderabad Team – Monthly Sales"

⸻

89. Saved Report Visibility

Saved reports may be:

* Private
* Team Shared
* Organization Shared

Shared reports should require appropriate permission.

⸻

90. Scheduled Reports

Future functionality may allow users to schedule report delivery.

Potential schedules:

* Daily
* Weekly
* Monthly

Potential channels:

* Email

Example:

Weekly Sales Summary
Every Monday
→ Sales Manager

⸻

91. Scheduled Report Safety

Scheduled reports must respect:

* Current Permissions
* Recipient Authorization
* Data Visibility
* Export Security

A user should not bypass access controls by scheduling a report.

⸻

92. Report Export

Potential formats:

* CSV
* XLSX
* PDF

Use:

* CSV/XLSX for detailed data
* PDF for presentation-ready summaries

Export should preserve active filters.

⸻

93. Export Metadata

Where useful, exports should indicate:

* Report Name
* Generated Date/Time
* Date Range
* Applied Filters
* Generated By

This helps avoid confusion when exported files circulate.

⸻

94. Export Permissions

Potential permissions:

reports.view
reports.export
reports.schedule
reports.share

Sensitive reports may require additional domain permissions.

⸻

95. Role-Based Reporting

Users should only see metrics based on data they are authorized to access.

Example:

Sales Executive
→ Own / Assigned Data
Sales Manager
→ Team Data
Branch Manager
→ Branch Data
Management
→ Organization Data

Backend must enforce visibility.

⸻

96. Metric-Level Permissions

Some metrics may require additional permission.

Examples:

* Purchase Cost
* Stock Value
* Gross Margin
* Customer Credit
* Customer Outstanding
* Supplier Pricing

A user may have access to a Sales report without access to all financial columns.

⸻

97. Report Data Security

Reports must never become a shortcut around domain permissions.

If a user cannot access a customer’s financial information in Billing, they should not gain access through Reports.

The same applies to:

* Purchase Costs
* Supplier Pricing
* Inventory Value
* Customer Credit
* Management Data

⸻

98. Report Definitions

Every important KPI should have a documented definition.

Example:

Metric:
Lead Conversion Rate
Definition:
Converted eligible leads divided by eligible leads during the selected reporting period.

This prevents different teams from interpreting the same metric differently.

⸻

99. Metric Registry

Consider maintaining a centralized metric definition layer.

Conceptually:

Metric
├── Name
├── Description
├── Source Domain
├── Calculation
├── Date Field
├── Permissions
└── Supported Dimensions

This can improve consistency across dashboards and reports.

⸻

100. Single Source of Metric Truth

The same KPI should not be independently implemented in multiple screens.

Example:

Outstanding

should come from the same authoritative Billing logic whether displayed in:

* Billing
* CRM Customer 360
* Reports
* Management Dashboard

⸻

101. Real-Time vs Cached Reporting

Not every report needs to calculate directly from transactional tables on every request.

Potential architecture:

Transactional Database
↓
Reporting Query Layer
↓
Caching / Aggregation where required
↓
Report API
↓
UI

Start simple.

Introduce aggregation or caching when actual performance requires it.

⸻

102. Reporting Performance

Large reports should support:

* Pagination
* Server-side Filtering
* Server-side Sorting
* Indexed Queries
* Date-range Limits where appropriate
* Asynchronous Export for large datasets

Avoid loading entire datasets into the browser.

⸻

103. Data Freshness

Where reporting data is cached or aggregated, users should know the freshness where relevant.

Example:

Updated 5 minutes ago

Operational reports requiring immediate accuracy should query appropriately current data.

⸻

104. Reporting Timezone

Dates and times must use the organization’s configured timezone.

Avoid mixing:

* UTC
* Browser Time
* Branch Time

without explicit conversion rules.

⸻

105. Financial Year

Reports should support Indian financial-year reporting where applicable.

For example:

1 April
→
31 March

Financial-year configuration should not be hardcoded if the architecture may support other organizations later.

⸻

106. Currency

Initial deployment may primarily use INR.

Display should follow appropriate Indian formatting.

Example:

₹12,50,000

Currency handling should remain architecturally extensible.

⸻

107. Number Formatting

Use readable formatting.

Examples:

1,250 Leads
₹12,50,000
24.6%

Avoid excessive decimal precision.

⸻

108. Chart Selection

Recommended general rules:

Line

Use for trends.

Bar

Use for comparisons.

Horizontal Bar

Useful for ranked categories.

Funnel

Use for actual stage progression.

Donut / Pie

Use sparingly and only for small categorical distributions.

Table

Use when users need exact values or actions.

Do not force every dataset into a visualization.

⸻

109. Chart Interaction

Where useful:

* Hover for Exact Value
* Click to Filter
* Click to Drill Down
* Toggle Metric
* Change Date Range

Interactions should remain predictable.

⸻

110. Report Table UX

Tables should support relevant features such as:

* Search
* Sort
* Filters
* Column Selection
* Pagination
* Export

Avoid adding configuration controls that users rarely need.

⸻

111. Report Detail Drawer

Clicking a metric or chart segment may open:

* Detail Drawer
* Filtered Table
* Domain Record List

Example:

Overdue > 90 Days
↓
Customer List
↓
Invoice

This preserves context.

⸻

112. Management Dashboard UX

The management dashboard should avoid a dense “BI wall”.

Recommended structure:

Period + Filters
Key Business Numbers
Attention Required
Sales & Pipeline
Collections & Outstanding
Inventory & Purchase
Team / Branch Performance

Progressive disclosure should handle deeper analysis.

⸻

113. Personalized Dashboard

Future functionality may allow users to choose limited dashboard preferences.

Examples:

* Default Branch
* Default Date Range
* Selected KPI Cards

Avoid building a complex drag-and-drop dashboard builder unless explicitly required.

⸻

114. Report Favorites

Users may favorite commonly used reports.

This can provide a lightweight personalized reporting experience without requiring custom dashboard construction.

⸻

115. Search Reports

Users should be able to find reports by terms such as:

* Leads
* Sales
* Customer
* Stock
* Purchase
* Billing
* Outstanding
* Team

Report search should search report definitions, not business records.

⸻

116. Report Catalog

Potential report catalog:

CRM

* Lead Overview
* Lead Funnel
* Lead Source
* Lead Ageing
* Lead Response
* Lost Leads
* Follow-up Performance

Sales

* Pipeline
* Sales Overview
* Sales Trend
* Salesperson Performance
* Customer Sales
* Product Sales
* Brand Sales
* Category Sales

Inventory

* Stock Summary
* Warehouse Stock
* Low Stock
* Out of Stock
* Stock Movement
* Stock Ageing
* Slow-moving Stock
* Dead Stock

Purchase

* Purchase Overview
* Supplier Purchase
* Supplier Performance
* Price Trend
* Open PO
* Delayed PO

Billing

* Invoice Register
* Collection
* Outstanding
* Outstanding Ageing
* Customer Statement
* Promise to Pay

Team

* Team Performance
* Activity
* Branch Performance

Do not expose every possible combination as a separate report.

⸻

117. Report Templates

Reports should be defined as reusable configurations rather than one-off pages wherever practical.

A report definition may specify:

Data Source
Metrics
Dimensions
Filters
Default Date Range
Visualization
Permissions
Drill-down Target

This can reduce duplicated implementation.

⸻

118. Custom Report Builder

A full custom report builder should not be part of the initial release.

If introduced later, start with controlled capabilities:

* Select Approved Data Domain
* Select Dimensions
* Select Metrics
* Add Filters
* Choose Table / Chart
* Save

Do not expose raw database fields or SQL.

⸻

119. AI Reporting Opportunities

Future AI may assist with:

* Natural-language Report Search
* Report Summaries
* Trend Explanation
* Anomaly Detection
* Management Briefings
* Suggested Follow-up Areas
* Forecasting
* Natural-language Questions

Example:

"Which products had the highest sales growth this month?"

AI may translate this into approved reporting queries.

⸻

120. AI Management Summary

Future capability:

Business Data
↓
Deterministic Metrics
↓
AI Summary

Example output may highlight:

* Sales Increased
* Collections Declined
* Product X is Low Stock
* Supplier Y has Delayed Deliveries
* Several High-value Leads are Stalled

AI must summarize authoritative metrics rather than invent calculations.

⸻

121. AI Explanation Principle

If AI states:

"Sales declined by 12%"

the underlying deterministic report must support that statement.

Users should be able to inspect the source metric.

⸻

122. Forecasting

Potential future forecasting:

* Sales Forecast
* Demand Forecast
* Collection Forecast
* Stock Requirement
* Purchase Requirement

Forecasts should be clearly labeled as predictions.

Do not present predicted values as actual business results.

⸻

123. Anomaly Detection

Future analytics may identify unusual situations such as:

* Sudden Sales Drop
* Unexpected Purchase Price Increase
* Unusual Stock Adjustment
* High Customer Overdue
* Abnormal Lead Decline

Alerts should explain why something was considered unusual.

⸻

124. Mobile Reporting Experience

Mobile should prioritize concise information.

Potential mobile reporting areas:

* Overview
* My Leads
* My Sales
* My Pipeline
* Collections
* Team Summary

Complex report building and large data tables should remain desktop-oriented.

⸻

125. Mobile Management Overview

Potential structure:

Today / This Month
Sales
Pipeline
Collections
Outstanding
Attention
Team

Users should be able to tap a metric for details.

⸻

126. Empty States

Examples:

No Report Data

Explain whether:

* No records exist
* Selected filters produced no results
* User lacks access

Potential action:

* Clear Filters

No Saved Reports

Explain that frequently used report configurations can be saved.

Avoid decorative empty-state complexity.

⸻

127. Error States

Handle:

* Report Failed to Load
* Invalid Date Range
* Data Unavailable
* Export Failed
* Scheduled Report Failed
* Permission Denied
* Report Definition Changed
* Timeout

Users should be able to retry safely.

⸻

128. Loading States

Use:

* Skeletons for dashboard cards
* Table loading states
* Chart placeholders

Avoid blocking the entire reporting experience if one report component fails.

⸻

129. Partial Failure

A management dashboard may consume multiple data sources.

If Inventory reporting fails while Sales succeeds:

Do not fail the entire dashboard.

Show the available data and indicate which section could not load.

⸻

130. Report Permissions

Potential permissions:

reports.overview.view
reports.crm.view
reports.sales.view
reports.inventory.view
reports.purchase.view
reports.billing.view
reports.team.view
reports.communication.view
reports.financial.view
reports.cost.view
reports.credit.view
reports.export
reports.schedule
reports.share
reports.manage_saved

Exact naming should follow final RBAC conventions.

⸻

131. Audit Requirements

Important report-related events may include:

* Sensitive Report Exported
* Report Shared
* Scheduled Report Created
* Scheduled Report Recipient Changed
* Shared Report Deleted

Viewing every ordinary report does not necessarily require detailed audit logging unless compliance requires it.

⸻

132. Export Audit

Sensitive exports should record:

* User
* Report
* Filters
* Export Type
* Date/Time

This is particularly important for:

* Customer Financial Data
* Purchase Costs
* Supplier Pricing
* Full Customer Lists

⸻

133. Data Retention

Reports should follow underlying domain retention policies.

Reports must not retain unauthorized copies of data after the source data is legitimately removed or anonymized.

Exported files fall outside application control once downloaded and should therefore be permission-controlled.

⸻

134. Privacy

Reports containing:

* Customer Contact Details
* Employee Information
* Communication Data

must respect application privacy and access rules.

Avoid unnecessarily displaying personally identifiable information in high-level dashboards.

⸻

135. Report API Architecture

Conceptually:

Frontend
↓
Reporting API
↓
Reporting Service
↓
Authorized Domain Data
↓
Database

The reporting service should enforce:

* Organization Scope
* Branch Scope
* Team Scope
* User Scope
* Metric Permissions

Never rely solely on frontend filtering for access control.

⸻

136. Query Architecture

Start with carefully designed server-side queries.

Do not prematurely create:

* Separate Analytics Database
* ETL Infrastructure
* Data Warehouse
* OLAP Cubes

Introduce additional analytics infrastructure only when actual data volume/performance justifies it.

⸻

137. Reporting Read Models

For complex frequently used reports, dedicated read models or materialized aggregates may eventually improve performance.

Example:

Daily Sales Summary
Date
Branch
Salesperson
Orders
Sales Value
Collections

These should be derived from authoritative transactions.

⸻

138. Data Reconciliation

Aggregated reports should periodically reconcile against transactional sources where applicable.

Financial reports particularly require consistency.

Example:

Billing Invoice Total
=
Reporting Invoice Total

Unexpected discrepancies should be detectable.

⸻

139. Testing Requirements

Important reporting tests include:

* Metric Calculation
* Date Boundaries
* Financial Year
* Branch Filtering
* Team Filtering
* User Visibility
* Currency Precision
* Empty Data
* Large Data
* Export
* Drill-down
* Cross-module Metrics

Critical metrics should have deterministic test cases.

⸻

140. Report Definition Testing

For each important report, test:

Given Known Transactions
↓
Apply Known Filters
↓
Expected Metric

Do not validate reports solely by visual inspection.

⸻

141. Reports Design Requirements

Before designing Reports screens, Claude must:

1. Read PROJECT.md.
2. Read CRM.md.
3. Read SALES.md.
4. Read INVENTORY.md.
5. Read PURCHASE.md.
6. Read BILLING.md.
7. Read REPORTS.md.
8. Review approved design-system documentation.
9. Identify the target user.
10. Identify the decision the report supports.
11. Identify authoritative data sources.
12. Identify metrics.
13. Identify filters.
14. Identify permissions.
15. Identify drill-down destinations.
16. Identify desktop/mobile behavior.
17. Avoid decorative analytics.
18. Avoid introducing functionality outside approved scope.

⸻

142. Reports Development Requirements

Before implementing Reports functionality, Claude must:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read all relevant module specifications.
5. Read REPORTS.md.
6. Inspect existing implementation.
7. Identify authoritative domain sources.
8. Define metric calculations.
9. Define date semantics.
10. Define filters.
11. Define permissions.
12. Define drill-down behavior.
13. Identify performance requirements.
14. Identify export requirements.
15. Define test datasets.
16. Implement server-side authorization.
17. Implement only approved scope.
18. Verify calculations before reporting completion.

⸻

143. Cross-Module Ownership

CRM Owns

* Leads
* Contacts
* Companies
* Activities
* Lead Source
* Lead Status

Sales Owns

* Opportunities
* Quotations
* Sales Orders
* Commercial Sales Data

Inventory Owns

* Stock
* Warehouses
* Reservations
* Stock Movements
* Dispatch
* Inventory Adjustments

Purchase Owns

* Suppliers
* Purchase Requirements
* RFQs
* Supplier Quotes
* Purchase Orders

Billing Owns

* Invoices
* Payments
* Outstanding
* Credit
* Collections
* Financial Adjustments

Reports Owns

* Metric Definitions
* Aggregation
* Analysis
* Visualization
* Cross-domain Reporting
* Saved Reports
* Scheduled Reports
* Reporting Exports

Reports does not own the underlying transactional records.

⸻

144. Dashboard vs Report Principle

A dashboard answers:

What should I know right now?

A report answers:

What happened, where, when, and why?

Do not turn every report into a dashboard.

Do not turn the management dashboard into a collection of every available metric.

⸻

145. Actionability Principle

A useful report should ideally support:

Observe
↓
Understand
↓
Drill Down
↓
Take Action

Example:

12 High-value Leads Have No Follow-up
↓
View Leads
↓
Open Lead
↓
Assign / Follow Up

Reports should connect users back to operational workflows.

⸻

146. Reporting Truth Principle

Every number shown should answer:

What does this metric mean?
Where did the data come from?
What date range does it use?
Which filters are active?
What records contribute to it?

If these cannot be explained, the metric should not be considered trustworthy.

⸻

147. Performance Principle

Do not compromise transactional application performance for analytics.

As data grows:

Transactional Queries
↓
Optimized Reporting Queries
↓
Aggregates / Cache
↓
Dedicated Analytics Infrastructure

should evolve progressively based on actual need.

⸻

148. Initial Release Priorities

Recommended implementation order:

Reporting Foundation

* Reporting API Pattern
* Metric Definitions
* Date Filters
* Branch / Team / User Scope
* Export Foundation

CRM Reporting

* Lead Overview
* Lead Funnel
* Lead Source
* Lead Ageing
* Follow-up
* Conversion

Sales Reporting

* Sales Overview
* Pipeline
* Salesperson Performance
* Customer Sales
* Product / Brand / Category Sales

Inventory Reporting

* Stock Summary
* Low Stock
* Warehouse Stock
* Stock Movement
* Ageing
* Dead Stock

Purchase Reporting

* Purchase Overview
* Supplier Purchase
* Open POs
* Delayed POs
* Price Trend

Billing Reporting

* Invoice Register
* Collections
* Outstanding
* Ageing
* Customer Credit

Management Reporting

* Management Overview
* Branch Comparison
* Team Performance
* Attention Required

Advanced Reporting

* Saved Reports
* Scheduled Reports
* Cross-module Analysis
* AI Summaries
* Forecasting
* Anomaly Detection

This order should be reconciled with the approved development roadmap.

⸻

149. Reports Screen Inventory

Likely screens/views include:

* Reports Home
* Management Overview
* CRM Reports
* Lead Funnel
* Lead Source Analysis
* Lead Ageing
* Lead Follow-up Report
* Sales Overview
* Sales Pipeline Report
* Salesperson Performance
* Customer Sales Report
* Product Sales Report
* Brand Performance
* Category Performance
* Inventory Overview
* Warehouse Stock Report
* Low Stock Report
* Stock Ageing
* Dead Stock
* Purchase Overview
* Supplier Performance
* Purchase Price Trend
* Open PO Report
* Delayed PO Report
* Billing Overview
* Invoice Register
* Collection Report
* Outstanding Report
* Outstanding Ageing
* Branch Performance
* Team Performance
* Activity Report
* Communication Report
* Saved Reports
* Scheduled Reports

This is a reporting inventory, not an instruction to build every screen immediately.

⸻

150. Reports Home Information Architecture

Potential structure:

Header

* Reports
* Global Date Range where appropriate
* Branch Scope

Favorites

Frequently used reports.

Categories

* CRM & Leads
* Sales
* Customers
* Products
* Inventory
* Purchase
* Billing
* Team

Recently Viewed

Recent reports.

Saved Reports

User-defined configurations.

Management Overview should remain a separate purposeful experience rather than making Reports Home itself another dashboard.

⸻

151. Report Screen Information Architecture

A standard report screen may follow:

Report Name
Description
Date Range | Filters | Compare
KPI Summary
Primary Visualization
Detailed Table
Drill-down / Supporting Breakdown

Actions:

* Save View
* Export
* Schedule where permitted

Not every report needs every section.

⸻

152. Lightweight Experience Principle

Reports should maintain the application’s lightweight premium experience.

Avoid:

* 20 KPI cards on one screen
* Excessive chart colors
* Multiple pie charts
* Dense BI-style controls
* Technical query terminology
* Huge filter panels
* Unnecessary animations

Prefer:

* Clear hierarchy
* Strong typography
* Purposeful whitespace
* Compact filters
* Progressive disclosure
* Actionable tables
* Simple charts

⸻

153. Final Reports Principle

The Reports module should connect the entire operational CRM:

Leads
↓
Sales
↓
Orders
↓
Inventory
↕
Purchase
↓
Billing
↓
Collections
↓
Business Performance

The reporting system succeeds when users can answer:

What is happening in the business, why is it happening, where does attention need to go, and what should I inspect next?

without maintaining parallel spreadsheets or manually combining data from multiple modules.

Reports must remain:

Accurate.

Explainable.

Permission-aware.

Actionable.

Fast.

Consistent with authoritative module data.

Useful before visually impressive.
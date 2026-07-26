FRONTEND.md

Electrical Distribution CRM — Frontend Development Instructions for Claude

Version: 1.0
Status: Active Frontend Instruction
Category: Prompt / Frontend
Purpose: Persistent frontend implementation guidance for Claude when building, modifying, reviewing, or refactoring the web application.

⸻

1. Role

When working on the frontend for this project, act as a:

Senior Frontend Engineer
+
React Application Architect
+
Enterprise CRM Frontend Specialist
+
UX-focused Product Engineer

The objective is not merely to reproduce screens.

The frontend must be:

Maintainable
Reusable
Fast
Responsive
Accessible
Permission-aware
API-driven
Consistent
Production-ready

⸻

2. Project Context

This application is a CRM and business operations platform for an electrical products distributor dealing primarily with:

* Lights
* Fans
* Wires
* Switches

The application supports:

* Leads
* Contacts
* Companies / Customers
* Follow-ups
* Sales Team
* Quotations
* Sales Orders
* Products
* Inventory
* Warehouses
* Purchase Orders
* Goods Receipts
* Suppliers
* Billing
* Invoices
* Payments
* Reports
* WhatsApp
* Email
* SMS
* Notifications
* Team Management
* Roles & Permissions
* Settings

The web application is the first client of the backend API.

A mobile application may be introduced later.

⸻

3. Source of Truth

Before implementing frontend functionality, Claude must read:

PROJECT.md
PROJECT_SETUP.md
CLAUDE.md
ARCHITECTURE.md
API.md
UX.md
COLORS.md
TYPOGRAPHY.md
COMPONENTS.md

Then read the relevant module document.

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

Do not implement functionality outside approved project scope.

⸻

4. Frontend Principle

Follow:

UX defines the experience.
Design System defines the presentation.
API defines the contract.
Frontend connects them.

Do not allow frontend convenience to redefine business rules.

⸻

5. Frontend Responsibilities

The frontend owns:

* Presentation
* Interaction
* Navigation
* Forms
* Client-side validation
* API consumption
* Loading states
* Error states
* Empty states
* Permission-aware presentation
* Responsive behavior
* Accessibility
* Local interaction state
* User feedback
* Data formatting

The frontend does NOT own authoritative:

* Permissions
* Financial calculations
* Tax calculations
* Inventory calculations
* Document numbering
* Workflow enforcement
* Payment allocation validation
* Authentication security
* Business integrity

These belong to the backend.

⸻

6. Technology

Use the frontend technology defined in PROJECT_SETUP.md.

Where React is selected, use modern React architecture.

Preferred characteristics:

React
TypeScript
Modern routing
Query/server-state library
Schema-based form validation
Reusable component system
Feature-oriented structure

Do not introduce additional frameworks without a clear requirement.

⸻

7. TypeScript

Use TypeScript throughout application code.

Avoid:

any

unless absolutely necessary.

Prefer:

Explicit Types
API DTO Types
Component Props Types
Form Types
Domain Types

Do not disable TypeScript errors simply to make builds pass.

⸻

8. Frontend Architecture

Conceptually:

Application
│
├── App Shell
│
├── Routes
│
├── Features
│
├── Shared Components
│
├── API Layer
│
├── Hooks
│
├── State
│
├── Utilities
│
├── Types
└── Configuration

Keep domain-specific code close to its feature.

⸻

9. Feature-oriented Structure

Prefer:

src/
│
├── app/
│
├── components/
│
├── features/
│   ├── auth/
│   ├── crm/
│   ├── sales/
│   ├── inventory/
│   ├── purchase/
│   ├── billing/
│   ├── reports/
│   ├── communications/
│   └── team/
│
├── hooks/
├── lib/
├── services/
├── types/
└── utils/

Exact structure must follow PROJECT_SETUP.md.

Do not create conflicting folder conventions.

⸻

10. Feature Structure

A feature may contain:

features/
└── leads/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── services/
    ├── schemas/
    ├── types/
    └── utils/

Only create folders that are actually required.

Avoid empty architectural ceremony.

⸻

11. Shared vs Feature Components

Use shared components for genuinely reusable UI.

Examples:

Button
Input
Select
Modal
Drawer
Table
Badge
Tabs
Pagination
Empty State

Feature-specific components remain inside their domain.

Example:

LeadStatusBadge
LeadActivityTimeline
QuotationLineItems
PaymentAllocationTable

Do not move everything into a global components folder.

⸻

12. Design System

Frontend implementation must follow:

COLORS.md
TYPOGRAPHY.md
COMPONENTS.md

Do not invent new:

* Colors
* Font sizes
* Button styles
* Input styles
* Shadows
* Border radii
* Status treatments
* Spacing patterns

without identifying a genuine design-system gap.

⸻

13. Design Tokens

Use design tokens rather than repeated raw values.

Prefer:

var(--color-primary)
var(--spacing-md)
var(--radius-md)

or the equivalent token mechanism used by the project.

Avoid repeated hardcoded values throughout components.

⸻

14. No Arbitrary Styling

Avoid patterns such as:

padding: 17px
margin-top: 13px
border-radius: 11px

unless they are defined design-system values.

Consistency matters more than pixel-level improvisation.

⸻

15. Figma Implementation

When implementing an approved Figma design:

1. Inspect the actual design.
2. Identify reusable components.
3. Identify layout structure.
4. Map Figma styles to design tokens.
5. Build semantic components.
6. Preserve responsive behavior.
7. Implement states.
8. Verify against the design.

Do not translate every Figma frame directly into a giant component.

⸻

16. Do Not Hardcode Figma

Avoid:

Absolute positioning everywhere
Fixed heights everywhere
Hundreds of pixel coordinates

Figma describes the intended UI.

The implementation must use responsive web layout.

Prefer:

Flexbox
Grid
Auto sizing
Min/max constraints
Responsive breakpoints

⸻

17. Application Shell

The application should use a consistent shell.

Conceptually:

┌──────────────────────────────────────────────┐
│ Header                                       │
├──────────────┬───────────────────────────────┤
│ Navigation   │ Main Content                  │
│              │                               │
│              │                               │
└──────────────┴───────────────────────────────┘

Do not recreate navigation independently inside every module.

⸻

18. Routing

Routes should map to business concepts.

Example:

/dashboard
/leads
/leads/:leadId
/contacts
/contacts/:contactId
/companies
/companies/:companyId
/quotations
/quotations/:quotationId
/sales-orders
/sales-orders/:salesOrderId
/products
/products/:productId
/inventory
/purchase-orders
/purchase-orders/:purchaseOrderId
/invoices
/invoices/:invoiceId
/payments
/reports

Exact routes should follow approved module scope.

⸻

19. Route Naming

Use readable lowercase kebab-case.

Good:

/sales-orders
/purchase-orders

Avoid:

/salesOrders
/sales_orders

⸻

20. Route Configuration

Keep route definitions centralized or predictably organized.

Do not scatter route strings throughout components.

Where useful, define route helpers.

Example concept:

routes.lead(id)
routes.invoice(id)

This reduces broken navigation during refactoring.

⸻

21. Protected Routes

Authenticated application routes must require valid authentication.

Unauthenticated users should be redirected to the appropriate authentication flow.

Do not rely solely on hiding application navigation.

⸻

22. Permission-aware Routes

Where entire modules require permissions, route access should also validate permission context.

Example:

Billing
→ billing.read

If the user lacks access:

Do not render protected data.

Backend remains authoritative.

⸻

23. Navigation Permissions

Only show navigation items relevant to the current user’s access.

Example:

A Sales Executive may see:

Dashboard
CRM
Sales

while an Inventory Manager may primarily see:

Dashboard
Products & Inventory

Exact behavior follows role configuration.

⸻

24. Server State

Treat API data as server state.

Examples:

Leads
Companies
Products
Inventory
Invoices
Payments
Reports

Use the selected query/server-state solution defined by the project.

Do not unnecessarily copy all API data into global client state.

⸻

25. Server State Responsibilities

The query layer should manage:

Fetching
Caching
Refetching
Loading
Error
Mutation
Invalidation

Do not manually recreate this behavior throughout components.

⸻

26. Query Keys

Use structured query keys.

Conceptually:

['leads']
['leads', filters]
['lead', leadId]
['invoices']
['invoice', invoiceId]

Keep query-key definitions consistent.

⸻

27. Cache Invalidation

After mutations, invalidate only relevant queries.

Example:

Update Lead
→ Invalidate Lead Detail
→ Invalidate relevant Lead Lists

Avoid refreshing the entire application after every mutation.

⸻

28. Global State

Use global state only for genuinely global client concerns.

Potential:

Authenticated user context
UI preferences
Application shell state

Do not put every API response into a global store.

⸻

29. Local State

Keep local interaction state local.

Examples:

Modal open
Selected tab
Temporary form state
Dropdown state

Do not globalize simple component state.

⸻

30. URL State

Use URL/query parameters for state users should be able to:

Bookmark
Share
Refresh
Navigate back to

Examples:

Search
Filters
Pagination
Sorting
Selected report date range

⸻

31. List URL Example

Conceptually:

/leads?page=2&status=qualified&assignedTo=me

This allows the user to refresh without losing context.

⸻

32. API Layer

Create a centralized API client.

It should handle:

Base URL
Authentication
Headers
Request IDs where relevant
Response parsing
Standard errors

Do not call fetch independently throughout every component.

⸻

33. API Services

Organize API functions by domain.

Example:

leadService
companyService
productService
inventoryService
salesService
purchaseService
billingService
communicationService

Avoid one enormous:

api.ts

containing hundreds of unrelated operations.

⸻

34. API Contract

Frontend must follow API.md.

Do not invent frontend-only API contracts.

If required data is unavailable:

Identify the API gap.

Do not silently create fake fields or infer unreliable data.

⸻

35. API Types

API request and response types should match backend contracts.

Prefer generated types from OpenAPI where the project supports it.

Otherwise maintain typed DTOs carefully.

⸻

36. DTO vs UI Model

Do not assume API DTOs must exactly match component needs.

Where useful:

API DTO
↓
Mapper
↓
UI Model

This is especially useful for complex display data.

Avoid unnecessary mapping for simple records.

⸻

37. API Errors

Normalize API errors.

Components should receive predictable error information.

Example:

code
message
fields
requestId

Do not force each component to understand raw HTTP/client-library exceptions.

⸻

38. Authentication Errors

For:

401

follow the authentication refresh/session strategy.

Avoid creating redirect loops.

⸻

39. Permission Errors

For:

403

show an appropriate permission state.

Do not display:

Unknown error

when the server clearly reports insufficient access.

⸻

40. Validation Errors

Map field errors to the corresponding form controls.

Example API:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "phone": [
        "Enter a valid phone number."
      ]
    }
  }
}

Display the message near the phone field.

⸻

41. Forms

Use the project-approved form library and schema validation approach.

Forms must support:

Default values
Validation
Field errors
Submitting
Success
Server errors
Disabled states
Reset where appropriate

⸻

42. Form Schemas

Keep validation schemas close to the relevant feature.

Example:

features/leads/schemas/lead.schema.ts

Do not create one giant validation file for the entire application.

⸻

43. Client Validation

Client validation improves UX.

Backend validation remains authoritative.

Never assume:

Frontend validated it
→ Backend does not need validation

⸻

44. Required Fields

Required UI fields must reflect business requirements.

Do not make optional API fields required merely because the design happens to show them.

⸻

45. Form Sections

Long forms should follow UX.md.

Use meaningful groups.

Example:

Contact Information
Business Information
Lead Details
Assignment

Do not group fields based on database tables.

⸻

46. Conditional Fields

Render fields only when relevant.

Example:

Payment Method = Bank Transfer
↓
Show Reference Number

Avoid displaying disabled irrelevant fields unnecessarily.

⸻

47. Form Submission

Prevent duplicate submission.

During submission:

Disable or protect submit
Show progress
Maintain entered values

Do not allow repeated clicks to create duplicate records.

⸻

48. Unsaved Changes

For substantial forms, implement unsaved-change protection where appropriate.

Do not add blocking confirmation to every small modal.

⸻

49. Tables

Tables are core application infrastructure.

Build them as reusable patterns.

Support where relevant:

Pagination
Sorting
Filtering
Search
Selection
Bulk actions
Loading
Empty states
Error states
Row actions

⸻

50. Server-side Tables

Large operational lists should use server-side:

Pagination
Filtering
Sorting
Search

Do not load thousands of records and filter them entirely in the browser.

⸻

51. Table Columns

Define columns based on user tasks.

Do not automatically render every API property.

Example lead table:

Lead
Company
Phone
Source
Status
Owner
Next Follow-up
Actions

⸻

52. Table Row Keys

Use stable entity IDs.

Do not use array indexes as row keys for dynamic records.

⸻

53. Table Loading

Use table skeleton/loading treatment.

Avoid clearing the entire page to a blank spinner when filters change.

⸻

54. Table Empty States

Differentiate:

No records exist

from:

No results match current filters

Provide relevant actions.

⸻

55. Pagination

Use API pagination metadata.

Do not calculate total pages from the currently loaded result count.

⸻

56. Search

Debounce server search appropriately.

Avoid API requests on every keystroke without control.

Do not make debounce so long that the interface feels unresponsive.

⸻

57. Filters

Store filter state consistently.

Where useful, sync filters to URL query parameters.

Provide:

Clear All

when multiple filters are active.

⸻

58. Status Components

Use centralized status components/configuration.

Example:

LeadStatusBadge
InvoiceStatusBadge
PurchaseOrderStatusBadge

or a reusable status component driven by controlled status mappings.

Do not independently hardcode status colors in every screen.

⸻

59. Status Exhaustiveness

Type status values.

When backend introduces an unknown status, avoid silently presenting incorrect styling.

Handle unexpected values safely.

⸻

60. Money

Never use floating-point arithmetic for authoritative financial calculations.

Frontend may display server-calculated values.

Use appropriate decimal-safe formatting.

Default application locale:

en-IN

Currency:

INR

Example:

₹1,25,000.00

⸻

61. Money Formatting

Centralize formatting.

Example concept:

formatCurrency(value, currencyCode)

Do not manually concatenate:

"₹" + amount

throughout components.

⸻

62. Dates

Centralize date formatting.

API values follow API.md.

UI should use the project-approved display format consistently.

Do not manually format dates independently in each component.

⸻

63. Timezones

Treat server timestamps as canonical timestamps.

Convert to appropriate application/user timezone for presentation.

Do not strip timezone information during parsing.

⸻

64. Phone Numbers

Use normalized values for API operations.

Use formatted values for display.

Communication actions should use the underlying normalized number.

⸻

65. Quantities

Do not assume all product quantities are integers.

Wires and other products may use fractional units depending on business configuration.

Frontend controls must support permitted decimal quantities.

⸻

66. Product Selection

Create a reusable product selector for:

Quotation
Sales Order
Purchase Order
Invoice

where workflows require it.

It should support:

Search
SKU
Product Name
Brand
Unit
Availability where relevant

⸻

67. Do Not Duplicate Product Selectors

Avoid implementing separate unrelated product-search behavior for every module.

Reuse core product-selection logic while allowing contextual differences.

⸻

68. Commercial Line Items

Create reusable line-item patterns where appropriate.

Common concepts:

Product
Quantity
Unit Price
Discount
Tax
Amount

Sales and purchase behavior may differ.

Do not force them into one component if business logic becomes significantly different.

⸻

69. Totals

Display backend-authoritative totals.

Frontend may calculate temporary previews for responsiveness if required.

However:

Preview
≠
Authoritative total

After save/recalculation, use server values.

⸻

70. Invoice Integrity

Once an invoice is issued, frontend editing must follow BILLING.md.

Do not expose editable controls merely because the underlying component supports editing.

UI state must respect document status.

⸻

71. Inventory Integrity

Never implement direct stock editing through a generic number input.

Stock changes must use approved operations such as:

Adjustment
Goods Receipt
Sales Fulfilment
Transfer
Return

according to scope.

⸻

72. Inventory Availability

Availability displayed during order entry is informational until authoritative server validation occurs.

Example:

Available: 24

Do not assume this remains valid indefinitely.

⸻

73. Communication

Use one frontend communication abstraction for:

WhatsApp
Email
SMS

where practical.

Do not spread provider-specific UI logic across CRM, Billing, and Sales.

⸻

74. Communication Composer

Build a reusable communication composer supporting contextual configuration.

Potential props/context:

channel
recipient
relatedEntity
template
attachments

Exact implementation should follow UX.md.

⸻

75. Provider Independence

Frontend should not care whether WhatsApp is provided by:

Provider A
Provider B

unless provider-specific setup screens require it.

Business screens interact with communication capabilities, not provider APIs.

⸻

76. Asynchronous Communication

When API returns:

queued

show:

Queued

Do not immediately display:

Delivered

Communication status should update from backend state.

⸻

77. Polling / Realtime

Use realtime updates only where justified.

Possible candidates:

Notifications
Communication status

Do not add realtime infrastructure to every screen.

Where simple refetch/polling is sufficient, prefer simpler implementation.

⸻

78. Notifications

Notification UI should support:

Unread count
Notification list
Read state
Navigation to related record

Do not load the complete notification history merely to display an unread badge.

Use the dedicated API where available.

⸻

79. Dashboard

Dashboard should consume purpose-built dashboard/report APIs.

Do not calculate major business KPIs from multiple raw list APIs in the browser.

⸻

80. Dashboard Widgets

Widgets should be reusable where the same presentation pattern exists.

But avoid creating an overly generic “Widget Engine” unless required.

Simple composition is preferable.

⸻

81. Charts

Use the project-approved charting solution.

Charts should follow UX.md.

Do not add:

3D charts
Decorative animations
Excessive gradients

Use charts only where they communicate meaningful data.

⸻

82. Report Filters

Report filter state should be shareable/bookmarkable through URL parameters where practical.

Example:

/reports/sales?dateFrom=2026-07-01&dateTo=2026-07-31

⸻

83. Loading States

Every asynchronous screen must intentionally handle:

Initial Loading
Background Refetch
Mutation Loading

Do not treat them all identically.

⸻

84. Skeletons

Use skeletons where the page structure is known.

Examples:

List
Detail header
Dashboard metrics

Avoid excessive skeleton animation.

⸻

85. Button Loading

For local mutations:

Save
→ Saving...

is usually preferable to blocking the entire screen.

⸻

86. Error States

Handle:

Page load error
Mutation error
Validation error
Permission error
Not found
Network failure
Integration failure

appropriately.

Do not use one generic error screen for every failure.

⸻

87. Retry

Offer retry where the operation is safely retryable.

Example:

Unable to load leads.
Retry

Do not automatically retry sensitive financial mutations unless idempotency guarantees safety.

⸻

88. Not Found

Use a consistent 404 state.

Provide navigation back to a sensible location.

Do not leave users on a blank page.

⸻

89. Permission State

For inaccessible pages, use a clear permission state where appropriate.

Example:

You don't have access to Billing.

Avoid displaying a broken component.

⸻

90. Empty States

Use shared empty-state components but customize the content to the module.

Example:

No leads yet.
Add your first lead to start tracking opportunities.

Do not show generic:

No data

everywhere.

⸻

91. Modals

Use the shared modal component.

Modal behavior must include:

Focus management
Keyboard support
Escape behavior
Backdrop behavior
Accessible title

Do not create custom modal implementations for individual modules.

⸻

92. Drawers

Use shared drawer patterns.

Good uses:

Filters
Quick preview
Contextual editing

Avoid putting full complex document builders into drawers.

⸻

93. Toasts

Use toast notifications for lightweight feedback.

Examples:

Lead updated.
Follow-up scheduled.
Message queued.

Do not use toasts for information the user must read carefully.

⸻

94. Confirmation Dialogs

Use the shared confirmation pattern.

Confirmation must describe the action.

Avoid:

Are you sure?

Prefer:

Cancel this purchase order?
You will no longer be able to receive goods against it.

⸻

95. Accessibility

Frontend must support:

Semantic HTML
Keyboard navigation
Focus management
Accessible labels
Visible focus states
Reasonable contrast
Screen-reader-friendly forms

Do not rely solely on visual appearance.

⸻

96. Buttons

Use actual:

<button>

for actions.

Do not use clickable <div> elements where semantic controls exist.

⸻

97. Links

Use links for navigation.

Use buttons for actions.

Do not blur these semantics for styling convenience.

⸻

98. Form Labels

Inputs require clear labels.

Placeholder text is not a substitute for a label.

⸻

99. Icon Buttons

Icon-only buttons require accessible names.

Example concept:

aria-label="More actions"

⸻

100. Keyboard Navigation

Ensure:

Tab
Shift+Tab
Enter
Space
Escape

behave appropriately across interactive components.

⸻

101. Focus Management

After opening:

Modal
Drawer
Popover

move focus appropriately.

After closing, return focus to the triggering control where practical.

⸻

102. Responsive Design

Frontend must support:

Desktop
Tablet
Mobile Web

according to UX.md.

Do not postpone responsive behavior until after desktop implementation is complete.

⸻

103. Desktop-first Does Not Mean Desktop-only

Operational screens may be designed desktop-first.

But components must be structurally responsive from the beginning.

Avoid:

width: 1440px

style assumptions.

⸻

104. Responsive Navigation

Desktop may use persistent side navigation.

Smaller screens may use a collapsible/drawer navigation.

Navigation content and permission logic should remain shared.

⸻

105. Responsive Tables

For smaller screens, determine per table whether to use:

Horizontal scroll
Priority columns
Responsive row/card pattern

Do not automatically convert every table into cards.

⸻

106. Responsive Forms

Forms should adapt column layout.

Example:

Desktop
→ 2 columns where appropriate
Mobile
→ 1 column

Do not shrink two-column forms until labels and controls become unusable.

⸻

107. Breakpoints

Use centralized project breakpoints.

Do not invent new media-query values for individual components.

⸻

108. Touch

Buttons and interactive controls must remain touch-friendly.

Avoid tiny row-action icons on mobile.

⸻

109. Hover

Hover states may enhance desktop UX.

Essential functionality must remain accessible without hover.

⸻

110. Performance

Frontend performance matters because this is a daily-use operational application.

Optimize:

Initial bundle
Route loading
API requests
Re-renders
Large tables
Images/assets
Charts

without premature micro-optimization.

⸻

111. Route Code Splitting

Use route/feature-level lazy loading where appropriate.

Users working in CRM should not necessarily download every report/chart dependency immediately.

⸻

112. Heavy Libraries

Before adding a library, determine:

What problem does it solve?
Is it already solved by existing dependencies?
What bundle cost does it add?
Is it actively maintained?
Does it fit project architecture?

Do not add dependencies for trivial utilities.

⸻

113. Memoization

Do not add:

useMemo
useCallback
memo

everywhere by habit.

Use them when there is a measurable or structurally clear reason.

⸻

114. Large Lists

Use server pagination first.

Consider virtualization only when the UX genuinely requires rendering very large lists simultaneously.

Do not add virtualization complexity unnecessarily.

⸻

115. Images

Optimize uploaded/displayed images where relevant.

Product/attachment previews should not load unnecessarily huge files into list screens.

⸻

116. File Uploads

File upload UI must validate:

Allowed type
Maximum size
Upload state
Failure
Success

according to backend rules.

⸻

117. File Upload Progress

Show progress for uploads where the user may otherwise think the application has frozen.

⸻

118. Signed Uploads

If the backend uses signed uploads:

Request Upload Authorization
↓
Upload File
↓
Confirm / Register File

Keep this complexity inside the file-upload service/component.

Feature screens should not reimplement it.

⸻

119. Security

Never store sensitive credentials in frontend code.

Do not expose:

Database credentials
Provider secrets
Private API keys
Secret tokens

in the frontend bundle.

⸻

120. Environment Variables

Only expose environment values explicitly intended for client use.

Do not assume:

Environment variable
=
Secret

if it is bundled into frontend code.

⸻

121. Authentication Storage

Follow the authentication architecture defined by PROJECT_SETUP.md.

Do not invent token storage patterns independently.

Where secure cookies are used, do not duplicate tokens into local storage.

⸻

122. Local Storage

Use browser storage only for appropriate non-sensitive client preferences.

Potential:

Sidebar collapsed
Preferred table density

if such preferences are in scope.

Do not store sensitive business data unnecessarily.

⸻

123. XSS

Never render untrusted HTML without sanitization.

Communication content, notes, and imported data should be treated as untrusted input.

⸻

124. URL Safety

Do not blindly navigate to URLs received from untrusted data.

Validate external links where applicable.

⸻

125. Permissions

Centralize permission checks.

Conceptually:

can('lead.create')
can('invoice.issue')
can('inventory.adjust')

Do not scatter raw role-name checks everywhere.

⸻

126. Avoid Role Hardcoding

Avoid:

if (user.role === 'admin')

for every permission decision.

Use permission capabilities.

Roles map to permissions.

⸻

127. Permission Components

Where useful, provide a reusable pattern:

<Can permission="lead.create">
  ...
</Can>

or equivalent.

Do not overabstract if simple permission utilities are sufficient.

⸻

128. Backend Still Authoritative

Even when frontend hides:

Issue Invoice

the backend must still reject unauthorized attempts.

Frontend permission handling is UX.

Backend permission handling is security.

⸻

129. Feature Flags

Do not introduce feature-flag infrastructure unless project requirements justify it.

If used later, keep feature flags separate from user permissions.

⸻

130. Error Boundary

Use application-level and/or route-level error boundaries where supported.

One component failure should not unnecessarily destroy the entire application experience.

⸻

131. Unknown Errors

For unexpected errors, show a safe user-facing message.

Log technical details through the project’s monitoring mechanism.

Do not render stack traces to users.

⸻

132. Logging

Frontend logging should avoid:

Passwords
Tokens
Sensitive customer information
Full financial payloads

unless an approved secure observability mechanism explicitly requires structured redacted data.

⸻

133. Development Console

Remove unnecessary:

console.log

statements before production.

Use the project logging strategy where logging is genuinely required.

⸻

134. Analytics

Do not add product analytics or tracking unless included in project scope and approved.

Business reporting inside the CRM is different from frontend behavioral analytics.

⸻

135. Testing Strategy

Frontend tests should focus on meaningful behavior.

Use appropriate:

Unit tests
Component tests
Integration tests
End-to-end tests

according to project tooling.

⸻

136. What to Unit Test

Good candidates:

Formatting utilities
Validation schemas
Permission utilities
Data mappers
Calculation previews

Do not write tests merely to increase coverage numbers.

⸻

137. Component Testing

Test important component behavior.

Examples:

Form validation
Permission-dependent actions
Table empty state
Error state
Modal interaction

⸻

138. Integration Testing

Test important frontend flows against mocked/test API boundaries.

Examples:

Create Lead
Schedule Follow-up
Create Quotation
Receive Goods
Record Payment

⸻

139. End-to-End Priority

Critical flows eventually require E2E coverage.

Priority:

Authentication
Lead Management
Lead Follow-up
Quotation → Sales Order
Purchase Order → Goods Receipt
Sales Order → Invoice
Invoice → Payment

⸻

140. Test Selectors

Prefer semantic selectors.

Examples:

Role
Label
Accessible name
Visible text

Avoid coupling tests heavily to CSS class names.

⸻

141. Mock Data

Use realistic but fictional development/test data.

Do not hardcode production customer information into frontend fixtures.

⸻

142. API Mocking

Mocks should reflect the actual API.md contract.

Do not let frontend mocks invent response structures that differ from backend implementation.

⸻

143. Component Naming

Use descriptive PascalCase names.

Good:

LeadDetailsHeader
FollowUpModal
QuotationLineItems
PaymentAllocationTable

Avoid:

Component1
DataBox
InfoCard2

⸻

144. Function Naming

Use names that communicate intent.

Good:

handleLeadAssignment
formatInvoiceNumber
getAvailableActions

Avoid vague names such as:

doStuff
processData
handleThing

⸻

145. Boolean Naming

Use:

isLoading
isOpen
hasPermission
canEdit
shouldRefetch

Avoid ambiguous boolean names.

⸻

146. File Naming

Use one project convention consistently.

Example:

lead-list.tsx
lead-details.tsx
lead.service.ts
lead.schema.ts
lead.types.ts

Do not mix naming conventions arbitrarily.

⸻

147. Component Size

Do not allow pages to become enormous monolithic components.

If a page contains:

Header
Summary
Activity
Follow-ups
Communication
Documents

split meaningful sections.

But avoid fragmenting simple markup into dozens of tiny files.

⸻

148. Hook Rules

Custom hooks should encapsulate reusable behavior.

Good:

useLead
useLeadFilters
usePermissions
useCommunicationStatus

Do not create hooks solely to hide one line of code.

⸻

149. Business Logic

Do not bury important business logic inside visual components.

Example:

Payment allocation rules

should not exist only inside:

PaymentModal.tsx

Backend remains authoritative, and reusable frontend validation/helpers should be separated appropriately.

⸻

150. Utility Functions

Use shared utilities for consistent:

Currency formatting
Date formatting
Phone formatting
Query parameter handling

Do not duplicate utility logic across modules.

⸻

151. Constants

Centralize stable constants where appropriate.

Examples:

Page size options
Route names
Query keys

Do not create giant constants files containing unrelated values.

⸻

152. Enums / Statuses

Prefer types generated/shared from API contracts where possible.

Avoid independently maintaining different frontend and backend meanings for:

Invoice Status
Lead Status
PO Status

⸻

153. Comments

Code should generally explain itself through structure and naming.

Use comments for:

Non-obvious decisions
Workarounds
Complex domain behavior

Avoid comments that simply restate the code.

⸻

154. TODOs

TODOs must be actionable.

Good:

TODO: Replace polling with provider webhook-driven refresh after communication realtime endpoint is available.

Avoid:

TODO: fix later

⸻

155. Accessibility Review

Before completing a feature verify:

Keyboard accessible?
Labels present?
Focus visible?
Dialog focus handled?
Errors associated with fields?
Status not color-only?
Touch targets usable?

⸻

156. Responsive Review

Verify at least:

Desktop
Tablet
Mobile

for relevant screens.

Do not assume responsive CSS works without checking actual layouts.

⸻

157. UX Review

Before completing a frontend screen, compare it against UX.md.

Verify:

Primary task obvious?
Primary action obvious?
Unnecessary fields removed?
Loading handled?
Empty handled?
Errors handled?
Permissions handled?
Responsive behavior handled?

⸻

158. Design Review

Compare implementation with:

COLORS.md
TYPOGRAPHY.md
COMPONENTS.md
Approved Figma

Do not call a screen complete when visual inconsistencies remain obvious.

⸻

159. API Review

Verify:

Correct endpoint?
Correct method?
Correct DTO?
Pagination respected?
Errors handled?
Authorization failure handled?
Mutation invalidation correct?

⸻

160. Module Review

Verify the implementation against the relevant module document.

Do not infer functionality merely from Figma if it contradicts the approved project documentation.

⸻

161. Loading Checklist

For every API-backed page ask:

What happens before data arrives?
What happens during background refresh?
What happens if loading fails?

⸻

162. Mutation Checklist

For every mutation ask:

Can it be submitted twice?
What happens while saving?
What happens if it fails?
What updates after success?
Does cache need invalidation?
Is optimistic UI safe?
Does permission affect the action?

⸻

163. Critical Mutation Rule

Do not use unsafe optimistic success for:

Payment
Invoice Issue
Stock Adjustment
Goods Receipt
Approval
Order Confirmation

Wait for authoritative backend confirmation.

⸻

164. List Screen Pattern

A standard list screen should generally follow:

Page Header
│
├── Title
└── Primary Action
Search / Filters
Table / List
Pagination

with:

Loading
Empty
Filtered Empty
Error

states.

⸻

165. Detail Screen Pattern

A standard detail screen may follow:

Breadcrumb
Page Header
├── Title
├── Status
├── Metadata
└── Actions
Summary
Tabs / Sections
Related Activity / Records

Use only sections relevant to the entity.

⸻

166. Create/Edit Screen Pattern

Typical:

Page Header
Form Sections
Contextual Information
Sticky / Accessible Actions
├── Cancel
└── Save

For complex commercial documents:

Customer / Supplier
↓
Line Items
↓
Pricing / Tax
↓
Terms
↓
Totals
↓
Actions

⸻

167. Mobile List Pattern

On smaller screens:

Header
Search
Important filters
Record list
Primary floating/sticky action where appropriate

Do not simply shrink desktop navigation and tables.

⸻

168. Mobile Detail Pattern

Prioritize:

Identity
Status
Primary action
Next follow-up / key state
Communication
Important details
Activity

Secondary information may use collapsible sections.

⸻

169. CRM Frontend Rules

For CRM implementation:

* Keep owner visible.
* Keep status visible.
* Keep next follow-up visible.
* Make communication accessible.
* Keep activity chronological.
* Make conversion explicit.
* Avoid excessive lead-entry requirements.

⸻

170. Sales Frontend Rules

For Sales:

* Make product entry fast.
* Keep totals visible.
* Show stock context where relevant.
* Preserve quotation/order relationships.
* Respect workflow state.
* Do not allow invalid actions.

⸻

171. Inventory Frontend Rules

For Inventory:

* Clearly distinguish on-hand, reserved, and available.
* Never expose generic stock editing.
* Show movement references.
* Make adjustments deliberate.
* Respect warehouse context.

⸻

172. Purchase Frontend Rules

For Purchase:

* Make supplier context obvious.
* Show ordered/received/remaining quantities.
* Support partial receipts clearly.
* Preserve PO → Receipt traceability.

⸻

173. Billing Frontend Rules

For Billing:

* Prioritize accuracy.
* Show invoice number prominently.
* Show due date.
* Show paid/outstanding clearly.
* Preserve issued-document restrictions.
* Make payment allocation understandable.
* Make communication easy.

⸻

174. Reports Frontend Rules

For Reports:

* Use backend report APIs.
* Keep date range obvious.
* Keep common filters accessible.
* Avoid decorative charts.
* Provide detailed data where useful.
* Support export where required.

⸻

175. Communication Frontend Rules

For Communication:

* Use business language.
* Keep provider complexity hidden.
* Show actual send status.
* Preserve related business context.
* Handle failure.
* Allow safe retry where supported.

⸻

176. Team Frontend Rules

For Team:

* Clearly show user.
* Role.
* Team.
* Status.
* Relevant permissions/context.

Avoid overwhelming normal administrators with raw permission matrices unless they are performing role configuration.

⸻

177. Claude Implementation Process

Before implementing any frontend feature:

1. Read PROJECT.md.
2. Read PROJECT_SETUP.md.
3. Read CLAUDE.md.
4. Read UX.md.
5. Read FRONTEND.md.
6. Read COLORS.md.
7. Read TYPOGRAPHY.md.
8. Read COMPONENTS.md.
9. Read API.md.
10. Read relevant module document.
11. Inspect existing frontend architecture.
12. Inspect existing reusable components.
13. Inspect approved Figma.
14. Identify API requirements.
15. Identify permissions.
16. Identify states.
17. Identify responsive behavior.
18. Implement.
19. Test.
20. Review.

⸻

178. Claude Must Inspect Existing Code

Before creating a new:

Component
Hook
Service
Utility
Type
Layout
Table
Modal
Form control

search the existing codebase.

Reuse or extend an existing implementation where appropriate.

Do not create duplicates simply because creating a new file is easier.

⸻

179. Claude Dependency Rule

Before installing a new frontend dependency:

1. Check existing dependencies.
2. Determine whether the problem is already solved.
3. Evaluate maintenance and compatibility.
4. Explain why the dependency is required.
5. Install only if justified.

Do not install packages casually.

⸻

180. Claude Refactoring Rule

Do not refactor unrelated working code while implementing a focused feature unless:

The current structure blocks implementation

or:

There is a clear correctness/security issue.

Keep changes scoped.

⸻

181. Claude API Gap Rule

If Figma/UX requires data unavailable from the API:

Do NOT:

Invent data
Hardcode fake values
Derive unreliable business state

Instead identify:

Required endpoint/field
Reason
Expected contract

and coordinate with backend implementation.

⸻

182. Claude Figma Gap Rule

If a required application state is missing from Figma:

Examples:

Loading
Empty
Error
Permission denied
Mobile

implement it using established design-system/UX patterns.

Do not leave the application broken merely because the state was not explicitly designed.

⸻

183. Claude Design System Gap Rule

If no existing component supports a legitimate requirement:

Identify the gap
↓
Check whether component should be reusable
↓
Design/implement consistent extension
↓
Document it

Do not create an isolated one-off style.

⸻

184. Claude Completion Definition

A frontend task is NOT complete merely when:

The page visually renders.

It is complete when relevant:

API integration works
Validation works
Permissions work
Loading works
Empty state works
Errors work
Success feedback works
Responsive behavior works
Accessibility is reasonable
Design system is followed
Tests pass
Build passes

⸻

185. Claude Must Not

Do NOT:

* Add functionality outside project scope.
* Invent APIs.
* Invent business rules.
* Hardcode API responses.
* Hardcode user roles throughout components.
* Trust frontend permissions.
* Trust frontend financial calculations.
* Directly modify inventory values.
* Ignore responsive design.
* Ignore loading states.
* Ignore empty states.
* Ignore API failures.
* Ignore accessibility.
* Duplicate existing components.
* Install unnecessary dependencies.
* Put all state globally.
* Put all API logic in components.
* Build enormous monolithic pages.
* Overabstract simple code.
* Create generic systems without a real need.
* Use excessive animations.
* Use arbitrary styling.
* Expose secrets.
* Use production customer data in fixtures.
* mark critical operations successful before server confirmation.

⸻

186. Frontend Quality Standard

A salesperson should be able to:

Open CRM
↓
Understand today's work
↓
Open a lead
↓
Review history
↓
Contact customer
↓
Schedule follow-up
↓
Progress opportunity

with minimal friction.

⸻

187. Commercial Workflow Standard

A user should be able to move through:

Lead
↓
Customer
↓
Quotation
↓
Sales Order
↓
Invoice
↓
Payment

without repeatedly re-entering known information.

⸻

188. Purchase Workflow Standard

The frontend should clearly support:

Supplier
↓
Purchase Order
↓
Partial / Full Receipt
↓
Inventory Update

without requiring the user to understand internal database operations.

⸻

189. Frontend Performance Standard

The application should feel:

Immediate for common interactions
Predictable during network activity
Stable during background refresh
Clear when operations take time

Do not trade correctness for artificial speed.

⸻

190. Future Mobile Principle

Do not build the web frontend as though it will later be converted directly into the mobile application.

The mobile application will be a separate client/interface if introduced.

What should be shared is:

Backend
API
Authentication concepts
Business rules
Domain model
Workflow concepts

not necessarily the entire UI codebase.

⸻

191. Mobile-ready Web Architecture

The web application should nevertheless avoid creating backend dependencies on:

Browser-only behavior
Desktop-only state
Client-calculated business rules

This ensures the same API can later support mobile.

⸻

192. Final Frontend Principle

The frontend is not simply:

Screens connected to endpoints.

It is the operational interface through which users run the business.

Every implementation decision should optimize:

Clarity
+
Speed
+
Consistency
+
Maintainability
+
Correctness

while respecting:

UX.md
+
Design System
+
API.md
+
Module Requirements

The final relationship should remain:

Business Requirements
        │
        ▼
      UX.md
        │
        ▼
 Approved Design
        │
        ▼
 Design System
        │
        ▼
   FRONTEND.md
        │
        ▼
 Frontend Application
        │
        ▼
      API.md
        │
        ▼
 Backend / Domain

The frontend should make the CRM feel lightweight and premium while the underlying platform remains capable of handling complex sales, inventory, purchase, billing, and communication operations.

When there is a choice between:

Clever implementation

and:

Clear maintainable implementation

prefer the clear maintainable implementation.
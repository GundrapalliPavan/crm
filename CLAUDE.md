CLAUDE.md

Electrical Distribution CRM — Claude Working Instructions

Version: 1.0
Purpose: Repository-level instructions for Claude Code
Authority: Applies to all Claude-assisted work in this repository

⸻

1. Purpose of This Document

This document defines how Claude should work on the Electrical Distribution CRM project.

It is not the product specification.

It is not the technical architecture specification.

Those responsibilities belong to:

* PROJECT.md — Product vision, scope, users, modules, workflows, product principles and future direction.
* PROJECT_SETUP.md — Technical architecture, repository foundation, infrastructure, database foundation, environments, security and Phase 0 setup.

This file defines:

* How Claude should approach work
* What Claude must read
* How tasks should be executed
* How architectural decisions should be handled
* How code should be written
* How changes should be verified
* How progress should be reported
* What Claude must not do without approval

⸻

2. Document Priority

Before beginning substantial work, use the following authority order:

1. Explicit instruction from the user for the current task
2. PROJECT.md
3. PROJECT_SETUP.md
4. CLAUDE.md
5. Approved module/feature documentation
6. Existing implementation patterns
7. Claude’s own assumptions

If documents conflict, do not silently choose one.

Identify the conflict and explain it before making a significant decision.

⸻

3. Required Context

Before making architectural, product, database, or implementation decisions:

Read:

PROJECT.md
PROJECT_SETUP.md
CLAUDE.md

For feature-specific work, also inspect relevant:

docs/
apps/
packages/
database/
infrastructure/

Do not make decisions based only on the current prompt when repository documentation already defines the relevant requirement.

⸻

4. Core Working Principle

Always follow:

Understand
    ↓
Inspect
    ↓
Plan
    ↓
Implement
    ↓
Verify
    ↓
Report
    ↓
Stop

Do not use:

Prompt
    ↓
Immediately Generate Large Amounts of Code

Repository understanding comes before implementation.

⸻

5. Inspect Before Changing

Before modifying the repository:

1. Inspect the existing directory structure.
2. Identify relevant existing files.
3. Read existing implementation before replacing it.
4. Check installed dependencies.
5. Check configuration.
6. Check existing conventions.
7. Check current Git status where relevant.
8. Identify whether another implementation already solves the problem.

Do not assume the repository is empty.

Do not recreate functionality that already exists.

⸻

6. Scope Discipline

Implement only the requested step.

If the task is:

Phase 0 — Step 1 Repository Foundation

do not also implement:

* React
* NestJS
* PostgreSQL
* Prisma
* Authentication
* Leads
* Customers
* Sales

unless they are explicitly part of that step.

If something will be required later, mention it in the completion report rather than implementing it prematurely.

⸻

7. One Step at a Time

During Phase 0 and other explicitly phased work:

Complete one approved step.

Then:

1. Verify it.
2. Report results.
3. Identify unresolved issues.
4. Recommend the next exact step.
5. Stop.

Do not automatically continue into the next phase or step.

Wait for approval.

⸻

8. Do Not Overengineer

Prefer the simplest architecture that satisfies:

* Current requirements
* Known near-term requirements
* Reasonable scalability
* Security
* Maintainability

Do not introduce technologies simply because they are popular.

Examples:

Do not introduce:

* Microservices
* Kubernetes
* GraphQL
* Kafka
* Elasticsearch
* Complex event infrastructure
* Multiple databases
* Premature caching layers

without a validated requirement.

The default architecture is the modular monolith defined in PROJECT_SETUP.md.

⸻

9. Future-Ready Does Not Mean Build Now

The project should remain ready for:

* Native Mobile App
* Dealer Portal
* Customer Portal
* Vendor Portal
* AI
* Additional Integrations
* Multiple Organizations
* Multiple Branches
* Larger Scale

But readiness means:

* Good boundaries
* Stable APIs
* Extensible architecture
* Correct data ownership
* Reusable infrastructure

It does NOT mean implementing future features now.

⸻

10. Product Thinking

Before implementing a significant feature, understand:

* Business problem
* Target user
* User goal
* Current workflow
* Desired workflow
* Business rules
* Permissions
* Data requirements
* Integrations
* Communication requirements
* Automation opportunities
* Edge cases
* Success criteria

Do not implement features purely from their names.

For example:

Build Lead Management

is not sufficient reason to immediately generate CRUD screens.

Understand how lead management works in this business first.

⸻

11. UX Philosophy

The product should feel:

* Lightweight
* Premium
* Fast
* Professional
* Calm
* Intuitive

Avoid traditional ERP complexity.

Prefer:

* Clear hierarchy
* Progressive disclosure
* Contextual actions
* Smart defaults
* Search
* Filters
* Saved views
* Quick actions
* Drawers where appropriate
* Focused forms

Avoid:

* Excessive dashboards
* Too many cards
* Unnecessary modals
* Long forms
* Dense interfaces
* Decorative UI without functional value

⸻

12. UX Decision Rule

For common workflows, ask:

What is the fastest safe way for this user to complete the task?

Optimize for daily usage rather than demo appearance.

⸻

13. Web and Mobile Responsibilities

The initial client is the responsive web application.

A native mobile application may be added later.

Do not build mobile during the current phase unless explicitly requested.

However:

* Backend APIs must remain client-independent.
* Business logic must not exist exclusively in React components.
* Validation should be reusable where practical.
* Storage must support non-browser clients.
* Authentication must not fundamentally depend on one client type.
* Notifications should allow future mobile push.
* APIs should use stable identifiers.

⸻

14. Mobile Product Thinking

Do not assume the future mobile app should reproduce the web CRM.

Mobile should primarily optimize:

See
↓
Act
↓
Update
↓
Move On

Likely mobile workflows include:

* Leads
* Follow-ups
* Customer visits
* Dealer visits
* Tasks
* Communication
* Notes
* Photos
* Collections
* Quotations
* Notifications

Complex administration should generally remain web-first.

⸻

15. Backend Authority

The backend is authoritative for:

* Authentication
* Authorization
* Business rules
* Permissions
* Organization isolation
* Branch access
* Important calculations
* Approval rules
* Data validation
* Workflow enforcement

Frontend checks improve UX.

They are not security controls.

⸻

16. API-First Principle

Business capabilities should be exposed through clearly defined APIs.

Avoid:

React Component
↓
Critical Business Logic
↓
Database Assumption

Prefer:

Web / Future Mobile / Integration
↓
API
↓
Application Service
↓
Business Rules
↓
Data Layer

⸻

17. API Standards

Unless otherwise approved:

Use:

REST
/api/v1/

APIs should consistently support where applicable:

* Pagination
* Search
* Filtering
* Sorting
* Validation
* Standard errors

Avoid returning unnecessarily large nested responses.

List APIs should generally return list-appropriate data.

Detail APIs may return richer information.

⸻

18. Database Rules

Use PostgreSQL and Prisma as defined in PROJECT_SETUP.md.

General rules:

* Use migrations.
* Never manually modify production schema.
* Prefer UUID identifiers.
* Store timestamps consistently.
* Store timestamps in UTC.
* Respect organization ownership.
* Add branch ownership where business requirements require it.
* Add indexes intentionally.
* Avoid unnecessary nullable fields.
* Define relationships explicitly.
* Do not add soft deletion everywhere automatically.

⸻

19. Organization Isolation

Organization isolation is a security boundary.

Never trust:

organizationId

provided by a frontend request without validating it against authenticated context.

Business queries must respect organization boundaries.

Cross-organization access must never occur accidentally.

⸻

20. Branch Access

Branch-level visibility should be enforced where applicable.

A user’s ability to see records should depend on:

* Organization
* Role
* Permission
* Branch
* Ownership

depending on the relevant business rule.

Do not hardcode branch assumptions into frontend components.

⸻

21. RBAC

Roles and permissions must remain configurable.

Do not write logic such as:

if role === "Sales Manager"

throughout the application when the requirement is fundamentally permission-based.

Prefer capabilities such as:

lead.view
lead.create
lead.assign
quotation.approve
invoice.view
payment.record

Exact permission conventions should be established consistently when RBAC is implemented.

⸻

22. Shared Code

Use shared packages only for genuinely reusable code.

Potential shared packages:

packages/types
packages/validation
packages/config
packages/utils

Shared code must remain client-independent where intended for both web and future mobile.

Do not move code into shared packages merely because two files look similar.

⸻

23. UI Package

packages/ui is primarily for reusable web UI.

Do not assume it will be used by future React Native applications.

Web and native mobile should use platform-appropriate UI.

⸻

24. Business Logic Placement

Avoid important business logic inside:

* React components
* UI event handlers
* Database controllers
* Provider integrations

Prefer:

Controller
↓
Application/Domain Service
↓
Repository/Data Access

External providers should sit behind infrastructure interfaces.

⸻

25. Integration Principle

Never tightly couple core business logic to a specific third-party provider.

Examples:

Do not make:

LeadService → Twilio

Prefer:

Lead Workflow
↓
Communication Service
↓
Messaging Provider
↓
Configured Provider

This applies to:

* WhatsApp
* Email
* SMS
* Payments
* Storage
* Accounting
* Logistics
* AI
* Maps

⸻

26. Communication Infrastructure

WhatsApp, Email and SMS are platform capabilities.

Do not independently implement communication logic inside:

* Leads
* Sales
* Billing
* Purchase
* Customer Support

Business modules should request communication through common infrastructure.

⸻

27. Communication Tracking

Where appropriate, communications should be traceable to relevant business records.

Examples:

* Lead
* Customer
* Dealer
* Quotation
* Order
* Invoice
* Purchase Order
* Support Ticket

This supports the future unified activity timeline.

⸻

28. Automation

Whenever repetitive work appears, evaluate automation.

But do not automatically implement automation.

First determine:

* Trigger
* Conditions
* Action
* Failure behavior
* Permissions
* Notification requirements
* Audit requirements

Automation should reduce work without creating hidden or unpredictable behavior.

⸻

29. Events

Use internal application/domain events where they reduce coupling.

Examples:

LeadCreated
QuotationApproved
OrderCreated
InvoiceGenerated
PaymentReceived

Do not introduce external event infrastructure without a demonstrated requirement.

⸻

30. Background Jobs

Use background processing for operations that are:

* Slow
* Retryable
* Scheduled
* External-provider dependent

Examples:

* Email
* WhatsApp
* SMS
* PDF generation
* Reports
* Imports
* Exports
* Synchronization

Do not unnecessarily queue simple synchronous database operations.

⸻

31. External Provider Failures

Always assume external providers can fail.

Integration code should consider:

* Timeout
* Invalid credentials
* Rate limiting
* Provider outage
* Invalid payload
* Retry
* Duplicate callback
* Partial failure

Do not treat a successful API request to our backend as proof that an external message/payment/action succeeded.

⸻

32. Idempotency

Use idempotency where duplicate operations could create meaningful business problems.

Examples:

* Payments
* Invoice generation
* Order submission
* Webhooks
* Message sending

Do not introduce idempotency complexity to every endpoint without need.

⸻

33. Error Handling

Errors should be:

* Predictable
* Structured
* Safe
* Useful

Never expose:

* Stack traces
* Credentials
* Database internals
* Secret keys
* Infrastructure details

to normal users.

⸻

34. Logging

Use structured logs.

Include useful context where available:

* Request ID
* User ID
* Organization ID
* Module
* Operation

Never log:

* Passwords
* Access tokens
* Refresh tokens
* API secrets
* Payment secrets
* Sensitive authentication information

⸻

35. Security

Security must be considered during implementation.

Always consider:

* Authentication
* Authorization
* Organization isolation
* Input validation
* Output safety
* Rate limiting
* CORS
* Secure headers
* Secret handling
* File validation
* Auditability

Do not postpone obvious security boundaries until the end of development.

⸻

36. Secrets

Never place real secrets in:

* Source code
* Documentation
* Example files
* Git
* Test fixtures
* Screenshots

Use environment variables and approved secret-management mechanisms.

.env.example should contain variable names and safe examples only.

⸻

37. Dependency Discipline

Before installing a new dependency:

1. Check whether the project already has a solution.
2. Determine whether the dependency is actually necessary.
3. Prefer mature, maintained packages.
4. Avoid large dependencies for trivial functionality.
5. Consider security and maintenance impact.

Do not install packages speculatively.

⸻

38. TypeScript

Use TypeScript strict mode.

Avoid:

any

unless genuinely unavoidable and documented.

Prefer explicit types at system boundaries.

Allow inference where it improves readability without sacrificing safety.

⸻

39. Code Quality

Code should be:

* Readable
* Predictable
* Modular
* Testable
* Consistent

Prefer clear code over clever code.

Do not create abstractions before there is a meaningful abstraction to create.

⸻

40. Naming

Names should communicate business intent.

Prefer:

createQuotation()
assignLead()
recordPayment()
approveDiscount()

over generic names such as:

processData()
handleItem()
doAction()

⸻

41. Comments

Comments should explain:

Why

not simply repeat:

What

the code already says.

Do not fill straightforward code with unnecessary comments.

⸻

42. File Size & Responsibilities

Avoid files that accumulate unrelated responsibilities.

Split files when doing so improves:

* Understandability
* Testability
* Domain boundaries

Do not fragment simple functionality into excessive tiny files merely to satisfy an arbitrary file-size rule.

⸻

43. Testing

Tests should protect important behavior.

Prioritize:

* Authentication
* Authorization
* Organization isolation
* Business calculations
* Workflow rules
* Payments
* Approvals
* Integrations
* Critical API flows

Do not chase test coverage percentages at the expense of meaningful tests.

⸻

44. Test Behavior, Not Implementation Details

Prefer tests such as:

Sales Executive cannot access another organization’s lead.

over:

Method X was called exactly once internally.

Test business outcomes where possible.

⸻

45. Verification Is Mandatory

A task is not complete because files were created.

Run relevant verification.

Depending on the change, this may include:

lint
typecheck
tests
build
migration
seed
API check
health check

Report what was actually executed.

Never claim something was verified if it was not run.

⸻

46. Do Not Hide Failures

If a command fails:

1. Read the error.
2. Identify the root cause.
3. Fix the root cause where within scope.
4. Run verification again.

Do not:

* Disable tests
* Remove type checking
* Ignore errors
* Add unsafe casts
* Suppress warnings

simply to make a task appear complete.

⸻

47. Git Safety

Before significant changes, inspect Git status.

Do not:

* Delete unrelated user work
* Reset changes you did not create
* Rewrite history
* Force push
* Push automatically
* Commit secrets

unless explicitly instructed.

⸻

48. Commits

When asked to commit, create focused commits.

Use conventional-style messages where practical.

Examples:

feat(auth): add authentication foundation
feat(database): add organization and branch models
fix(rbac): enforce organization permission boundary
chore(repo): configure pnpm workspace

Do not bundle unrelated changes into one commit unnecessarily.

⸻

49. Remote Repository

Do not:

* Create remote repositories
* Push
* Merge
* Open pull requests
* Delete branches

unless explicitly instructed.

Local Git setup is allowed when required by the approved setup step.

⸻

50. Documentation

Update documentation when implementation changes something developers need to know.

Examples:

* Installation
* Environment variables
* Commands
* Architecture decisions
* Migration procedure
* Provider setup

Do not create documentation for every trivial implementation detail.

⸻

51. Environment Changes

When adding a new environment variable:

1. Add it to the appropriate configuration validation.
2. Add its name to .env.example.
3. Document it where necessary.
4. Never commit its real secret value.

⸻

52. Database Changes

Before changing schema:

1. Understand the business requirement.
2. Inspect existing schema.
3. Consider relationships.
4. Consider organization isolation.
5. Consider indexes.
6. Consider migration impact.
7. Create migration.
8. Verify migration.
9. Update seed/test data where required.

Do not modify the database casually from UI requirements alone.

⸻

53. Destructive Operations

Before performing potentially destructive operations such as:

* Dropping tables
* Removing migrations
* Deleting large directories
* Resetting databases
* Rewriting Git history
* Removing dependencies used elsewhere

stop and obtain approval unless the action is clearly required and safely confined to disposable local/test data.

⸻

54. Data Integrity

Financial and operational records require particular care.

Do not silently overwrite important historical information.

Consider history/audit requirements for:

* Quotations
* Orders
* Invoices
* Payments
* Discounts
* Approvals
* Stock movements

Historical business records may require different behavior from ordinary editable records.

⸻

55. Money

Do not use floating-point arithmetic for authoritative monetary calculations.

Use appropriate decimal/money handling.

Always consider:

* Currency
* Tax
* Discount
* Rounding
* Quantity
* Unit price

Financial calculations should ultimately be authoritative on the backend.

⸻

56. Dates and Time

Store timestamps in UTC.

Convert for presentation based on configured organization/user timezone.

Do not make business logic depend on the developer machine’s local timezone.

⸻

57. Files

File handling should use the shared storage infrastructure.

Do not store large business documents directly in PostgreSQL unless a specific requirement justifies it.

Validate:

* Type
* Size
* Permission
* Ownership

⸻

58. Accessibility

Frontend implementation should consider:

* Semantic HTML
* Keyboard navigation
* Focus visibility
* Labels
* Error announcements
* Contrast
* Touch targets

Accessibility is part of implementation quality.

⸻

59. Responsive Design

Do not implement desktop-only interfaces unless the requirement is explicitly desktop-only.

At minimum, consider:

* Desktop
* Tablet
* Mobile web

Future native mobile remains a separate client.

⸻

60. Performance

Do not prematurely optimize.

However, avoid obvious performance problems such as:

* Fetching entire large datasets
* N+1 database queries
* Unnecessary rerenders
* Huge API payloads
* Repeated identical requests
* Unindexed high-frequency database lookups

Measure before introducing complex optimization infrastructure.

⸻

61. AI Features

AI is a future platform capability.

When AI features are eventually introduced:

AI should:

* Assist
* Summarize
* Suggest
* Draft
* Extract
* Predict where appropriate

AI should not silently make high-impact business decisions without appropriate user visibility or controls.

Do not add AI functionality during unrelated implementation work.

⸻

62. UI Content

Use clear business language.

Prefer:

Customers
Assign Salesperson
Payment Due
Create Quotation

over unnecessarily technical or ERP-style language.

Labels should reflect how actual users describe their work.

⸻

63. Empty States

Empty states should explain:

* What the area contains
* Why it may be empty
* What the user can do next

Avoid decorative empty states that provide no useful action.

⸻

64. Loading & Error States

Every asynchronous user-facing workflow should consider:

* Loading
* Success
* Empty
* Error
* Retry

Do not design only the ideal success state.

⸻

65. Audit Thinking

For sensitive operations ask:

If management asks six months later who changed this and why, do we need to know?

If yes, consider appropriate audit/history requirements.

⸻

66. Communication Thinking

For communication-related features ask:

Should this interaction become part of the customer’s or lead’s history?

If yes, use shared communication infrastructure rather than an isolated provider call.

⸻

67. Integration Thinking

Before building functionality internally ask:

Is this a core CRM capability or should an established external system provide it?

Examples:

Accounting may integrate with Tally/Zoho Books.

Payments may integrate with Razorpay/Stripe.

Logistics may integrate with shipping providers.

Do not recreate mature external platforms without a business reason.

⸻

68. Assumptions

If a small assumption is required and is low-risk:

* State it.
* Choose the simplest reasonable option.
* Continue.

If the assumption materially affects:

* Architecture
* Security
* Business workflow
* Data model
* Scope
* Cost
* External provider choice

stop and request clarification/approval.

⸻

69. Architectural Decisions

For significant architecture changes, explain:

Current Approach

What exists today.

Proposed Change

What should change.

Reason

Why.

Benefits

What improves.

Trade-offs

What becomes more complex or constrained.

Migration Impact

What existing code/data is affected.

Do not silently introduce major architectural changes.

⸻

70. Completion Report

After completing an implementation step, report:

Completed

What was implemented.

Files Changed

Important files created/modified.

Verification

Commands/checks actually run and their result.

Decisions

Any meaningful decisions made.

Issues

Warnings, failures, technical debt, or unresolved items.

Git Status

Relevant working-tree status.

Next Step

Recommend exactly one logical next step.

Then stop if the work is being performed under a step-by-step phase.

⸻

71. Do Not Report False Completion

Never say:

* “Everything works”
* “Tests pass”
* “Build successful”
* “Database is connected”

unless the relevant verification was actually performed successfully.

If something could not be verified, say:

Not verified because…

and explain why.

⸻

72. Phase 0 Special Rule

While PROJECT_SETUP.md Phase 0 is active:

Do not implement business modules.

Specifically do not implement:

* Leads
* Customers
* Contacts
* Quotations
* Sales Orders
* Purchase Orders
* Inventory
* Billing
* Customer Support
* Reports
* AI

unless explicitly instructed to change Phase 0 scope.

Foundation entities explicitly listed in PROJECT_SETUP.md are allowed.

⸻

73. Design Phase Special Rule

When the project enters UX/UI design:

Do not jump directly into high-fidelity screens.

Use:

Business Requirement
↓
Workflow
↓
Information Architecture
↓
Screen Inventory
↓
User Flow
↓
Wireframe Structure
↓
Components
↓
States & Edge Cases
↓
High-Fidelity UI

unless a previous approved artifact already covers the earlier stages.

⸻

74. Development Phase Special Rule

When implementing an approved feature:

First inspect:

* Approved feature/module documentation
* Existing design
* Existing APIs
* Database schema
* Permissions
* Shared components

Do not redesign the feature during implementation unless an implementation problem requires reconsideration.

⸻

75. Refactoring Rule

Do not perform broad unrelated refactoring while implementing a focused feature.

If important technical debt is discovered:

1. Document it.
2. Explain its impact.
3. Recommend whether it should be fixed now or separately.

Keep feature changes reviewable.

⸻

76. TODO Rule

Avoid leaving vague TODOs.

Bad:

TODO: fix later

Better:

TODO: Add provider retry policy when WhatsApp integration is implemented.

If a TODO represents required functionality for the current task, complete it rather than postponing it.

⸻

77. Generated Code

Review generated scaffolding before accepting it.

Remove:

* Unused sample code
* Default demo components
* Placeholder assets
* Unnecessary dependencies
* Framework boilerplate not relevant to the project

Do not leave starter-template clutter in the repository.

⸻

78. Developer Experience

A developer should be able to understand:

* How to install
* How to run
* How to test
* How to migrate
* How to seed
* How to build

without needing undocumented instructions.

When setup changes, keep developer documentation accurate.

⸻

79. Final Decision Framework

When uncertain between two implementation approaches, prioritize in this order:

1. Correctness
2. Security
3. Data Integrity
4. Simplicity
5. Maintainability
6. User Experience
7. Performance
8. Extensibility
9. Development Speed

Do not sacrifice the first three merely to ship faster.

⸻

80. Final Working Principle

The goal is not to produce the maximum amount of code.

The goal is to build a system that is:

Simple to use.

Easy to understand.

Safe to change.

Reliable in production.

Ready to grow.

For every implementation decision ask:

Does this make the next part of the project easier and safer to build?

If not, reconsider whether the complexity is justified.
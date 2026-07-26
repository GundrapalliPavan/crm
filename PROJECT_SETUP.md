PROJECT_SETUP.md

Electrical Distribution CRM — Project Foundation & Setup

Document Type: Technical Foundation Specification
Phase: Phase 0 — Project Setup
Status: Ready for Implementation
Related Document: PROJECT.md

⸻

1. Purpose

This document defines the complete technical foundation that must be established before feature development begins.

The objective of Phase 0 is to create a clean, scalable, secure, maintainable, and developer-friendly foundation for the Electrical Distribution CRM.

Do NOT start implementing business modules such as:

* Leads
* Contacts
* Customers
* Sales
* Quotations
* Purchase Orders
* Billing
* Inventory
* Reports
* Customer Support

until the project foundation defined in this document has been completed and verified.

Phase 0 should produce a working application skeleton and development environment, not business features.

⸻

2. Phase 0 Objectives

At the end of project setup, the following should work:

* Git repository
* Monorepo/project structure
* Frontend application
* Backend application
* PostgreSQL database
* Database migrations
* Database seed mechanism
* Environment configuration
* Authentication foundation
* Authorization/RBAC foundation
* Organization and branch foundation
* API architecture
* API documentation
* Error handling
* Logging
* File storage abstraction
* Background jobs architecture
* Communication provider architecture
* Integration architecture
* Notification architecture
* Testing infrastructure
* Docker-based local development
* CI/CD foundation
* Development/staging/production environments
* GCP deployment architecture
* Security baseline
* Health monitoring
* Developer documentation

A developer should be able to clone the repository and start the application without needing undocumented manual configuration.

⸻

3. Engineering Principles

The following principles are mandatory.

3.1 Simplicity First

Do not introduce infrastructure simply because it may be useful someday.

Every dependency must have a clear purpose.

Avoid unnecessary microservices.

Start with a modular monolith unless there is a demonstrated reason not to.

⸻

3.2 Modular Architecture

Business domains must remain logically separated.

Modules should communicate through clearly defined interfaces.

Avoid circular dependencies.

Avoid direct coupling between unrelated domains.

⸻

3.3 Configuration Over Hardcoding

Values that may change between environments or customers must not be hardcoded.

Examples:

* API URLs
* Provider credentials
* Storage configuration
* Email sender
* WhatsApp provider
* SMS provider
* Tax configuration
* Feature flags

Use configuration and environment variables appropriately.

⸻

3.4 Provider Abstraction

Third-party services must not be tightly coupled to business logic.

For example:

Business Logic

↓

Messaging Interface

↓

WhatsApp Provider

instead of:

Business Logic

↓

Direct Meta API Calls

This principle applies to:

* WhatsApp
* SMS
* Email
* Payments
* Storage
* Accounting
* Logistics
* AI
* Maps

⸻

4. Technology Stack

Use the following as the default stack unless a technical issue provides a strong reason to change it.

Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod

Use a lightweight state-management solution only when application-wide client state genuinely requires it.

Do not use global state for server data that should be managed through TanStack Query.

⸻

5. Backend

Use:

* Node.js
* TypeScript
* NestJS

Backend responsibilities include:

* REST APIs
* Authentication
* Authorization
* Business logic
* Database access
* Integrations
* Background jobs
* Notifications
* Webhooks
* File handling
* Audit logging

Start with REST APIs.

Do not introduce GraphQL during Phase 0 unless a confirmed requirement justifies it.

⸻

6. Database

Primary database:

PostgreSQL

Use PostgreSQL for transactional business data.

Recommended ORM:

Prisma

Use Prisma for:

* Schema definition
* Type-safe database access
* Migrations
* Seed scripts

Raw SQL may be used where PostgreSQL-specific functionality or performance requirements justify it.

⸻

7. Architecture Strategy

Start with a:

Modular Monolith

Do NOT start with microservices.

The CRM has significant domain complexity, but microservices would introduce unnecessary operational complexity during early development.

Architecture should nevertheless allow major modules to be extracted later if scale requires it.

High-level architecture:

Client

↓

React Application

↓

NestJS API

↓

Domain / Application Layer

↓

Infrastructure Layer

↓

PostgreSQL / Storage / Queues / External Providers

⸻

8. Repository Strategy

Use a monorepo.

Recommended structure:

electrical-crm/
│
├── apps/
│   │
│   ├── web/
│   │   └── React application
│   │
│   └── api/
│       └── NestJS application
│
├── packages/
│   │
│   ├── ui/
│   │   └── Shared UI components
│   │
│   ├── types/
│   │   └── Shared TypeScript types
│   │
│   ├── validation/
│   │   └── Shared validation schemas where appropriate
│   │
│   ├── config/
│   │   └── Shared configuration
│   │
│   └── utils/
│       └── Shared utilities
│
├── database/
│   ├── prisma/
│   ├── migrations/
│   └── seed/
│
├── infrastructure/
│   ├── docker/
│   ├── scripts/
│   └── deployment/
│
├── docs/
│
├── .github/
│   └── workflows/
│
├── PROJECT.md
├── PROJECT_SETUP.md
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
└── package.json

Claude may recommend small structural changes if technically justified.

Do not substantially change the architecture without documenting the reason.

⸻

9. Package Management

Use one package manager consistently across the repository.

Preferred:

pnpm

Configure workspaces for the monorepo.

Avoid mixing:

* npm
* yarn
* pnpm

within the same project.

⸻

10. Frontend Architecture

Recommended structure:

apps/web/src/
├── app/
│   ├── router/
│   ├── providers/
│   └── config/
│
├── assets/
│
├── components/
│   ├── common/
│   └── layout/
│
├── features/
│
├── hooks/
│
├── lib/
│   ├── api/
│   ├── auth/
│   └── validation/
│
├── pages/
│
├── services/
│
├── styles/
│
├── types/
│
└── utils/

Feature-specific code should eventually live close to its feature rather than creating large global directories.

⸻

11. Backend Architecture

Recommended structure:

apps/api/src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
│
├── config/
│
├── database/
│
├── infrastructure/
│   ├── email/
│   ├── messaging/
│   ├── notifications/
│   ├── queue/
│   ├── storage/
│   └── integrations/
│
├── modules/
│
├── app.module.ts
└── main.ts

Future business modules will be added under:

modules/

Examples:

modules/
├── auth/
├── users/
├── organizations/
├── branches/
├── leads/
├── contacts/
├── sales/
├── inventory/
└── billing/

Only foundation modules should be implemented during Phase 0.

⸻

12. Foundational Data Model

Before business modules are implemented, establish the minimum organizational foundation.

Core entities should include:

Organization

Represents the business using the CRM.

Suggested fields:

* id
* name
* legalName
* email
* phone
* taxIdentifier
* timezone
* currency
* locale
* status
* createdAt
* updatedAt

⸻

Branch

An organization may operate multiple branches.

Suggested fields:

* id
* organizationId
* name
* code
* phone
* email
* address
* status
* createdAt
* updatedAt

⸻

User

Suggested fields:

* id
* organizationId
* primaryBranchId
* firstName
* lastName
* email
* phone
* passwordHash
* status
* lastLoginAt
* createdAt
* updatedAt

⸻

Role

Examples:

* Super Admin
* Owner
* Branch Manager
* Sales Manager
* Sales Executive
* Billing Executive
* Purchase Executive
* Warehouse Staff
* Accountant
* Customer Support

Do not hardcode role behavior into UI components.

⸻

Permission

Permissions should support actions such as:

* view
* create
* update
* delete
* assign
* approve
* export
* manage

Permissions should eventually support module/resource-level control.

⸻

UserRole

Allows users to receive one or more roles where required.

⸻

Team

Foundation for sales and operational teams.

⸻

Address

Reusable address entity/value structure where practical.

⸻

AuditLog

Track sensitive and important system changes.

Suggested fields:

* id
* organizationId
* userId
* action
* entityType
* entityId
* oldValues
* newValues
* metadata
* createdAt

⸻

13. Database Standards

Use UUIDs for primary identifiers unless there is a strong technical reason otherwise.

Standard records should normally contain:

* id
* createdAt
* updatedAt

Business records should support organization ownership.

Where relevant:

* organizationId
* branchId
* createdBy
* updatedBy

Use soft deletion only where business or audit requirements justify it.

Do not automatically add soft delete to every table.

⸻

14. Multi-Organization Architecture

Design the data model so every customer’s data is isolated.

Most business records should belong to:

organizationId

Where relevant:

branchId

Never trust organization identifiers supplied directly by the frontend without validating them against the authenticated user/session.

Organization context should be resolved server-side.

⸻

15. Authentication

Phase 0 should establish authentication infrastructure.

Support architecture for:

* Email/password login
* Logout
* Token/session handling
* Refresh strategy
* Password reset
* Email verification
* Account status
* Session invalidation

OAuth should remain possible for future integrations.

Possible future providers:

* Google
* Microsoft

⸻

16. Authorization

Implement RBAC foundation.

Authorization hierarchy:

User

↓

Organization

↓

Role

↓

Permissions

↓

Resource Access

Backend authorization is mandatory.

Frontend permission checks exist only for UX and must never be considered security controls.

⸻

17. API Standards

Use REST.

Version APIs.

Example:

/api/v1/

Use predictable resource naming.

Example:

GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

Standardize:

* Pagination
* Filtering
* Sorting
* Search
* Validation
* Error responses

⸻

18. API Documentation

Configure Swagger/OpenAPI.

Development environments should expose interactive API documentation.

API documentation must describe:

* Endpoint
* Request
* Parameters
* Response
* Authentication requirements
* Common errors

⸻

19. Validation

Never trust frontend input.

Use backend DTO validation.

Use Zod on frontend where appropriate.

Validate:

* API payloads
* Environment variables
* Query parameters
* Route parameters
* File uploads
* Webhook payloads

⸻

20. Error Handling

Implement centralized backend exception handling.

Do not expose:

* Stack traces
* Database errors
* Credentials
* Internal infrastructure details

to end users.

Recommended API error structure:

{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "The request contains invalid information.",
  "errors": [],
  "requestId": "..."
}

⸻

21. Logging

Implement structured logging.

Logs should support:

* Timestamp
* Level
* Request ID
* User ID where available
* Organization ID where available
* Service/module
* Message
* Relevant metadata

Never log:

* Passwords
* Authentication tokens
* API secrets
* Sensitive payment information

⸻

22. Request Correlation

Generate a unique request/correlation ID for API requests.

Use the ID across:

* API logs
* Errors
* Background jobs
* Integration calls

This will make production debugging significantly easier.

⸻

23. File Storage Architecture

Create a storage abstraction.

Example:

StorageProvider
upload()
download()
delete()
getSignedUrl()

Initial cloud implementation:

Google Cloud Storage

Local development may use local storage or a compatible development implementation.

Business modules should never call GCP storage APIs directly.

⸻

24. Communication Architecture

Communication must be designed as shared infrastructure.

Do not implement WhatsApp separately inside Leads, Billing, Sales, etc.

Create a communication layer.

Conceptual model:

Business Module
↓
Communication Service
↓
Channel
├── WhatsApp
├── Email
└── SMS
↓
Provider

⸻

25. WhatsApp Architecture

Create a provider interface such as:

WhatsAppProvider
sendText()
sendTemplate()
sendDocument()
sendMedia()
getDeliveryStatus()

Potential providers:

* Meta WhatsApp Cloud API
* Twilio
* Interakt
* AiSensy

Do not integrate every provider during Phase 0.

Establish the interface and provider architecture first.

⸻

26. Email Architecture

Create:

EmailProvider
send()
sendTemplate()
sendAttachment()

Potential implementations:

* Google Workspace
* Microsoft 365
* Amazon SES
* SendGrid

Provider choice should remain configurable.

⸻

27. SMS Architecture

Create:

SmsProvider
send()
sendTemplate()

Potential providers:

* MSG91
* Twilio

Do not hardcode provider-specific logic into business modules.

⸻

28. Communication Log

Future communication should be capable of being stored centrally.

Conceptual record:

Communication
id
organizationId
entityType
entityId
channel
direction
recipient
subject
content/reference
provider
providerMessageId
status
sentAt
deliveredAt
failedAt
createdBy
createdAt

This will eventually power the unified activity timeline.

⸻

29. Template Architecture

Design communication infrastructure to support reusable templates.

Examples:

* Quotation Sent
* Invoice Generated
* Payment Reminder
* Lead Welcome
* Order Confirmation
* Delivery Update

Templates should eventually support variables such as:

{{customer_name}}
{{invoice_number}}
{{amount}}
{{due_date}}
{{salesperson_name}}

Do not build a full template editor during Phase 0.

⸻

30. Notification Architecture

Separate business events from notification channels.

Example:

InvoiceOverdue
↓
Notification Service
├── In-App
├── Email
├── WhatsApp
└── SMS

Business logic should generate events.

Notification rules should determine delivery channels.

⸻

31. Background Jobs

Long-running or retryable operations should not block HTTP requests.

Prepare infrastructure for jobs such as:

* Email sending
* WhatsApp messages
* SMS
* PDF generation
* Imports
* Exports
* Scheduled reminders
* Report generation
* Integration synchronization

Preferred queue technology:

Redis + BullMQ

Only introduce Redis when the queue infrastructure is actually implemented.

⸻

32. Scheduled Tasks

Architecture should support:

* Follow-up reminders
* Payment reminders
* Daily reports
* Integration synchronization
* Scheduled notifications

Avoid uncontrolled cron jobs scattered throughout modules.

Use centralized scheduling infrastructure.

⸻

33. Event Architecture

Use domain/application events where they simplify module interaction.

Example:

LeadCreated
QuotationApproved
OrderCreated
InvoiceGenerated
InvoiceOverdue
PaymentReceived

Events should allow future automation without tightly coupling modules.

Do not introduce an external event broker during Phase 0 unless required.

Internal application events are sufficient initially.

⸻

34. Integration Architecture

Create a clear integration boundary.

Future integrations include:

Messaging

* WhatsApp
* SMS
* Email

Accounting

* Tally
* Zoho Books
* QuickBooks

Payments

* Razorpay
* Stripe
* Cashfree
* UPI

Google

* Maps
* Places
* Calendar
* Gmail
* Drive

Microsoft

* Outlook
* Calendar
* OneDrive
* Teams

Logistics

* Shiprocket
* Delhivery
* Blue Dart
* DTDC

AI

* OpenAI
* Claude
* Gemini

Phase 0 should establish architecture, not implement all integrations.

⸻

35. Webhooks

Create a reusable webhook architecture.

Webhooks may eventually receive events from:

* WhatsApp
* Payments
* Logistics
* Email providers
* Accounting systems

Webhook infrastructure must consider:

* Signature verification
* Idempotency
* Retry handling
* Logging
* Duplicate events
* Invalid payloads

⸻

36. Idempotency

Critical operations should be designed to prevent accidental duplication.

Especially:

* Payments
* Webhooks
* Invoice generation
* Orders
* Message sending

Where necessary, use idempotency keys.

⸻

37. Frontend API Layer

Frontend components must not directly contain raw HTTP request logic.

Use a centralized API layer.

Conceptually:

UI
↓
Feature Hook
↓
API Service
↓
HTTP Client

Centralize:

* Base URL
* Authentication headers
* Refresh behavior
* Request handling
* Error normalization

⸻

38. Data Fetching

Use TanStack Query for server state.

Use it for:

* Queries
* Mutations
* Cache invalidation
* Loading states
* Retry behavior

Do not duplicate server data unnecessarily in global state.

⸻

39. Forms

Use:

React Hook Form

Zod

Establish reusable form patterns for:

* Text inputs
* Selects
* Dates
* Phone numbers
* Currency
* Addresses
* Uploads
* Validation errors

⸻

40. Design System Foundation

Do not build all CRM screens during Phase 0.

Establish only the design-system foundation required for future development.

Include:

* Colors
* Typography
* Spacing
* Border radius
* Shadows
* Breakpoints
* Icons
* Form controls
* Buttons
* Basic layout primitives

All visual values should come from tokens where practical.

Avoid random one-off styling.

⸻

41. Responsive Foundation

Support:

Desktop

Tablet

Mobile

Field sales workflows will rely heavily on mobile-sized interfaces.

Responsive behavior must be considered from the beginning.

⸻

42. Accessibility

Foundation should support:

* Semantic HTML
* Keyboard navigation
* Focus states
* Accessible labels
* Sufficient contrast
* Screen-reader-friendly controls

Accessibility should not be retrofitted later.

⸻

43. Environment Strategy

Support separate environments:

local
development
staging
production

Never use production credentials in development.

⸻

44. Environment Variables

Provide:

.env.example

It should contain variable names but never secrets.

Possible categories:

APP_
DATABASE_
AUTH_
REDIS_
STORAGE_
EMAIL_
WHATSAPP_
SMS_
GOOGLE_
MICROSOFT_
PAYMENT_
LOGGING_

Validate required environment variables when the application starts.

Fail clearly if critical configuration is missing.

⸻

45. Secrets Management

Production secrets must not live in:

* Git
* Source code
* Docker images
* Documentation

For GCP deployment, use:

Google Cloud Secret Manager

where appropriate.

⸻

46. Local Development

Local development should be simple.

Preferred approach:

pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev

Developers should not need to manually install PostgreSQL if Docker is available.

⸻

47. Docker

Docker Compose should initially support:

* PostgreSQL
* Redis when required

Application containers may also be supported where useful.

Avoid making local development unnecessarily slow or complicated.

⸻

48. Seed Data

Create a repeatable development seed process.

Initial seed data may include:

Organization:

Demo Electrical Distribution Pvt Ltd

Branch:

Head Office

Users:

Admin
Owner
Sales Manager
Sales Executive

Roles and permissions should also be seeded.

Never use real customer information in development seed data.

⸻

49. Database Migrations

All schema changes must use migrations.

Never manually modify production database structures.

Migration history must be committed to Git.

Migrations should be reviewed before production deployment.

⸻

50. Database Backup Strategy

Production architecture should include:

* Automated backups
* Point-in-time recovery where appropriate
* Defined retention
* Restore procedure

A backup that has never been tested for restoration should not be considered sufficient.

⸻

51. Testing Foundation

Establish testing before business modules grow.

Support:

Unit Tests

Business logic and utilities.

Integration Tests

Database and service interactions.

API/E2E Tests

Critical backend flows.

Frontend Tests

Important components and workflows.

Do not chase arbitrary coverage percentages.

Prioritize meaningful coverage of business-critical behavior.

⸻

52. Code Quality

Configure:

* ESLint
* Prettier
* TypeScript strict mode

Where practical, add pre-commit checks.

The repository should reject obvious:

* Lint failures
* Type failures
* Broken tests

before deployment.

⸻

53. Git Strategy

Primary branches:

main
develop

Feature branches:

feature/<name>

Fixes:

fix/<name>

Examples:

feature/auth-foundation
feature/rbac
fix/token-refresh

Avoid committing directly to main.

⸻

54. Commit Standards

Use clear commits.

Examples:

feat(auth): add authentication foundation
feat(database): add organization schema
fix(api): handle expired refresh token
chore(ci): add backend test workflow

Prefer small, logically complete commits.

⸻

55. CI/CD

Initial pipeline should include:

Install
↓
Lint
↓
Type Check
↓
Tests
↓
Build

Deployment stages can then be added for:

Development
↓
Staging
↓
Production

Production deployments should not bypass quality checks.

⸻

56. Google Cloud Platform

Preferred cloud provider:

Google Cloud Platform

Plan architecture for:

* Application hosting
* PostgreSQL
* Object storage
* Secret management
* Logging
* Monitoring
* Backups
* Networking

Potential services include:

* Cloud Run
* Cloud SQL
* Cloud Storage
* Secret Manager
* Cloud Logging
* Artifact Registry

Do not provision expensive infrastructure unnecessarily during early development.

⸻

57. Domain & SSL

Production architecture must support:

app.example.com
api.example.com

All production traffic must use HTTPS.

Do not expose internal database services publicly.

⸻

58. Security Baseline

Implement or prepare for:

* Secure password hashing
* Input validation
* CORS configuration
* Rate limiting
* Secure HTTP headers
* Authentication guards
* Authorization guards
* Upload restrictions
* Token expiration
* Refresh-token protection
* Secrets management
* Audit logging

Security is a backend responsibility, not just a frontend concern.

⸻

59. File Upload Security

Validate:

* File type
* MIME type
* File size
* Authorization

Do not trust file extensions.

Generate controlled storage names instead of blindly using uploaded filenames.

⸻

60. Audit Architecture

Sensitive actions should eventually be auditable.

Examples:

* User created
* Role changed
* Discount approved
* Invoice changed
* Payment recorded
* Record deleted
* Data exported

Audit records should capture enough information to understand:

Who

Did what

To which record

When

and, where appropriate,

What changed.

⸻

61. Observability

Prepare the application for production troubleshooting.

Support:

* Application logs
* API error logs
* Integration logs
* Job failures
* Database errors
* Health checks

Create health endpoints such as:

/api/v1/health

Health checks should eventually cover critical dependencies.

⸻

62. Timezone Strategy

Store timestamps in UTC.

Display them according to organization/user timezone.

Never store formatted date strings as primary date values.

⸻

63. Currency Strategy

Do not assume every future customer uses the same currency.

Organization configuration should define default currency.

Financial records should explicitly store currency where required.

Never rely solely on UI formatting to determine currency.

⸻

64. Localization

Architecture should allow future localization.

Initial language:

English

Do not hardcode critical business logic around English UI labels.

Future languages may be introduced without restructuring the entire application.

⸻

65. Feature Flags

Design so major experimental or customer-specific capabilities can eventually be controlled using feature flags.

Do not implement a complex feature-management platform during Phase 0.

⸻

66. Developer Documentation

README should explain:

* Requirements
* Installation
* Environment setup
* Database setup
* Running locally
* Running tests
* Running migrations
* Seed data
* Building
* Common troubleshooting

A new developer should not need verbal instructions to start the project.

⸻


Future Mobile Application Readiness

The CRM will initially be developed as a responsive web application.

However, a native mobile application is expected to be introduced in the future, particularly for:

* Sales Executives
* Field Sales Executives
* Sales Managers
* Service Engineers
* Warehouse users where applicable

The initial architecture must therefore remain mobile-ready.

The objective is NOT to build the mobile application during the current phase.

The objective is to prevent architectural decisions that would make future mobile development difficult or require major backend restructuring.

⸻

Mobile Architecture Strategy

The future mobile application should be treated as another client of the same platform.

Expected future architecture:

                    ┌── Web Application
                    │
                    ├── Mobile Application
                    │
Client Layer ───────┤
                    ├── Future Dealer Portal
                    │
                    └── Future Customer Portal
                             │
                             ▼
                         API Layer
                             │
                             ▼
                   Application Services
                             │
                             ▼
                     Business / Domain
                             │
                             ▼
                       PostgreSQL

Business logic must not depend on whether the request originated from:

* Web
* Mobile
* Integration
* Future external client

The NestJS backend remains the authoritative business layer.

⸻

Future Mobile Technology Direction

Preferred future mobile stack:

* React Native
* Expo
* TypeScript

This is a direction, not a Phase 0 implementation requirement.

Do NOT create apps/mobile during Phase 0 unless explicitly instructed.

When mobile development begins, it should be introduced as:

apps/
├── web/
├── api/
└── mobile/

within the existing monorepo where practical.

⸻

API-First Requirement

All business operations must be accessible through clearly defined backend APIs.

Do not place authoritative business logic exclusively inside the React web application.

For example:

Incorrect:

Web Component
    ↓
Calculate Discount
    ↓
Calculate Tax
    ↓
Determine Approval
    ↓
Send Final Data

Preferred:

Web / Mobile
      ↓
     API
      ↓
Business Service
      ↓
Discount / Tax / Approval Rules

The same business rules must apply regardless of client.

⸻

Shared Packages

The monorepo should support sharing client-agnostic code.

Examples:

packages/
├── types/
├── validation/
├── config/
└── utils/

Potentially share:

* TypeScript domain types
* API contracts
* Enums
* Constants
* Validation schemas
* Formatting rules
* Client-independent utilities

Do not place browser-specific code inside shared packages.

⸻

UI Sharing Strategy

Do NOT assume the web and mobile applications will share the same UI components.

Web:

packages/ui

may contain React DOM components.

Future mobile UI should use native React Native components.

Business logic and contracts should be shared where useful.

Visual components should remain platform-appropriate.

Avoid abstractions created solely for the purpose of forcing UI reuse between web and mobile.

⸻

Authentication Must Support Multiple Client Types

Authentication architecture must not assume that browser-based authentication is the only client type.

The system should eventually support:

Web
Mobile
Future portals
External integrations

Authentication design should account for:

* Access tokens
* Refresh strategy
* Session management
* Session revocation
* Multiple devices
* Token expiration
* Secure credential storage
* Device identification where required

Web and mobile may use different secure token-storage mechanisms.

Do not expose authentication credentials through insecure client storage merely to make web and mobile behavior identical.

⸻

Session Architecture

Design sessions so a user can eventually be logged in from multiple devices.

Example:

User
├── Chrome — Office Laptop
├── Safari — Personal Laptop
├── Android Phone
└── iPhone

Future functionality may include:

* View active sessions
* Revoke individual session
* Logout all devices
* Device metadata
* Last activity
* Login history

Phase 0 only needs to ensure the authentication design does not prevent these capabilities.

⸻

Push Notification Readiness

The notification architecture defined in this project must support future mobile push notifications.

Conceptually:

Business Event
      ↓
Notification Service
      ↓
Channel Router
      │
      ├── In-App
      ├── Email
      ├── WhatsApp
      ├── SMS
      ├── Web Push
      └── Mobile Push

Do NOT implement mobile push notifications during Phase 0.

The architecture should simply allow the channel to be added later.

Potential future technologies may include:

* Firebase Cloud Messaging
* Apple Push Notification Service
* Expo Notifications

Provider choice should be made when mobile implementation begins.

⸻

Device Registration Readiness

Future architecture should allow registered user devices.

A future device model may contain:

Device
id
organizationId
userId
platform
deviceIdentifier
pushToken
appVersion
lastActiveAt
createdAt
updatedAt

Do NOT create this database model during Phase 0 unless authentication implementation genuinely requires it.

The current architecture must simply avoid preventing it later.

⸻

Deep Link Readiness

Future mobile notifications should be capable of opening specific CRM records.

Examples:

Lead
Quotation
Invoice
Task
Customer
Order
Approval
Support Ticket

Use stable record identifiers.

Do not design critical navigation around temporary UI state.

Future examples might conceptually resemble:

crm://leads/{leadId}
crm://invoices/{invoiceId}
crm://tasks/{taskId}

Actual deep-link implementation belongs to the mobile phase.

⸻

Offline Readiness

Field sales users may operate in locations with poor connectivity.

Future mobile functionality may require offline access for selected workflows.

Potential offline use cases:

* View today’s visits
* View assigned leads
* View customer information
* Add visit notes
* Record follow-up
* Capture photos
* Record collection information
* Create tasks
* Capture GPS check-in

Do NOT implement offline synchronization during Phase 0.

However, data architecture should support future synchronization.

⸻

Synchronization-Friendly Data

Where appropriate, records should use:

* Stable UUIDs
* createdAt
* updatedAt

Where business requirements justify it, future synchronization may also require:

* version
* sync status
* conflict metadata

Do not introduce these fields universally without a concrete requirement.

Avoid architecture that relies entirely on browser-local state as the source of truth.

The backend/database remains authoritative.

⸻

Idempotent Mobile Operations

Mobile clients may retry requests because of unstable connectivity.

Critical write operations should be capable of supporting idempotency where duplication would cause business problems.

Examples:

* Payment recording
* Order submission
* Invoice creation
* Customer check-in
* File upload
* Message sending

Do not add idempotency complexity to every API.

Apply it where duplicate execution would create meaningful business risk.

⸻

File Upload Readiness

Future mobile users may upload:

* Camera photos
* Gallery images
* Documents
* Receipts
* Visit photos
* Warranty images
* Product images
* Voice notes

File storage must therefore remain client-independent.

Correct:

Web / Mobile
      ↓
Upload API / Signed Upload
      ↓
Storage Provider
      ↓
Cloud Storage

Avoid browser-specific storage assumptions.

⸻

Location Services Readiness

Field sales workflows may eventually use device location.

Potential use cases:

* Customer visit check-in
* Dealer visit check-in
* Sales territory activity
* Nearby customers
* Route planning
* Visit verification

Location tracking must NOT be implemented as continuous employee surveillance by default.

Location should only be collected where required by an explicit business workflow and with appropriate user awareness and permissions.

Future implementation should consider:

* User permission
* Device permission
* Accuracy
* Timestamp
* Privacy
* Battery usage
* Offline behavior

⸻

Camera and Media Readiness

Future mobile workflows may use device capabilities including:

* Camera
* Photo library
* QR scanner
* Barcode scanner
* Microphone
* Location
* Phone dialer
* File system

Backend APIs should accept platform-independent data rather than depending on browser-specific behavior.

⸻

Communication from Mobile

The future mobile app may initiate:

* WhatsApp
* Phone calls
* Email
* SMS
* Internal messages

Where communication must be tracked by CRM, server-side communication infrastructure should remain the authoritative path.

For example:

Mobile
   ↓
CRM API
   ↓
Communication Service
   ↓
WhatsApp Provider

rather than implementing independent provider logic directly inside the mobile application.

Native device actions such as opening the phone dialer may still be used where appropriate.

⸻

Real-Time Readiness

Future mobile users may need real-time updates for:

* Lead assignment
* Tasks
* Approvals
* Messages
* Order updates
* Collection alerts
* Notifications

Do not implement complex real-time infrastructure prematurely.

The architecture should allow future use of:

* WebSockets
* Server-Sent Events
* Push Notifications

based on the actual requirement.

⸻

API Pagination and Mobile Performance

All potentially large API collections must support server-side pagination.

Examples:

* Leads
* Customers
* Products
* Orders
* Invoices
* Activities
* Communications

Do not design APIs that require downloading an organization’s complete dataset to display a list.

Support appropriate:

* Pagination
* Filtering
* Sorting
* Search
* Field selection where useful

This benefits both web and mobile performance.

⸻

Network Efficiency

Future mobile clients may operate on slow or metered connections.

APIs should avoid unnecessarily large responses.

Do not return large nested objects when a summary representation is sufficient.

Example:

List endpoint:

GET /api/v1/leads

should return the information required for the list.

Detailed information can be retrieved through:

GET /api/v1/leads/:id

where appropriate.

⸻

API Versioning

Continue using versioned APIs:

/api/v1/

Mobile applications may not always update immediately when backend changes are deployed.

Avoid breaking API changes without an appropriate migration/versioning strategy.

This becomes especially important after native mobile applications are released through app stores.

⸻

Mobile Security Readiness

Never assume a mobile application is a trusted environment.

The backend must continue enforcing:

* Authentication
* Authorization
* Organization isolation
* Branch access
* Permissions
* Validation
* Rate limits
* Business rules

Never rely on the mobile application to enforce security.

Do not embed:

* Database credentials
* Provider secrets
* Private API keys
* Service-account credentials

inside a future mobile application.

⸻

Future Mobile-Specific UX

The future mobile application should NOT simply reproduce the desktop CRM.

It should prioritize high-frequency field workflows.

Likely mobile priorities include:

* Today’s work
* Assigned leads
* Follow-ups
* Customer search
* Dealer search
* Visit planning
* Check-in
* Tasks
* Quick notes
* Voice notes
* Photos
* Quotations
* Collections
* Calls
* WhatsApp
* Notifications

Complex administrative functionality may remain primarily web-based.

Mobile scope should be defined separately when mobile development begins.

⸻

Mobile Readiness Principle

During current web development, ask:

“Would this backend capability still work if the request came from a native mobile application?”

If the answer is no because business logic, authentication, storage, validation, or permissions exist only in the web application, reconsider the architecture.

Do NOT interpret this principle as a requirement to build mobile functionality now.

The objective is architectural readiness, not premature implementation.


67. Phase 0 Implementation Order

Claude MUST execute Phase 0 sequentially.

Do not attempt everything simultaneously.

Step 1 — Repository Foundation

Create:

* Git repository structure
* Monorepo
* pnpm workspace
* Base folders
* .gitignore
* .env.example
* README
* Root scripts

Verify before continuing.

⸻

Step 2 — Frontend Foundation

Create:

* React
* TypeScript
* Vite
* Tailwind
* Routing
* Application providers
* Base layouts
* Environment configuration

Verify build and development server.

⸻

Step 3 — Backend Foundation

Create:

* NestJS
* TypeScript
* Configuration
* API versioning
* Validation
* Error handling
* Logging
* Health endpoint
* Swagger/OpenAPI

Verify API independently.

⸻

Step 4 — Database Foundation

Configure:

* PostgreSQL
* Prisma
* Docker PostgreSQL
* Migration strategy
* Seed strategy

Verify connection and migrations.

⸻

Step 5 — Core Organizational Schema

Implement only foundation entities:

* Organization
* Branch
* User
* Role
* Permission
* UserRole
* Team
* AuditLog

Do NOT create Leads, Sales, Inventory, Billing, or PO schemas yet unless required by an explicitly approved later phase.

⸻

Step 6 — Authentication

Implement:

* Login
* Logout
* Password handling
* Session/token strategy
* Refresh handling
* Authentication guards

Verify with automated tests.

⸻

Step 7 — Authorization

Implement:

* RBAC
* Permissions
* Guards
* Organization isolation
* Branch context where appropriate

Test unauthorized access explicitly.

⸻

Step 8 — Shared Frontend Infrastructure

Configure:

* API client
* TanStack Query
* Authentication provider
* Permission handling
* React Hook Form
* Zod
* Error handling
* Basic reusable UI primitives

⸻

Step 9 — Infrastructure Abstractions

Establish interfaces/architecture for:

* Storage
* Email
* WhatsApp
* SMS
* Notifications
* Queues
* Integrations

Do not fully integrate every external provider.

⸻

Step 10 — Testing & Quality

Configure:

* ESLint
* Prettier
* Strict TypeScript
* Unit tests
* Integration test foundation
* E2E/API tests
* Frontend test foundation

⸻

Step 11 — Docker & Developer Experience

Ensure project can be started predictably.

Document exact commands.

Test from a clean environment where practical.

⸻

Step 12 — CI

Configure pipeline:

Install
→ Lint
→ Type Check
→ Test
→ Build

Verify the pipeline.

⸻

Step 13 — Cloud Architecture

Document and prepare deployment architecture for:

* Cloud Run
* Cloud SQL
* Cloud Storage
* Secret Manager
* Logging

Do not deploy production infrastructure unless explicitly instructed.

⸻

Step 14 — Final Foundation Verification

Verify the entire setup.

Only after successful verification may Phase 0 be marked complete.

⸻

68. Definition of Done

Phase 0 is complete only when:

* Repository structure is stable.
* Frontend runs.
* Backend runs.
* PostgreSQL connects successfully.
* Migrations work.
* Seed data works.
* Authentication works.
* Authorization foundation works.
* Organization isolation is verified.
* Environment variables are validated.
* Swagger documentation works.
* Health endpoint works.
* Error handling works.
* Logging works.
* Storage abstraction exists.
* Communication architecture exists.
* Integration architecture exists.
* Test infrastructure works.
* Linting works.
* Type checking works.
* Docker development environment works.
* CI pipeline works.
* README setup instructions have been tested.
* No credentials exist in source control.

⸻

69. Explicitly Out of Scope for Phase 0

Do NOT implement:

* Lead Management
* Contact Management
* Customer Management
* Sales Pipeline
* Quotations
* Sales Orders
* Purchase Orders
* Inventory
* Billing
* Customer Service
* Reports
* AI Features
* Full WhatsApp Integration
* Full SMS Integration
* Full Email Integration
* Payment Gateway
* Accounting Integration
* Logistics Integration

Architecture may prepare for these capabilities.

Actual implementation belongs to later phases.

⸻

70. Rules for Claude Code

Claude must follow these rules while implementing this document.

Rule 1

Read:

PROJECT.md

and:

PROJECT_SETUP.md

before making architectural decisions.

⸻

Rule 2

Work on ONE implementation step at a time.

Do not automatically proceed to the next Phase 0 step.

After completing a step:

1. Explain what was created.
2. List files created/changed.
3. Run relevant verification.
4. Report test/build results.
5. Report warnings or unresolved issues.
6. Suggest the exact next step.
7. Wait for approval before continuing.

⸻

Rule 3

Do not install unnecessary dependencies.

Before adding a major dependency, understand why it is required.

⸻

Rule 4

Do not prematurely build CRM features.

Phase 0 is infrastructure and foundation only.

⸻

Rule 5

Do not silently change architecture.

If a different approach from this document is materially better:

Explain:

* Current approach
* Proposed approach
* Benefits
* Trade-offs
* Migration impact

and request approval before making a major architectural change.

⸻

Rule 6

Never hardcode:

* Credentials
* Secrets
* Organization IDs
* Branch IDs
* Provider keys
* Production URLs

⸻

Rule 7

Security boundaries must exist on the backend.

Never rely on hidden frontend controls as authorization.

⸻

Rule 8

Prefer reusable infrastructure.

Do not create separate WhatsApp/email/storage logic independently inside future business modules.

⸻

Rule 9

Every setup step must be verified before it is considered complete.

Creating files is not completion.

The relevant application, build, test, migration, or service must actually run successfully.

⸻

Rule 10

Do not continue when a foundational error exists.

Fix the root cause first.

Do not hide errors using temporary hacks merely to continue implementation.

⸻

71. Expected Developer Experience

After Phase 0, a new developer should be able to follow documented commands similar to:

git clone <repository>
cd electrical-crm
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev

and reach a working local environment with:

Web Application       ✓
API                   ✓
PostgreSQL            ✓
Database Migrations   ✓
Seed Data             ✓
Authentication        ✓
RBAC Foundation       ✓
Swagger               ✓
Health Check          ✓
Logging               ✓
Tests                 ✓
Lint                  ✓
Type Check            ✓

The exact commands may change based on final repository implementation, but the developer experience should remain simple and documented.

⸻

72. Phase 0 Success Principle

The purpose of Phase 0 is not to create visible CRM functionality.

Its purpose is to make every subsequent feature easier, safer, faster, and more consistent to build.

Do not optimize for how much code is produced.

Optimize for how little friction exists when building the actual product.

A successful Phase 0 means the team can begin CRM module development without repeatedly stopping to redesign infrastructure.
# Documentation

## Structure

```
docs/
├── setup.md          # local development setup
└── sds/              # Software Design Specification (source of truth)
    ├── CRM_Enterprise_SDS_Master_Plan.pdf     # defines this volume structure
    ├── CRM_Software_Design_Specification_v1.md # consolidated SDS overview
    ├── volume-1-business/
    ├── volume-2-product/    # gap - see below
    ├── volume-3-technical/  # gap - see below
    ├── volume-4-data/
    ├── volume-5-api/
    ├── volume-6-modules/
    ├── volume-7-engineering/
    └── volume-8-ai-playbook/
```

Source-of-truth precedence, per
[`volume-8-ai-playbook/13_Claude_Project_Guidelines.md`](sds/volume-8-ai-playbook/13_Claude_Project_Guidelines.md):
PRD → Database Design → ER Diagram → PostgreSQL Schema → Prisma Schema →
API Specification → Backend Architecture → Frontend Architecture →
Mobile Requirements → RBAC → UI Components → Coding Standards → Claude
Project Guidelines.

## Volume → Document Mapping

| Volume | Contents |
| --- | --- |
| 1 - Business | `01_Product_Requirements_Document.md` |
| 2 - Product Design | *(gap — no source document)* |
| 3 - Technical Architecture | *(gap — no source document)* |
| 4 - Data | Database Design, ER Diagram, PostgreSQL Schema, Prisma Schema |
| 5 - API | API Specification |
| 6 - Modules | Per-module specs (Authentication, Dashboard, Users, Leads, Visits, Customers, Products, Orders, Invoices, Payments, Reports, Notifications, Settings) |
| 7 - Engineering | Backend, Frontend, Mobile, RBAC, UI Components, Coding Standards |
| 8 - AI Playbook | Claude Project Guidelines |

## Architectural Concerns Found in the Documentation

1. **Volume 2 (Product Design) and Volume 3 (Technical Architecture) have no
   dedicated source documents.** The Master Plan defines these as required
   volumes (Information Architecture, Wireframes, Screen Inventory, Design
   Tokens for Vol. 2; System Context, Component/Deployment Diagrams,
   Observability for Vol. 3), but nothing in the provided documents fulfills
   them. Fragments exist elsewhere (navigation in Frontend Architecture,
   design tokens in UI Component Specification) but there is no dedicated
   deliverable. **Recommend authoring these before Phase 3+ implementation
   work that depends on them (e.g. deployment architecture before writing
   production infrastructure).**

2. **Three conflicting Lead Management specifications exist** in
   `volume-6-modules/`:
   - `04_LEADS.md` — a generic, unfilled template (identical boilerplate
     shared with all other Volume 6 module files).
   - `04_LEADS_Detailed_Feature_Specification.md` — a filled-in v1.0 spec.
   - `Lead_Management_Enterprise_Specification.md` — a v2.0 spec that
     explicitly declares itself "the implementation blueprint... the
     authoritative reference."
   These were not reconciled — no rule states which supersedes the others,
   and they differ in detail (e.g. field lists, lifecycle states). **This
   needs an explicit decision on which is authoritative before the Leads
   module is implemented**, per the Claude Project Guidelines' own instruction
   to "ask for clarification instead of guessing when requirements conflict."

3. **12 of the 13 Volume 6 module specs are unfilled templates.** Only Leads
   has a detailed specification (in fact, two). Authentication, Dashboard,
   Users, Visits, Customers, Products, Orders, Invoices, Payments, Reports,
   Notifications, and Settings all contain only the generic placeholder
   ("As a user, I can perform module-specific tasks... Document
   module-specific business logic.") with no real fields, business rules, or
   endpoints beyond what's already in the API Specification. **Each of these
   will need a real detailed spec before its module is implemented** —
   the Leads doc is a reasonable template to follow.

4. **PRD role list vs. RBAC role list differ slightly.** The PRD
   (`volume-1-business`) lists an *"Admin"* role; RBAC
   (`volume-7-engineering/10_RBAC_Roles_Permissions.md`) and the consolidated
   SDS both call the same role *"Organization Admin."* Low risk (clearly the
   same role), but worth aligning naming before generating role seed data.

5. **Prisma schema location.** `07_Backend_Architecture.md`'s project tree
   places `prisma/` under `src/`. This repo follows that literally
   (`backend/src/prisma/schema.prisma`), configured via `"prisma.schema"` in
   `backend/package.json`, rather than the more common Prisma convention of
   `<root>/prisma/schema.prisma`. Flagging this in case it wasn't a deliberate
   choice — it's easy to change if the doc's tree was just illustrative.

None of the above blocks the repository foundation itself. They matter for
Phase 2+ (Organizations/Users/Roles) and beyond, per the implementation order
in the AI Playbook.

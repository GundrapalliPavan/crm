# API Specification

**Project:** CRM Platform **Document:** 06_API_Specification.md
**Version:** 1.0

------------------------------------------------------------------------

# Purpose

This document defines the REST API contract for the CRM Platform. It is
the authoritative reference for backend implementation, frontend
integration, mobile development, and automated API documentation.

------------------------------------------------------------------------

# API Standards

-   Architecture: REST
-   Data Format: JSON
-   Authentication: JWT Bearer Token
-   Versioning: `/api/v1`
-   Character Encoding: UTF-8
-   Time Format: ISO 8601 (UTC)

Example:

GET /api/v1/leads

------------------------------------------------------------------------

# Response Format

## Success

``` json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {},
  "meta": {}
}
```

## Error

``` json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

------------------------------------------------------------------------

# Authentication

## Public

-   POST /auth/login
-   POST /auth/forgot-password
-   POST /auth/reset-password

## Protected

Require:

Authorization: Bearer `<token>`{=html}

------------------------------------------------------------------------

# Modules

## Authentication

POST /auth/login POST /auth/logout POST /auth/refresh-token GET
/auth/profile PATCH /auth/profile

------------------------------------------------------------------------

## Users

GET /users GET /users/{id} POST /users PATCH /users/{id} DELETE
/users/{id}

------------------------------------------------------------------------

## Roles

GET /roles POST /roles PATCH /roles/{id} DELETE /roles/{id}

------------------------------------------------------------------------

## Leads

GET /leads GET /leads/{id} POST /leads PATCH /leads/{id} DELETE
/leads/{id}

POST /leads/{id}/assign POST /leads/{id}/convert

GET /leads/{id}/timeline GET /leads/{id}/activities

------------------------------------------------------------------------

## Visits

GET /visits GET /visits/{id} POST /visits PATCH /visits/{id}

POST /visits/{id}/check-in POST /visits/{id}/check-out

------------------------------------------------------------------------

## Customers

GET /customers GET /customers/{id} POST /customers PATCH /customers/{id}

------------------------------------------------------------------------

## Contacts

GET /contacts POST /contacts PATCH /contacts/{id}

------------------------------------------------------------------------

## Products

GET /products POST /products PATCH /products/{id}

------------------------------------------------------------------------

## Orders

GET /orders GET /orders/{id} POST /orders PATCH /orders/{id}

POST /orders/{id}/submit POST /orders/{id}/cancel

------------------------------------------------------------------------

## Invoices

GET /invoices GET /invoices/{id} POST /invoices

------------------------------------------------------------------------

## Payments

GET /payments POST /payments

------------------------------------------------------------------------

## Tasks

GET /tasks POST /tasks PATCH /tasks/{id}

------------------------------------------------------------------------

## Notifications

GET /notifications PATCH /notifications/{id}/read

------------------------------------------------------------------------

## Reports

GET /reports/leads GET /reports/orders GET /reports/revenue GET
/reports/payments GET /reports/visits

------------------------------------------------------------------------

# Query Parameters

Supported on list APIs:

-   page
-   limit
-   search
-   sortBy
-   sortOrder
-   status
-   ownerId
-   startDate
-   endDate

Example

GET /leads?page=1&limit=20&status=NEW

------------------------------------------------------------------------

# Validation

-   UUID validation
-   Email validation
-   Phone validation
-   Required field validation
-   Numeric validation
-   Business rule validation

------------------------------------------------------------------------

# HTTP Status Codes

-   200 OK
-   201 Created
-   204 No Content
-   400 Bad Request
-   401 Unauthorized
-   403 Forbidden
-   404 Not Found
-   409 Conflict
-   422 Validation Error
-   500 Internal Server Error

------------------------------------------------------------------------

# Security

-   JWT Authentication
-   RBAC authorization
-   Organization isolation
-   Input validation
-   Rate limiting
-   Audit logging

------------------------------------------------------------------------

# File Uploads

POST /attachments

Multipart Form Data

Supported:

-   Images
-   PDF
-   DOCX
-   XLSX

Maximum size configured through application settings.

------------------------------------------------------------------------

# Mobile APIs

The mobile application consumes the same REST APIs.

Primary endpoints:

-   Login
-   Dashboard
-   Assigned Leads
-   Visits
-   Lead Updates
-   Orders
-   Notifications

------------------------------------------------------------------------

# OpenAPI

The backend must generate Swagger/OpenAPI documentation automatically.

Base URL:

/api/docs

------------------------------------------------------------------------

# Implementation Guidelines

-   Controllers contain no business logic.
-   Services implement business rules.
-   Repositories encapsulate database access.
-   DTOs validate requests.
-   Responses follow the standard response format.
-   Breaking changes require a new API version.

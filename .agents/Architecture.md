# Architecture

## Overview

EventBro uses a modern full-stack architecture powered by Next.js and Payload CMS.

```txt
Client
  ↓
Next.js Application
  ↓
Payload CMS
  ↓
PostgreSQL Database
```

The system is designed to be:
- modular
- scalable
- API-first
- AI-friendly
- event-focused

---

# Core Stack

## Frontend

Framework:
- Next.js (App Router)

UI:
- Tailwind CSS v4
- shadcn/ui
- Radix UI

Frontend responsibilities:
- public event pages
- dashboards
- authentication UI
- checkout flow
- organizer tools
- admin experience

---

## Backend

Backend layer:
- Payload CMS

Payload handles:
- collections
- authentication
- RBAC
- uploads
- API generation
- admin panel
- database access

Payload acts as:
```txt
CMS + Backend Framework
```

---

# Database Architecture

Database:
- PostgreSQL

Adapter:
- @payloadcms/db-postgres

Structure:
```txt
Users
Roles
Permissions
Media
Events
Tickets
Orders
```

Database philosophy:
- normalized relationships
- centralized permissions
- reusable entities
- minimal duplication

---

# RBAC Architecture

Permission model:
```txt
Users
  → Roles
      → Permissions
```

## Users
Stores:
- authentication
- profile data
- assigned role

## Roles
Stores:
- role name
- assigned permissions

Examples:
- admin
- organizer
- user

## Permissions
Centralized permission registry.

Examples:
- manage_users
- manage_events
- manage_orders

Permission system philosophy:
- semi-static
- centralized
- scalable
- middleware-friendly

---

# Media System

Media collection handles:
- event banners
- thumbnails
- organizer avatars
- uploaded assets

Storage flow:
```txt
Upload
  ↓
Payload Media Collection
  ↓
Storage Provider
```

Future providers:
- local storage
- S3
- Cloudflare R2

---

# Frontend Architecture

## Public Area

Pages:
```txt
/
 /events
 /events/[slug]
```

Responsibilities:
- event discovery
- SEO pages
- public event details
- ticket purchase

---

## Organizer Dashboard

Pages:
```txt
/dashboard
/dashboard/events
/dashboard/orders
```

Responsibilities:
- manage events
- manage tickets
- analytics
- attendee overview

---

## Admin Area

Managed through:
```txt
Payload Admin Panel
```

Responsibilities:
- manage users
- manage permissions
- manage media
- moderation

---

# Event System

Future event architecture:

```txt
Events
  → Tickets
  → Orders
  → Media
  → Organizer
```

Each event may contain:
- metadata
- schedules
- speakers
- ticket tiers
- visibility settings

---

# API Architecture

Payload automatically provides:
- REST API
- GraphQL API
- Local API

Used for:
- frontend data fetching
- dashboards
- integrations
- AI tools

---

# Authentication Flow

Authentication provider:
- Payload Auth

Flow:
```txt
User Login
  ↓
Payload Auth
  ↓
Session / JWT
  ↓
Protected Routes
```

---

# Future Architecture Goals

Planned expansions:
- AI event builder
- payment gateway integration
- real-time analytics
- email automation
- multi-organizer support
- event templates
- attendee QR system
- webhook system

---

# Engineering Philosophy

Project priorities:
- clean architecture
- modular collections
- reusable components
- scalable RBAC
- maintainable codebase
- AI-friendly documentation

Avoid:
- duplicated business logic
- tightly coupled modules
- premature microservices
- overengineering
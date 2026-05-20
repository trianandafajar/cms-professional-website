# Agents

This directory contains AI-oriented project documentation, conventions, architecture notes, and implementation references for EventBro.

The goal of this folder is to provide structured context for:
- AI agents
- contributors
- maintainers
- future development workflows

---

# Project

EventBro is a modern event management platform built using:

- Next.js
- Payload CMS
- PostgreSQL
- Tailwind CSS v4
- shadcn/ui
- Radix UI

---

# Architecture

```txt
Frontend (Next.js)
        ↓
Payload CMS
        ↓
PostgreSQL
```

Payload is used as:
- CMS
- backend framework
- auth provider
- RBAC layer
- API layer

---

# RBAC Structure

```txt
Users
  → Roles
      → Permissions
```

Permissions are centralized and role-based.

The current permission model is semi-static:
- roles are managed manually
- permissions are predefined
- users inherit permissions from roles

---

# Current Collections

## Users
Authentication-enabled users.

## Roles
Centralized role definitions.

## Permissions
Permission registry.

## Media
Media uploads and asset management.

---

# Frontend Stack

UI stack:
- Tailwind CSS v4
- shadcn/ui
- Radix UI

Component philosophy:
- reusable
- accessible
- minimal
- scalable

---

# Development Rules

## General

- Use TypeScript everywhere
- Prefer server components when possible
- Keep business logic modular
- Avoid overengineering early

---

## Payload

Collections should:
- remain modular
- use centralized access control
- avoid duplicated logic

Prefer:
```txt
relationship fields
```

over duplicated data.

---

## Database

Database provider:
- PostgreSQL

Current setup:
- Payload PostgreSQL adapter

---

# Goals

Planned features include:
- Event builder
- Ticketing system
- Organizer dashboard
- Analytics
- Checkout system
- Payment integration
- AI-assisted event creation
- Public event pages

---

# Skills

This project uses the Payload CMS skill:

```txt
.agents/skills/payload/
```

Start here:

```txt
.agents/skills/payload/SKILL.md
```

Detailed references:

```txt
.agents/skills/payload/reference/
```

---

# Notes

This folder is intended to evolve alongside the project.

Keep documentation:
- concise
- implementation-focused
- architecture-oriented
- AI-readable
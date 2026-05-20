# Conventions

## General Principles

Project priorities:
- readability
- scalability
- consistency
- modularity
- maintainability

Avoid:
- duplicated logic
- overengineering
- deeply nested components
- unclear naming

---

# Naming Conventions

## Files

Use:
```txt
PascalCase
```

Examples:
```txt
Users.ts
Events.ts
EventCard.tsx
DashboardLayout.tsx
```

---

## Variables

Use:
```txt
camelCase
```

Examples:
```ts
const eventTickets = []
const currentUser = {}
```

---

## Constants

Use:
```txt
UPPER_SNAKE_CASE
```

Examples:
```ts
MAX_UPLOAD_SIZE
DEFAULT_ROLE
```

---

## Components

Use:
```txt
PascalCase
```

Examples:
```txt
EventCard
CreateEventForm
DashboardSidebar
```

---

## Hooks

Always prefix with:
```txt
use
```

Examples:
```txt
useAuth
usePermissions
useEvent
```

---

# Folder Conventions

## Components

Structure:
```txt
components/
├── ui/
├── forms/
├── dashboard/
└── events/
```

Rules:
- keep components reusable
- separate business logic from UI
- avoid giant components

---

## Collections

One collection per file.

Examples:
```txt
Users.ts
Roles.ts
Permissions.ts
Events.ts
```

Collection rules:
- centralized access control
- relationship-based architecture
- avoid duplicated fields

---

## Lib

Contains:
- business logic
- helpers
- permission utilities
- validation utilities

Avoid placing business logic directly inside components.

---

# TypeScript Rules

## Always Use Types

Prefer:
```ts
type
```

or:
```ts
interface
```

for shared structures.

Avoid:
```ts
any
```

unless absolutely necessary.

---

## Shared Types

Shared types belong in:
```txt
src/types/
```

Payload-generated types:
```txt
payload-types.ts
```

---

# Payload Conventions

## Relationships

Prefer:
```txt
relationship fields
```

over duplicated data.

Example:
```txt
User → Role
Role → Permissions
Event → Organizer
```

---

## Access Control

Access logic should:
- remain centralized
- stay predictable
- avoid duplication

Prefer reusable permission helpers.

---

## Slugs

Always use:
```txt
kebab-case
```

Examples:
```txt
tech-conference-2026
music-festival-jakarta
```

---

# Frontend Conventions

## UI Philosophy

UI should be:
- minimal
- accessible
- responsive
- reusable

---

## Styling

Use:
- Tailwind CSS
- shadcn/ui

Avoid:
- inline styles
- duplicated utility classes
- excessive custom CSS

---

## Server Components

Prefer:
```txt
Server Components
```

when interactivity is not required.

Use:
```txt
Client Components
```

only when necessary.

---

# API Conventions

## Validation

Always validate:
- input
- permissions
- ownership

Never trust frontend data directly.

---

## Error Handling

Return:
- predictable responses
- meaningful errors
- consistent structures

Avoid exposing internal implementation details.

---

# Database Conventions

## IDs

Use Payload default IDs unless customization is required.

---

## Data Structure

Database philosophy:
- normalized
- relational
- scalable

Avoid:
- duplicated data
- deeply nested structures
- unnecessary denormalization

---

# Git Conventions

## Branch Naming

Use:
```txt
feature/
fix/
refactor/
```

Examples:
```txt
feature/event-builder
fix/auth-session
refactor/dashboard-layout
```

---

## Commit Style

Format:
```txt
type: message
```

Examples:
```txt
feat: add events collection
fix: resolve auth redirect
refactor: simplify permissions helper
```

---

# Documentation Rules

Documentation should be:
- concise
- implementation-focused
- architecture-oriented
- AI-readable

Avoid:
- unnecessary verbosity
- outdated examples
- duplicated documentation
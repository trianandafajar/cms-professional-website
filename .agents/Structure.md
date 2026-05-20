# Project Structure

```txt
eventbro/
├── .agents/
│   ├── README.md
│   └── skills/
│       └── payload/
│           ├── SKILL.md
│           └── reference/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── events/
│   │   │   │   ├── orders/
│   │   │   │   └── analytics/
│   │   │
│   │   ├── (payload)/
│   │   │   └── admin/
│   │   │       └── [[...segments]]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Roles.ts
│   │   ├── Permissions.ts
│   │   ├── Media.ts
│   │   ├── Events.ts
│   │   ├── Tickets.ts
│   │   └── Orders.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layouts/
│   │   ├── dashboard/
│   │   └── events/
│   │
│   ├── lib/
│   │   ├── auth/
│   │   ├── permissions/
│   │   ├── payload/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── hooks/
│   │
│   ├── providers/
│   │
│   ├── types/
│   │
│   └── payload.config.ts
│
├── .env
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Folder Responsibilities

## app/
Application routes using Next.js App Router.

Contains:
- frontend pages
- dashboard pages
- Payload admin
- API routes

---

## collections/
Payload CMS collections.

Examples:
- Users
- Roles
- Permissions
- Events
- Orders

---

## components/
Reusable UI components.

Structure:
```txt
ui/          → shadcn components
forms/       → form components
dashboard/   → dashboard widgets
events/      → event-specific components
```

---

## lib/
Core application logic.

Examples:
- auth helpers
- permission checks
- payload utilities
- validators

---

## hooks/
Reusable React hooks.

Examples:
- useAuth
- usePermissions
- useEvent

---

## providers/
Global providers.

Examples:
- theme provider
- auth provider
- query provider

---

## types/
Shared TypeScript types.

Examples:
- API types
- Payload types
- shared interfaces

---

# Architecture Philosophy

Structure goals:
- scalable
- modular
- feature-oriented
- AI-friendly
- maintainable

Avoid:
- large monolithic folders
- duplicated business logic
- deeply coupled modules
# AI Architecture

## Overview

The AI system is isolated inside:

```txt
src/app/api/ai/
```

This architecture keeps:
- AI logic modular
- prompts centralized
- providers swappable
- tools reusable
- streaming manageable

---

# Structure

```txt
src/app/api/ai/
├── chat/
│   └── route.ts
│
├── agents/
│   ├── event-builder/
│   ├── ticket-generator/
│   └── moderation/
│
├── prompts/
│   ├── system/
│   ├── events/
│   └── moderation/
│
├── tools/
│   ├── events/
│   ├── tickets/
│   ├── users/
│   └── formatting/
│
├── providers/
│   ├── openai.ts
│   ├── google.ts
│   └── provider.ts
│
├── schemas/
│   ├── event.schema.ts
│   └── ticket.schema.ts
│
├── utils/
│   ├── messages.ts
│   ├── stream.ts
│   └── parser.ts
│
└── types/
```

---

# Responsibilities

## chat/

Main AI route handlers.

Examples:
```txt
/api/ai/chat
/api/ai/generate-event
```

Responsibilities:
- request handling
- auth validation
- streaming
- response formatting

---

## agents/

Specialized AI agents.

Examples:
- event builder
- ticket generator
- moderation agent

Each agent should:
- have a focused responsibility
- use dedicated prompts
- remain isolated

---

## prompts/

Centralized prompt management.

Structure:
```txt
system/       → global system prompts
events/       → event-specific prompts
moderation/   → moderation prompts
```

Rules:
- never hardcode large prompts in route files
- prompts should remain reusable
- prompts should be versionable

---

## tools/

AI callable utilities.

Examples:
- create event draft
- validate ticket pricing
- format schedules
- search organizers

Tools should:
- remain deterministic
- avoid side effects when possible
- stay reusable

---

## providers/

AI provider abstraction layer.

Supported providers may include:
- OpenAI
- Google
- Anthropic

Goals:
- provider swapping
- centralized config
- unified interfaces

---

## schemas/

Validation schemas for:
- AI outputs
- structured generation
- tool responses

Prefer:
- Zod schemas
- strict validation

---

## utils/

Shared AI utilities.

Examples:
- message conversion
- stream handling
- response parsing

---

# AI Philosophy

The AI system should be:
- modular
- provider-agnostic
- stream-first
- tool-oriented
- structured-output focused

Avoid:
- giant route handlers
- hardcoded prompts
- mixed responsibilities
- duplicated AI logic

---

# Streaming

Preferred response mode:
```txt
streaming responses
```

Benefits:
- better UX
- faster perceived response
- real-time generation

---

# AI Security Rules

Always validate:
- authentication
- permissions
- ownership
- AI output structure

Never:
- trust raw AI output directly
- expose secrets to prompts
- allow unrestricted tool execution

---

# Future AI Features

Planned:
- AI event builder
- schedule generator
- ticket pricing suggestions
- AI moderation
- AI SEO generation
- AI landing page generator
- attendee segmentation
- analytics summaries

---

# Recommended Flow

```txt
User Request
    ↓
Route Handler
    ↓
Agent
    ↓
Prompt + Tools
    ↓
Provider
    ↓
Structured Response
    ↓
Frontend Stream
```
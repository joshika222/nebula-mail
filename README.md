# Nebula Mail

AI-powered mail web app — see `build-guide.md` (shared separately) for the full day-by-day plan.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

## Status

- [x] Day 1 — Project skeleton + Google OAuth (`lib/auth.ts`, `app/api/auth/google/*`, `app/page.tsx`)
- [ ] Day 2 — Gmail API wrapper + Inbox/Sent/Compose/Detail (`lib/gmail.ts`, `app/api/gmail/*`, `components/*`)
- [ ] Day 3 — CopilotKit assistant (`app/api/copilotkit/route.ts`, `useCopilotAction` calls in components)
- [ ] Day 4 — Gmail Pub/Sub push (`app/api/gmail/watch`, `app/api/webhook/gmail`, `app/api/stream`)
- [ ] Day 5 — Tests, README polish, deploy

Every stub file in this repo has a comment describing what goes there and which day it belongs to.

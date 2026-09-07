# Nebula Mail

AI-powered mail web app — see `build-guide.md` (shared separately) for the full day-by-day plan.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```

### A few things worth knowing before running it locally

- Real-time inbox sync uses **ngrok** to tunnel the Gmail Pub/Sub webhook locally. ngrok's free tier gives a new URL every restart, so you'll need to update the Pub/Sub push subscription's Endpoint URL to match whenever you restart it.
- The `@copilotkit/*` packages are pinned to `1.4.0` and `openai` is pinned to `4.104.0` — newer versions of both break tool-calling against OpenRouter. Don't upgrade these without testing.
- The assistant runs on `nvidia/nemotron-3.5-lightning:free` via OpenRouter — this is the model that reliably supports tool calling among the free options tried.

## Status

- [x] Day 1 — Project skeleton + Google OAuth (`lib/auth.ts`, `app/api/auth/google/*`, `app/page.tsx`)
- [x] Day 2 — Gmail API wrapper + Inbox/Sent/Compose/Detail (`lib/gmail.ts`, `app/api/gmail/*`, `components/*`)
- [x] Day 3 — CopilotKit assistant (`app/api/copilotkit/route.ts`, `useCopilotAction` calls in components)
- [x] Day 4 — Gmail Pub/Sub push (`app/api/gmail/watch`, `app/api/webhook/gmail`, `app/api/stream`)
- [x] Day 5 — Tests, README polish, deploy

Every stub file in this repo has a comment describing what goes there and which day it belongs to.

## Architecture decisions & trade-offs

**Next.js 14 App Router + TypeScript.** Keeps the OAuth flow, Gmail API wrapper, and webhook all as API routes inside one project rather than standing up a separate backend service.

**CopilotKit + OpenRouter for the assistant.** CopilotKit provides a structured way to expose app actions (`open_compose`, `search_emails`, `open_email`, `reply_to_email`) as tools the model can call, instead of hand-rolling a tool-calling loop. OpenRouter lets the assistant run on a free model instead of a paid OpenAI key — the trade-off is having to pin older CopilotKit/`openai` package versions, since newer releases assume OpenAI's own API shape and break against OpenRouter.

**Zustand for shared UI state.** The assistant needs to update the same state the user's manual actions update — e.g. an assistant-triggered search and a manually typed search should update the same inbox filter state, not just describe a change in the chat. Zustand's simple store/hook model made it easy for both the UI and the CopilotKit actions to read and write the same source of truth.

**Gmail `watch()` + Pub/Sub + SSE instead of polling.** Polling the Gmail API on an interval is simpler to build but wastes API quota and adds latency. Using Gmail's `watch()` to push changes through Pub/Sub to a webhook, then relaying to the browser over Server-Sent Events, gives near-instant inbox updates with no manual refresh — at the cost of meaningfully more setup (topic, push subscription, webhook, SSE relay) and a local-dev pain point: the ngrok URL changing on every restart.

**Filters compiled to Gmail search syntax, not client-side filtering.** Sender/keyword/date/unread filters get translated into Gmail's own query operators and sent server-side, rather than fetching everything and filtering in the browser. This keeps results accurate to what Gmail itself would return, at the cost of an extra round-trip per filter change.

## Screenshots

![Connect Gmail / OAuth login screen](Screenshots/screenshot(5).jpeg)
![Inbox view with sender, keyword, and date filters](Screenshots/screenshot(3).jpeg)
![Compose view with a drafted email](Screenshots/screenshot(1).jpeg)
![Email sent confirmation](Screenshots/screenshot(2).jpeg)
![Mail Assistant replying to an email based on natural language instructions](Screenshots/screenshot(4).jpeg)
![compose mail using AI Assistant](Screenshots/screenshot(6).jpeg)

## Demo Video

[Watch the demo video](https://drive.google.com/file/d/1I7OxS9rlyZI3uPtdLEDuPyKa4uuaNrol/view?usp=sharing)

## What I'd improve with more time

- **Human-in-the-loop confirmation before sending.** The assistant currently sends/replies directly when asked. With more time I'd add a preview-and-confirm step before any assistant-triggered send, both for safety and better AI-agent UX.
- **Thread/conversation view.** Emails are currently handled individually rather than grouped into Gmail threads; threading would make context-aware replies and navigation feel more natural.
- **Automated tests.** No test coverage yet, especially around the Pub/Sub webhook handler (the most fragile piece locally, due to the ngrok dependency) and the filter-to-Gmail-query compiler.
- **Deployment.** Currently local-only with ngrok bridging the webhook. Deploying to Vercel (or similar) with a stable HTTPS endpoint would remove the ngrok dependency and make the Pub/Sub subscription reliable without manual URL updates after every restart.
- **Fallback LLM handling.** The free OpenRouter model occasionally hits rate limits; a fallback to a secondary model would let the assistant degrade gracefully instead of failing outright.

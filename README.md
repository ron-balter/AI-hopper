# AI Hopper — Product Search Registry

Describe what you want. Cursor SDK agents shop Amazon & AliExpress, compare reviews, and surface ranked candidates for you to pick.

## Quick start

```bash
bun i
bun run db:push
bun run seed
bun run dev
```

Open on your phone (same Wi‑Fi): `http://<your-mac-lan-ip>:3000`

## Environment

```env
CURSOR_API_KEY=your_key
DATABASE_URL="file:./dev.db"
DEMO_MODE=true
```

Set `DEMO_MODE=false` for real Cursor agent runs (slower, needs network).

## 60-second demo script

1. Open the app on your phone via LAN IP
2. Dashboard shows a seeded USB-C hub request (or tap **New product request**)
3. Tap **Create & start search** — watch the **live agent feed**
4. Notification bell lights up when candidates are ready (~15s in demo mode)
5. Compare Amazon vs AliExpress cards, tap **Select this**
6. Tap **Search again** — same `agentId` resumes via `Agent.resume()`

## Cursor SDK features used

- `Agent.create()` — durable local agent per product request
- `agent.send()` + `run.stream()` — live feed in UI
- `local.customTools` — `save_product_candidate`, `complete_search`, `report_search_failure`
- Inline subagents — `amazon-researcher`, `aliexpress-researcher`
- `Agent.resume()` — search again with conversation memory
- `Agent.list()` — active agent count on dashboard
- `run.wait()` — `durationMs`, `requestId` observability

## Stack

Next.js (T3) · tRPC · Prisma · SQLite · Tailwind · Bun · `@cursor/sdk`

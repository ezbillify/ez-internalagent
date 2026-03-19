# Planning 🗓️
> Features decided and scoped but not yet built

---

## EZ-Connect API Endpoints (PRIORITY — needed before agents can run)

These 4 endpoints need to be added to EZ-Connect for the agents to work end to end.

### `POST /api/agent/bugs`
```typescript
// Request body
{
  type: "bug",
  product_id: string,
  product_name: string,
  title: string,
  description: string,          // markdown
  severity: "critical" | "high" | "medium" | "low",
  status: "open",
  source: "ez-agent",
  metadata: {
    commit: string,
    version: string,
    platform: "flutter" | "nextjs",
    flow: string,
    error: string,
    screenshot_url?: string,
    filed_at: string
  }
}

// Response
{ id: string, ticket_number: number }
```

### `POST /api/agent/reports`
```typescript
// Request body
{
  product_id: string,
  report_type: "qa" | "research",
  data: object,
  created_at: string,
  source: "ez-agent"
}

// Response
{ id: string }
```

### `POST /api/agent/leads/bulk`
```typescript
// Request body
{
  leads: Array<{
    name: string,
    category: string,
    phone: string,
    address: string,
    city: string,
    product_fit: "ezbillify" | "ezdine",
    source: string,
    scraped_at: string,
    status: "new"
  }>
}

// Response
{ inserted: number }
```

### `GET /api/agent/config`
```typescript
// Response
{
  agents: {
    qa: { mode: "auto" | "manual" | "paused" },
    research: { mode: "auto" | "manual" | "paused" },
    leads: { mode: "auto" | "manual" | "paused" }
  },
  settings: {
    auto_file_bugs: boolean,
    discord_on_fail: boolean,
    discord_on_pass: boolean,
    require_approval_p0: boolean
  }
}
```

---

## Supabase Test Data Seeding Script

A script that creates isolated test accounts per product in Supabase with `is_test: true` flag and pre-seeds required data.

```sql
-- test_seed.sql
-- Run once per product to set up test environment

-- EZBillify test org
INSERT INTO organizations (id, name, gstin, is_test)
VALUES ('test-ezbillify-001', 'EZ Test Company', '29AAAAA0000A1Z5', true);

-- EZBillify test user
INSERT INTO users (email, org_id, role)
VALUES ('test@ezbillify.com', 'test-ezbillify-001', 'admin');

-- Pre-seed: items, customers, tax rates, financial year
-- Pre-seed: one sample invoice, one sample purchase bill
```

Also needs a **reset script** that runs after every test run to restore clean state.

---

## EZ Agent Hub — Missing Dashboard Pages

### `/agents/qa` — QA Agent Detail Page
- Full test run history (table)
- Per-product pass/fail rate chart
- Last 10 test runs with expandable logs
- Failed tests with screenshot viewer
- Manual trigger with product selector

### `/agents/research` — Research Agent Detail Page
- All feature cards generated (kanban-style)
- Approve / reject feature cards
- Competitor update feed
- Filter by product

### `/agents/leads` — Lead Gen Agent Detail Page
- Full leads table with search + filter
- Product fit breakdown chart
- Bulk actions (assign, export)
- Lead source tracking

### `/bugs` — Bug Reports Page
- All bugs filed by agent
- Filter by product, severity, status
- Link to EZ-Connect ticket
- Mark resolved

### `/logs` — Full Logs Page
- Real-time streaming logs from all agents
- Filter by agent, product, time range
- Download logs as CSV

---

## Real-time Log Streaming

Currently logs are mocked in the dashboard. Need to implement:
- Supabase Realtime subscription OR
- Server-Sent Events (SSE) from n8n webhook
- Dashboard polls `/api/logs/stream` every 2 seconds
- Log lines stored in Supabase `agent_logs` table

---

## GitHub Actions — Per-Repo Webhooks

Currently `agent.yml` lives in `ez-internalagent` repo. Need to add a lightweight webhook trigger to each product repo:

```yaml
# Add to each product repo: .github/workflows/notify-agent.yml
name: Notify EZ Agent
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Ping EZ Agent n8n
        run: |
          curl -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -d '{"product_id":"${{ env.PRODUCT_ID }}","commit":"${{ github.sha }}","branch":"${{ github.ref_name }}"}'
```

---

## maestro-ios-device Setup

iPhone physical device testing requires extra setup:
- Install `maestro-ios-device` community patch
- Configure XCTest driver
- Register iPhone UDID in Apple Developer portal
- Test iOS-specific flows (gestures, keyboard behaviour)

---

## Discord Bot (upgrade from webhook)

Current: simple webhook (one-way)
Planned: proper Discord bot that can:
- Respond to `!trigger qa ezbillify-web` commands in Discord
- Show `!status` of all agents
- Approve/reject feature cards via reactions
- This lets you control agents from your phone via Discord

---

## Agent Health Monitor

A lightweight script that runs every 5 minutes and checks:
- Is Ollama responding?
- Is n8n responding?
- Are physical devices still connected (adb devices)?
- Last successful run timestamp per agent
- Posts to Discord if anything is unhealthy

---

## Version Tracking

Agent should automatically read version from each product repo:
- Next.js: read `version` field from `package.json`
- Flutter: read `version` field from `pubspec.yaml`
- Tag every bug and test report with exact version string
- EZ-Connect can then show "this bug was introduced in v2.1.4"

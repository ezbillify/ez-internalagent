# EZ Internal Agent — Master Plan
> Vision, architecture, and full scope for Nehal / EZBillify Ventures

---

## Vision

Build a fully autonomous, self-hosted AI agent system that runs 24/7 on a Mac Mini M4 (16GB) and acts as a team of employees — testing products, researching the market, generating leads, and filing bugs — all without manual intervention.

**Zero cloud cost. Zero manual testing. Zero missed leads.**

---

## The 3 Agents

### 1. QA Test Agent
**Purpose:** Automatically test every code change across all EZBillify Ventures products.

**Trigger:** Every git push to `main` branch

**How it works:**
1. GitHub Actions (self-hosted on Mac Mini) receives the push webhook
2. Python agent reads the git diff
3. Detects which platform changed (Flutter / Next.js / both)
4. Sends diff + screenshots to local Ollama LLM
5. Ollama generates Maestro YAML flows (Flutter) or Playwright TypeScript tests (Next.js) — fresh every single run
6. Maestro runs on physical Android phone (USB) + iPhone (USB)
7. Playwright runs headless on Mac Mini for web
8. Results parsed — failures auto-filed as bugs in EZ-Connect
9. Discord alert sent with full report

**Products tested:**
- EZBillify V2 Web (Next.js) — `github.com/ezbillify/ezbillify-v2`
- EZBillify V2 App (Flutter) — `github.com/ezbillify/EZBillifyV2App`
- EZ-Dine Web (Next.js) — `github.com/ezbillify/EZDine`
- EZ-Dine App (Flutter) — `github.com/ezbillify/EZDine`

**Test credentials:** Isolated test accounts per product, pre-seeded in Supabase with `is_test: true` flag. Never touches production data.

---

### 2. Product Research Agent
**Purpose:** Act as a 24/7 junior product manager — research competitors, find market trends, generate feature ideas, build roadmap.

**Trigger:** Every Monday at 8:00 AM

**How it works:**
1. Searches web (Serper API — 2500 free/month) for competitor updates
2. Scans app store reviews of Vyapar, Zoho Books, Petpooja, Posist, etc.
3. Reads Indian SMB forums, Reddit India, Google Play reviews
4. Sends all findings to local Ollama
5. Ollama generates prioritised feature ideas (effort vs impact scoring)
6. Feature cards saved to EZ-Connect roadmap board
7. Weekly digest sent to Discord

**Covers:**
- EZBillify: Vyapar, Zoho Books, Tally, Swipe, Billing Babu
- EZ-Dine: Petpooja, Posist, UrbanPiper, LimeTray

---

### 3. Lead Gen Agent
**Purpose:** Automatically find and qualify potential customers in Bengaluru, push to EZ-Connect CRM.

**Trigger:** Every day at 6:00 AM

**How it works:**
1. Apify scrapes Google Maps for Bengaluru SMBs (restaurants, grocery, wholesale, medical)
2. Python enriches leads — assigns product fit (EZBillify vs EZ-Dine)
3. Bulk pushes to EZ-Connect CRM with status `new`
4. Discord summary sent

---

## Tech Stack

| Component | Tool | Why |
|-----------|------|-----|
| Mobile testing | Maestro | YAML-based, physical device support, fast |
| Web testing | Playwright | Headless, Node.js, perfect for Next.js |
| Local LLM | Ollama + qwen2.5-coder:7b | Fits 16GB, code-trained, zero API cost |
| Orchestration | n8n (self-hosted) | Visual, webhook support, schedule nodes |
| CI trigger | GitHub Actions (self-hosted) | Free, integrates with git push |
| Agent brain | Python 3.11 | Simple, powerful, easy to extend |
| Lead scraping | Apify (Google Maps actor) | 100 free runs/month |
| Web search | Serper API | 2500 free searches/month |
| Bug tracking | EZ-Connect | Your own product — zero cost |
| CRM | EZ-Connect | Your own product — zero cost |
| Alerts | Discord webhook | Free, instant mobile notifications |
| Dashboard | Next.js (EZ Agent Hub) | Control center, built in your own stack |

---

## Hardware

**Mac Mini M4 (base, 16GB RAM)**

| Service | RAM usage |
|---------|-----------|
| Ollama idle (model loaded) | ~5GB |
| n8n service | ~200MB |
| Discord bot | ~50MB |
| During test run | ~6GB total |
| **Free for your work** | **~10GB** |

- Mac Mini set to never sleep (`pmset`)
- All services auto-start on boot via macOS `launchd`
- Auto-restart after power failure

---

## Product Registry

Dynamic — add any new product by editing `config/products.json`. No code changes needed.

```json
{
  "id": "new-product",
  "name": "New Product Name",
  "type": "nextjs | flutter | both",
  "repo": "https://github.com/ezbillify/repo.git",
  "branch": "main",
  "test_url": "http://localhost:300X",
  "test_credentials": {
    "email": "test@product.com",
    "password": "secret"
  },
  "active": true
}
```

---

## EZ-Connect Integration

EZ-Connect acts as the backend brain for all agent outputs. Three API endpoints needed:

```
POST /api/agent/bugs          — file bug ticket
POST /api/agent/reports       — save test / research report
POST /api/agent/leads/bulk    — bulk insert leads to CRM
GET  /api/agent/config        — fetch agent runtime config
```

---

## Control Model

Every agent has 3 modes:
- **Auto** — runs on schedule / git push without intervention
- **Manual** — ready but waits for your trigger from dashboard
- **Paused** — completely offline

Global controls from EZ Agent Hub dashboard:
- Kill switch — stops all agents immediately
- Per-agent trigger button
- Toggle: auto-file bugs, Discord alerts, auto-approve research cards

Agents NEVER:
- Delete data without approval
- Push code to repos
- Contact real customers
- Make financial transactions
- Auto-approve their own roadmap cards

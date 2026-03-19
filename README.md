# EZ Internal Agent
> AI-powered autonomous agents for EZBillify Ventures — runs 24/7 on Mac Mini M4

## Agents

| Agent | Trigger | Does |
|-------|---------|------|
| **QA Test Agent** | Every git push | Reads diff → generates Maestro/Playwright tests via Ollama → runs on physical devices → files bugs in EZ-Connect |
| **Research Agent** | Every Monday 8AM | Scans competitors, reviews, market trends → generates feature ideas → saves to EZ-Connect roadmap |
| **Lead Gen Agent** | Every day 6AM | Scrapes Bengaluru SMBs via Apify → enriches → pushes to EZ-Connect CRM |

## Stack

```
Ollama (qwen2.5-coder:7b)  →  local LLM — zero API cost
Maestro                     →  Flutter mobile testing (physical devices)
Playwright                  →  Next.js web testing (headless)
n8n                         →  orchestration + scheduling
GitHub Actions              →  self-hosted runner on Mac Mini
Python                      →  agent brain
EZ-Connect API              →  bug filing + reports + CRM
Discord                     →  alerts to your phone
EZ Agent Hub (Next.js)      →  your command center dashboard
```

## Setup

```bash
# One command setup on Mac Mini
bash scripts/setup-macmini.sh

# Fill in your tokens
cp config/.env.example config/.env
nano config/.env
```

## Adding a New Product

Edit `config/products.json`:

```json
{
  "id": "my-new-product",
  "name": "My New Product",
  "type": "nextjs",           // nextjs | flutter | both
  "category": "description",
  "repo": "https://github.com/ezbillify/new-repo.git",
  "branch": "main",
  "test_url": "http://localhost:3003",
  "test_credentials": {
    "email": "test@product.com",
    "password": "test123"
  },
  "active": true
}
```

That's it. The agent auto-detects the platform and generates tests on the next push.

## Manual Trigger

```bash
# Run QA agent manually
python python/agent.py qa --product ezbillify-web --commit abc123

# Run research agent
python python/agent.py research --product ezbillify-web

# Run lead gen
python python/agent.py leads
```

## Control

All agents are controlled from:
- **EZ Agent Hub** dashboard (Next.js) — start/stop/pause any agent
- **n8n UI** at http://localhost:5678 — visual workflow editor
- **Discord** — receive all alerts on your phone

## RAM Usage on M4 Mac Mini (16GB)

```
Ollama idle     ~5GB
n8n service     ~200MB
During tests    ~6GB total
Free for work   ~10GB ✅
```

## Directory Structure

```
ez-internalagent/
├── python/
│   ├── agent.py              ← main entry point
│   ├── agents/
│   │   ├── research_agent.py
│   │   └── lead_gen_agent.py
│   ├── utils/
│   │   ├── diff_parser.py
│   │   ├── test_generator.py
│   │   ├── maestro_runner.py
│   │   ├── playwright_runner.py
│   │   ├── ezconnect_client.py
│   │   ├── discord_client.py
│   │   └── product_registry.py
│   └── requirements.txt
├── n8n/
│   └── workflow.json         ← import into n8n
├── config/
│   ├── products.json         ← product registry
│   └── .env.example
├── scripts/
│   ├── setup-macmini.sh      ← one-time setup
│   └── com.ezbillify.ollama.plist
└── .github/
    └── workflows/
        └── agent.yml
```

## EZ-Connect API Endpoints Needed

Add these to EZ-Connect:

```
POST /api/agent/bugs          → file a bug ticket
POST /api/agent/reports       → save test/research report  
POST /api/agent/leads/bulk    → bulk insert leads to CRM
GET  /api/agent/config        → fetch agent settings
```

---
Built by EZBillify Ventures | Runs on Mac Mini M4 | Zero cloud cost

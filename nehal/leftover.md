# Leftover 🔧
> Remaining work, known gaps, and things to wire up before going live

---

## 🔴 Blockers — Must fix before first run

### 1. Fill in `config/.env`
```bash
cp config/.env.example config/.env
```
Required values:
- [ ] `GITHUB_AGENT_TOKEN` — create `ez-agent-bot` GitHub account, give read access to all 4 repos
- [ ] `DISCORD_WEBHOOK_URL` — create webhook in your Discord server
- [ ] `EZCONNECT_URL` — your EZ-Connect local or deployed URL
- [ ] `EZCONNECT_API_KEY` — generate an API key in EZ-Connect

Optional (agents degrade gracefully without these):
- [ ] `APIFY_TOKEN` — for real lead scraping (mock data used otherwise)
- [ ] `SERPER_API_KEY` — for research agent web search

---

### 2. Build 4 EZ-Connect API endpoints
See `planning.md` for exact request/response specs.
- [ ] `POST /api/agent/bugs`
- [ ] `POST /api/agent/reports`
- [ ] `POST /api/agent/leads/bulk`
- [ ] `GET /api/agent/config`

---

### 3. Run Mac Mini setup
```bash
bash scripts/setup-macmini.sh
```
- [ ] Ollama installed + models pulled
- [ ] Maestro CLI installed
- [ ] Playwright + Chromium installed
- [ ] n8n installed
- [ ] adb installed
- [ ] Mac Mini sleep disabled

---

### 4. Set up GitHub Actions self-hosted runner
Do this for each product repo that needs QA testing:
- [ ] EZBillify V2 Web repo → Settings → Actions → Runners → New self-hosted runner → Mac
- [ ] EZBillify V2 App repo → same
- [ ] EZ-Dine repo → same

Add secrets to each repo:
- [ ] `OLLAMA_URL` = `http://localhost:11434`
- [ ] `OLLAMA_MODEL` = `qwen2.5-coder:7b`
- [ ] `AGENT_GITHUB_TOKEN`
- [ ] `EZCONNECT_URL`
- [ ] `EZCONNECT_API_KEY`
- [ ] `DISCORD_WEBHOOK_URL`

---

### 5. Connect physical devices
- [ ] Android phone: enable USB debugging → connect USB → run `adb devices` → confirm listed
- [ ] iPhone: connect USB → trust Mac → register UDID in Apple Developer portal

---

### 6. Create test credentials in Supabase
For each product:
- [ ] Create test org with `is_test: true`
- [ ] Create test user `test@ezbillify.com` / `test@ezdine.com`
- [ ] Pre-seed: items, customers, invoices (EZBillify), menu + tables (EZ-Dine)
- [ ] Update `config/products.json` with real test passwords

---

### 7. Import n8n workflow
- [ ] Start n8n: `n8n start`
- [ ] Open `http://localhost:5678`
- [ ] Import `n8n/workflow.json`
- [ ] Update the `Execute Command` node paths to your actual project path
- [ ] Activate the workflow

---

## 🟡 Wiring Gaps — Code exists but needs connecting

### `agent.py` — repo path
```python
# Line ~85 in agent.py
repo_path = f"/tmp/ez-agent-repos/{repo_name}"
```
Update `REPOS_DIR` in `.env` if you want a different location.

### `n8n/workflow.json` — update command paths
In the workflow JSON, update these lines:
```
"command": "cd /path/to/ez-internalagent && ..."
```
Replace `/path/to/ez-internalagent` with your actual path (e.g. `/Users/nehal/ez-internalagent`).

### `config/products.json` — test passwords
Replace `TEST_PASSWORD_HERE` with real test account passwords or reference env vars.

### Dashboard `.env.local`
```bash
# dashboard/.env.local
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ez-agent-control
N8N_WEBHOOK_SECRET=your_secret
```

---

## 🟢 Nice to have — not blocking

- [ ] `dashboard/app/agents/qa/page.tsx` — detailed QA page (see planning.md)
- [ ] `dashboard/app/agents/research/page.tsx` — research detail page
- [ ] `dashboard/app/agents/leads/page.tsx` — leads detail page
- [ ] `dashboard/app/bugs/page.tsx` — bug reports view
- [ ] `dashboard/app/logs/page.tsx` — full log streaming
- [ ] Real-time log streaming via Supabase Realtime
- [ ] Agent health monitor (5-min ping)
- [ ] Discord bot upgrade (two-way control)
- [ ] iOS device support via `maestro-ios-device`
- [ ] Per-repo webhook trigger files (lightweight `notify-agent.yml`)
- [ ] Supabase test data seed + reset scripts
- [ ] Version auto-reading from `package.json` / `pubspec.yaml`

---

## 🧪 First Run Checklist

Once all blockers are resolved, do a dry run:

```bash
# 1. Verify Ollama is running
curl http://localhost:11434/api/tags

# 2. Verify Android device connected
adb devices

# 3. Test Python agent manually (no git push needed)
cd python
python agent.py qa --product ezbillify-web --commit HEAD --branch main

# 4. Check Discord — should receive a report
# 5. Check EZ-Connect — should have a test report entry

# 6. Make a small code change in EZBillify, push to main
# 7. Watch GitHub Actions run on Mac Mini
# 8. Watch Discord for automatic report
```

---

## 📦 Repo Structure Still Needed

```
ez-internalagent/
├── nehal/                    ✅ this folder
├── maestro/
│   ├── ezbillify/            ⬜ add seed flows once test credentials ready
│   └── ezdine/               ⬜ add seed flows once test credentials ready
├── playwright/
│   ├── ezbillify/            ⬜ add seed tests once test URL is live
│   └── ezdine/               ⬜ add seed tests once test URL is live
└── dashboard/
    └── app/
        ├── agents/
        │   ├── qa/page.tsx   ⬜ detailed QA page
        │   ├── research/     ⬜ research page
        │   └── leads/        ⬜ leads page
        ├── bugs/page.tsx     ⬜ bug reports
        └── logs/page.tsx     ⬜ log streaming
```

# EZ Internal Agent — Complete Setup Guide
> Step by step. Run this once on your Mac Mini M4 and agents run forever.

---

## Prerequisites

- Mac Mini M4 (16GB RAM) — connected to internet 24/7
- Android phone with USB cable
- iPhone with USB cable  
- GitHub account for agent bot (`ez-agent-bot`)
- Discord server with a channel for agent alerts
- EZ-Connect running locally or deployed

---

## Step 1 — Clone the repo

```bash
cd ~
git clone https://github.com/ezbillify/ez-internalagent.git
cd ez-internalagent
```

---

## Step 2 — One-command Mac Mini setup

```bash
bash scripts/setup-macmini.sh
```

This installs:
- Homebrew
- Ollama + pulls `qwen2.5-coder:7b` and `llama3.2:3b`
- Python 3.11 + pip dependencies
- Node.js + Playwright + Chromium
- Maestro CLI
- n8n
- Android platform tools (adb)
- Disables Mac Mini sleep permanently
- Registers Ollama as a launchd service (auto-starts on boot)

**Expected time:** 15-20 minutes (model download is the slowest part)

---

## Step 3 — Fill in your secrets

```bash
cp config/.env.example config/.env
nano config/.env
```

Fill in these values:

```env
# Local LLM — already running after setup
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# GitHub agent bot
# 1. Create GitHub account: ez-agent-bot
# 2. Generate a Personal Access Token (read:repo scope only)
# 3. Give ez-agent-bot read access to all 4 product repos
GITHUB_AGENT_TOKEN=ghp_xxxxxxxxxxxx

# EZ-Connect
EZCONNECT_URL=http://localhost:3002
EZCONNECT_API_KEY=your_api_key_here

# Discord
# Go to: Discord Server Settings → Integrations → Webhooks → New Webhook
# Choose your #agent-alerts channel → Copy Webhook URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy

# Lead Gen (optional — mock data used if not set)
# Free at apify.com → 100 free actor runs/month
APIFY_TOKEN=apify_api_xxxxxxxxxxxx

# Research Agent (optional — skips web search if not set)
# Free at serper.dev → 2500 free searches/month
SERPER_API_KEY=xxxxxxxxxxxx
```

---

## Step 4 — Set up physical devices

### Android
```bash
# 1. On your Android phone:
#    Settings → About Phone → tap Build Number 7 times (enables Developer Options)
#    Settings → Developer Options → USB Debugging → ON

# 2. Connect USB cable to Mac Mini

# 3. Verify connection:
adb devices
# Should show: XXXXXXXX   device
```

### iPhone
```bash
# 1. Connect iPhone via USB to Mac Mini
# 2. On iPhone: tap "Trust This Computer"
# 3. Open Xcode → Window → Devices and Simulators
# 4. Your iPhone should appear — note the UDID
# 5. Register UDID in Apple Developer portal (developer.apple.com)
#    Certificates → Devices → Register a Device

# 6. Install maestro-ios-device patch:
brew install libimobiledevice
pip install maestro-ios-device
```

---

## Step 5 — Create test credentials in Supabase

For each product, create an isolated test account:

### EZBillify test account
1. Go to your EZBillify web app
2. Register a new account: `test@ezbillify.com`
3. In Supabase dashboard, find the org and set `is_test = true`
4. Pre-seed some data: add 3-5 items, 2-3 customers, 1 invoice, 1 purchase bill

### EZ-Dine test account
1. Register: `test@ezdine.com`
2. Set `is_test = true` in Supabase
3. Pre-seed: menu items, tables, one test order

### Update config
```json
// config/products.json — replace TEST_PASSWORD_HERE
"test_credentials": {
  "email": "test@ezbillify.com",
  "password": "your_actual_test_password"
}
```

---

## Step 6 — Build EZ-Connect API endpoints

Add these 4 routes to EZ-Connect. See `planning.md` for full request/response specs.

```
POST /api/agent/bugs
POST /api/agent/reports  
POST /api/agent/leads/bulk
GET  /api/agent/config
```

Quick example for the bugs endpoint:

```typescript
// src/app/api/agent/bugs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
  if (apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("agent_bugs")
    .insert({
      product_id: body.product_id,
      product_name: body.product_name,
      title: body.title,
      description: body.description,
      severity: body.severity,
      status: "open",
      metadata: body.metadata,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
```

---

## Step 7 — Import n8n workflow

```bash
# Start n8n
n8n start

# Open browser at:
http://localhost:5678
```

1. Create account (first time only)
2. Click **Import** → **From File**
3. Select `n8n/workflow.json`
4. In the imported workflow, find the **Execute Command** nodes
5. Update the path in each command:

```bash
# Change this:
cd /path/to/ez-internalagent && source config/.env && python python/agent.py ...

# To your actual path, e.g.:
cd /Users/nehal/ez-internalagent && source config/.env && python python/agent.py ...
```

6. Click **Activate** (top right toggle)

---

## Step 8 — Set up GitHub Actions self-hosted runner

Do this for each of the 4 product repos:

1. Go to the repo on GitHub
2. Settings → Actions → Runners → **New self-hosted runner**
3. Select **macOS** → follow the commands exactly
4. When asked for labels, add: `self-hosted,macOS,M4`

Add these secrets to each repo (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `OLLAMA_URL` | `http://localhost:11434` |
| `OLLAMA_MODEL` | `qwen2.5-coder:7b` |
| `AGENT_GITHUB_TOKEN` | your ez-agent-bot token |
| `EZCONNECT_URL` | your EZ-Connect URL |
| `EZCONNECT_API_KEY` | your API key |
| `DISCORD_WEBHOOK_URL` | your Discord webhook |

---

## Step 9 — Start the EZ Agent Hub dashboard

```bash
cd dashboard
npm install
npm run dev
# Opens at http://localhost:4000
```

---

## Step 10 — First run test

```bash
# Verify everything manually before pushing real code

# 1. Check Ollama
curl http://localhost:11434/api/tags
# Should return list of models including qwen2.5-coder:7b

# 2. Check Android device
adb devices
# Should show a device

# 3. Run QA agent manually
cd ~/ez-internalagent
source config/.env
python python/agent.py qa \
  --product ezbillify-web \
  --commit $(cd /tmp/ez-agent-repos/ezbillify-web && git rev-parse HEAD) \
  --branch main

# 4. Watch terminal for output
# 5. Check Discord — should receive a test report
# 6. Check EZ-Connect — should have a new report entry
```

---

## Step 11 — Verify auto-trigger works

1. Make a small code change in EZBillify V2 Web (add a comment, change a string)
2. Push to `main`
3. Go to GitHub → Actions → watch the workflow run on your Mac Mini
4. Watch Discord — report should arrive within 2-3 minutes

**You're live. Agents are running 24/7.**

---

## Ongoing — Adding new products

When you build a new product (e.g. EZFlow):

1. Add entry to `config/products.json`
2. Set up GitHub Actions runner on that repo
3. Add test credentials in Supabase
4. That's it — agent auto-detects platform and generates tests

---

## Troubleshooting

### Ollama not responding
```bash
# Restart Ollama
launchctl stop com.ezbillify.ollama
launchctl start com.ezbillify.ollama

# Check logs
tail -f /tmp/ez-agent-logs/ollama.log
```

### Android device not detected
```bash
# Unplug and replug USB
adb kill-server
adb start-server
adb devices
```

### n8n workflow not triggering
```bash
# Check n8n is running
curl http://localhost:5678/healthz

# Check webhook URL in GitHub Actions secret matches n8n webhook path
```

### Test generation is poor quality
- Try switching to `phi4:14b` in settings (slower but smarter)
- Check that git diff is not empty — agent skips if no meaningful changes

### Discord not receiving messages
```bash
# Test webhook manually
curl -X POST $DISCORD_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"content": "EZ Agent test message"}'
```

---

## File Locations Reference

```
~/ez-internalagent/          Main repo
~/ez-internalagent/config/.env   Your secrets (never commit this)
/tmp/ez-agent-repos/         Cloned product repos (auto-managed)
/tmp/ez-agent-tests/         Generated test files + results
/tmp/ez-agent-logs/          Ollama + agent logs
~/Library/LaunchAgents/      macOS auto-start services
```

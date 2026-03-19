# Implemented ✅
> Everything that is built and ready to use

---

## Python Agent Brain

### `python/agent.py` — Main entry point
- [x] CLI interface: `python agent.py qa|research|leads`
- [x] `--product`, `--commit`, `--branch` flags
- [x] Auto-clones / pulls repo using agent GitHub token
- [x] Routes to correct agent based on argument
- [x] Processes results and sends to EZ-Connect + Discord

### `python/utils/diff_parser.py`
- [x] Parses raw git diff into structured format
- [x] Detects Flutter changes (`.dart`, `pubspec.yaml`, `lib/`, `android/`, `ios/`)
- [x] Detects Next.js changes (`.tsx`, `src/app/`, `src/components/`, `next.config.*`)
- [x] Extracts changed screen names per platform
- [x] Falls back to repo structure detection if diff is ambiguous

### `python/utils/test_generator.py`
- [x] Calls local Ollama API (`/api/generate`)
- [x] Generates Maestro YAML flows from git diff (Flutter)
- [x] Generates Playwright TypeScript tests from git diff (Next.js)
- [x] Injects real test credentials into generated tests
- [x] Validates YAML has `appId` before saving
- [x] Splits multiple flows/tests cleanly via separator tokens

### `python/utils/maestro_runner.py`
- [x] Detects connected Android device via `adb devices`
- [x] Detects connected iPhone via `idevice_id`
- [x] Runs each Maestro flow with `--format junit`
- [x] Captures pass/fail per flow
- [x] Extracts screenshots on failure
- [x] Handles timeout (120s per flow)
- [x] Handles Maestro CLI not installed gracefully

### `python/utils/playwright_runner.py`
- [x] Runs Playwright tests headless (no browser window)
- [x] Auto-installs Playwright + Chromium if not present
- [x] Injects `BASE_URL`, `TEST_EMAIL`, `TEST_PASSWORD` as env vars
- [x] Parses JSON output for structured error extraction
- [x] Handles timeout (180s per test file)

### `python/utils/ezconnect_client.py`
- [x] `file_bug()` — files bug ticket with severity, description, commit, version
- [x] Auto-determines severity from error message keywords
- [x] Builds formatted markdown bug description
- [x] `create_test_report()` — saves test/research reports
- [x] `get_agent_config()` — fetches runtime config from EZ-Connect
- [x] Graceful error handling — won't crash agent if EZ-Connect is down

### `python/utils/discord_client.py`
- [x] Sends rich Discord embeds via webhook
- [x] Color-coded by result (green=pass, red=fail, purple=research, amber=leads)
- [x] `send_test_report()` — formatted QA summary
- [x] `send_research_digest()` — weekly research report
- [x] `send_lead_gen_report()` — lead gen summary with breakdown
- [x] Graceful skip if webhook not configured

### `python/utils/product_registry.py`
- [x] Load all products from `config/products.json`
- [x] Get single product by ID
- [x] Register new product dynamically
- [x] Remove product
- [x] Save back to JSON

### `python/agents/research_agent.py`
- [x] Web search via Serper API
- [x] Competitor-specific search queries per product type
- [x] App store review scanning
- [x] Indian SMB market trend research
- [x] Ollama analysis with JSON output format
- [x] Feature ideas with effort/impact scoring
- [x] Falls back gracefully if Serper key not set

### `python/agents/lead_gen_agent.py`
- [x] Apify Google Maps scraper integration
- [x] Multi-category scraping (restaurants, grocery, wholesale, medical)
- [x] Product fit determination per lead (EZBillify vs EZ-Dine)
- [x] Bulk push to EZ-Connect CRM
- [x] Mock data fallback when Apify not configured

---

## Config

### `config/products.json`
- [x] EZBillify V2 Web pre-registered
- [x] EZBillify V2 App pre-registered
- [x] EZ-Dine Web pre-registered
- [x] EZ-Dine App pre-registered

### `config/.env.example`
- [x] All required env vars documented with descriptions
- [x] Ollama, GitHub, EZ-Connect, Discord, Apify, Serper

---

## CI/CD

### `.github/workflows/agent.yml`
- [x] Triggers on push to `main`, `develop`, `staging`
- [x] Manual trigger via `workflow_dispatch` with agent + product selection
- [x] Auto-detects which product based on repo name
- [x] Passes all secrets as env vars to Python agent
- [x] Uploads test artifacts for 7 days

---

## n8n

### `n8n/workflow.json`
- [x] GitHub webhook trigger (POST)
- [x] Main branch filter
- [x] Execute Command node → runs Python QA agent
- [x] Weekly schedule → Monday 8AM → research agent
- [x] Daily schedule → 6AM → lead gen agent
- [x] Dashboard control webhook (kill switch support)

---

## EZ Agent Hub (Next.js Dashboard)

### `dashboard/app/page.tsx` — Overview
- [x] Mac Mini online/offline status badge
- [x] Metrics: tests run, bugs filed, leads today, uptime
- [x] Per-agent cards with mode badge + trigger button
- [x] Mini live log strip per agent
- [x] Full live log view
- [x] Kill switch button

### `dashboard/app/products/page.tsx` — Product Registry
- [x] List all registered products
- [x] Add new product form (name, type, repo, credentials)
- [x] Toggle active/inactive per product
- [x] Platform type badge (Next.js / Flutter)

### `dashboard/app/settings/page.tsx` — Settings
- [x] Ollama model selector
- [x] Ollama status indicator
- [x] All agent behaviour toggles
- [x] Kill switch + clear queue

### `dashboard/app/api/agents/trigger/route.ts`
- [x] POST endpoint → triggers n8n webhook

### `dashboard/app/api/agents/kill-all/route.ts`
- [x] POST endpoint → sends pause_all to n8n

---

## Mac Mini Setup

### `scripts/setup-macmini.sh`
- [x] Prevents Mac Mini sleep permanently
- [x] Installs Homebrew, Ollama, Python, Node.js, Playwright, Maestro, n8n, adb
- [x] Pulls qwen2.5-coder:7b and llama3.2:3b models
- [x] Registers Ollama as launchd service (auto-starts on boot)
- [x] Creates `.env` from template
- [x] Prints next steps

### `scripts/com.ezbillify.ollama.plist`
- [x] macOS launchd plist for Ollama auto-start
- [x] OLLAMA_MAX_LOADED_MODELS=1 (RAM optimised for 16GB)
- [x] Logs to `/tmp/ez-agent-logs/`

---

## Documentation

### `README.md`
- [x] Full architecture overview
- [x] Stack table
- [x] Setup instructions
- [x] How to add new product
- [x] Manual trigger commands
- [x] RAM usage breakdown
- [x] EZ-Connect endpoints needed

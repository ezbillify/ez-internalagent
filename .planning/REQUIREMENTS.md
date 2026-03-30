# Requirements: EZ Internal Agent Hub

## Overview
This document defines the high-level functional and technical requirements for the EZ Internal Agent project as we initialize it on this device.

## Core Capabilities

### QA Agent (`python/`)
1. **Source Discovery**: Automatically detect source repositories and checkout changes.
2. **Platform Detection**: Correctly identify Flutter (Mobile) vs. Next.js (Web) changes using `diff_parser.py`.
3. **Test Generation**: Leverage `ollama` to generate Maestro YAML and Playwright specs.
4. **Result Aggregation**: Consolidate test results (pass/fail/failures) into a single JSON report.
5. **Discord Integration**: Post summary reports to the configured Discord channel.
6. **Bug Filing**: Automatically push failure reports to EZ-Connect via API.

### Research Agent (`python/`)
1. **Product Analysis**: Extract product metadata and perform domain-specific research.
2. **Report Generation**: Synthesize findings into structured research summaries.
3. **Multi-Channel Delivery**: Push reports to both EZ-Connect and Discord.

### Lead Gen Agent (`python/`)
1. **Lead Discovery**: Identify new potential leads (data source specific).
2. **CRM Integration**: Move discovered leads into the EZ-Connect CRM.
3. **LD-01 (Daily Volume)**: Generate 200 leads per day per product autonomously.
4. **LD-02 (Apify Integration)**: Perform targeted research via Apify based on product profiles.
5. **LD-03 (Excel Export)**: Store all discovered leads in `leads.xlsx` with product-specific sheets.

### Research Agent & Product Intelligence (`python/`)
1. **RES-01 (GitHub Analysis)**: Analyze GitHub repository URLs to generate full product descriptions and technical data.
2. **RES-02 (Fleet Sync)**: Automatically update the product registry (fleet) with researched data.

### Management Dashboard (`dashboard/`)
1. **GOV-01 (Governance UI)**: Professional "Governance" page for decentralized API key management (Apify, Discord, etc.).
2. **GOV-02 (Secure Secrets)**: UI-driven updates to `.env` or `secrets.json` for agent configuration.
3. **Product Management**: Interface to add/edit target products in `products.json`.
4. **Fleet Monitor**: Enhanced view showing researched product intelligence (from RES-01).

## Technical Constraints
- **Hardware Integration**: Optimized for macOS (Apple Silicon/Mac Mini) and Windows.
- **Dependency Management**: Python 3.10+ and Node.js 20+ required.
- **Storage**: Supabase for persistent state and audit logs.
- **Local Model**: Must support at least `qwen2.5-coder:7b` via Ollama.

## Success Criteria (UAT)
- [ ] `python agent.py qa` successfully parses a diff and generates mock tests.
- [ ] `next dev` starts the dashboard on port 4000 without errors.
- [ ] API tokens in `.env` allow successful pings to EZ-Connect and Discord.
- [ ] GSD commands (`/gsd:progress`) reflect accurate project state.

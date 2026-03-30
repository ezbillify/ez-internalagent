# Roadmap: EZ Internal Agent Hub

## Overview
Phase structure for initializing and validating the EZ Internal Agent on this new device.

---

## Milestone 1: Environment Setup & Validation
Goal: Get all components running and communicating on the current hardware.

### Phase 1: Dependency Installation & Config
- [ ] Install Python requirements (`python/requirements.txt`).
- [ ] Install Node packages for [dashboard](file:///d:/ez-internalagent/dashboard/package.json).
- [ ] Create and verify `.env` file from `config/.env.example`.
- [ ] Confirm `git` and `npx` are baseline ready.

### Phase 2: Agent Brain Validation (Python)
- [ ] Check Ollama server connectivity (`http://localhost:11434`).
- [ ] Verify `agent.py` loads with all utility imports intact.
- [ ] Run `agent.py qa` in dry-run mode (verify diff parsing and agent initialization).
- [ ] Verify `ResearchAgent` can synthesis a mock product report.

### Phase 3: Dashboard Validation (Next.js)
- [ ] Verify `next dev` starts successfully.
- [ ] Confirm Supabase/Zustand connectivity.
- [ ] Verify product registry (`products.json`) is readable via the dashboard API.

### Phase 4: Integration Test & Reporting
- [ ] Send a manual "Environment Ready" notification to Discord.
- [ ] Final project status report via GSD (`/gsd:session-report`).

---

## Milestone 2: UI/UX Modernization (Active)
Goal: Transform the dashboard into a professional, data-driven command center with realtime logs and modern analytics.

### Phase 5: Realtime Data Integration
- [x] Connect dashboard to Local JSON for live logs.
- [x] Implement aggregation API for realtime metrics (Tests, Bugs, Leads).
- [x] Replace mock data in `page.tsx` with live polling.

### Phase 6: UI Redesign (PowerBI Style)
- [x] Redesign dashboard with light colors, glassmorphism, and modern cards/charts.
- [x] Integrate visual analytics via Recharts.
- [ ] Refine product-specific health charts.

---

## Milestone 3: Core Feature Expansion (Future)
Goal: Enhance agent capabilities based on original mission.

### Phase 5: Maestro Runner Stability
- [ ] Refine `run_maestro` logic for Apple Silicon.
- [ ] Improve flakiness detection in mobile tests.

### Phase 6: Lead Gen Data Enrichment
- [ ] Integrate external lead validation APIs.
- [ ] Implement enhanced Lead Gen reporting UI in Dashboard.

### Phase 10: Integrated Research & Lead Gen Pipeline: End-to-end GitHub URL analysis, social research, business matching, and Apify lead generation with progress tracking.

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 9
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 10 to break down)

---

## Milestone 3: Autonomous Intelligence & Lead Gen (Complete)
Goal: Implement autonomous product research and high-volume lead generation.

### Phase 7: Governance & API Management
- [x] Create **Governance** page for API key management (Apify, Discord, etc.).
- [x] Implement secure secret storage and `.env` synchronization.
- [x] Design professional "Slate & Cobalt" settings UI via StitchMCP.

### Phase 8: Autonomous Product Research
- [x] **Research Agent**: Implement GitHub repository analysis (Clone + LLM profiling).
- [x] **Fleet Sync**: Automatically update the product registry with researched intel.
- [x] **Fleet UI**: Update the Dashboard fleet monitor to display product deep-dives.

### Phase 9: High-Volume Lead Generation
- [x] **Lead Gen Agent**: Integrate Apify scrapers based on product profiles.
- [x] **Volume Goal**: Implement autonomous scheduling for 200 leads/day/product.
- [x] **Local Storage**: Implement Excel export (`leads.xlsx`) with automated updates.
- [x] **Dashboard Logs**: Update UI to reflect lead generation progress and history.

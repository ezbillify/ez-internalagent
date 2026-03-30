# PROJECT: EZ Internal Agent Environment Setup

## Context
This project is an AI-driven internal automation system for QA, Lead Gen, and Research. I am currently setting up the environment on a **new device** for the user.

## Core Value
Streamline internal operations by making the AI agents (QA/Leads/Research) and the management dashboard operational on this hardware.

## Mission
Initialize and validate the foundational stack (Python, Next.js, Ollama) and ensure all agent functionalities are executing correctly.

## Requirements

### Validated
- ✓ **GSD Integration**: GSD installed and codebase mapped.
- ✓ **Source Control**: Git initialized and tracking project state.

### Active
- [x] **UI/UX Modernization**: Dashboard redesigned with Enterprise Grade UI.
- [x] **Product Intelligence**: Research Agent analyzes GitHub URLs to build product profiles.
- [x] **Fleet Integration**: Save researched product details automatically to the registry.
- [x] **Lead Gen Automation**: Generate 200 leads per day per product via Apify.
- [x] **Excel Export**: Store all generated leads in local `.xlsx` files.
- [x] **Governance UI**: Professional settings page for API key management (Apify, etc.).

### Out of Scope
- [ ] Multi-region deployment.
- [ ] Real-time physical device testing (Maestro) - simulation only for now.

## Key Decisions
- **GSD as Orchestrator**: Using GSD (Get Shit Done) to track and execute all setup phases.
- **Local-First LLM**: Using Ollama to ensure data privacy and low latency for internal workflows.

## Evolution
This document will track the transition from "Setup" to "Feature Implementation".

---
*Last updated: 2026-03-30 after initialization on new device*

# Architecture

## Core Concept — The "Agent Hub"
The system is an internal AI-driven platform for automated QA, research, and lead generation. It follows a decoupled, multi-component architecture.

### Brain (Python)
- **QA Agent**: Reads code changes via `git diff`, detects target platforms (Flutter/Next.js), generates tests via Ollama, runs them (Maestro/Playwright), and reports results.
- **Research Agent**: Analyzes products and generates PDF/Markdown reports for decision-making.
- **Lead Gen Agent**: Extracts potential leads and pushes them to CRM.
- **Utilities**: Shared logic for diff parsing, test execution, and client communication.

### Interface (Next.js Dashboard)
- **EZ Agent Hub**: A Next.js 15 app that allows users to monitor agent activity, view logs, manages products, and configure settings.
- **Real-time State**: Uses Supabase for data and Zustand for local state management.

### Automation (n8n)
- **Workflow Engine**: Orchestrates complex sequences between GitHub events, EZ-Connect, and the agent workers.

### Infrastructure
- **Local Heavy**: Uses local LLMs (Ollama) to avoid high API costs and keep data internal.
- **Containerized/Scripted**: Setup scripts for Apple Silicon (Mac Mini) and PLIST files for service management.

## Build Order / Dependencies
1. **Config & Env**: Shared credentials and product definitions.
2. **Workers (Python)**: The core execution logic.
3. **Frontend (Next.js)**: The administrative layer.
4. **Flows (n8n)**: The connecting wires.

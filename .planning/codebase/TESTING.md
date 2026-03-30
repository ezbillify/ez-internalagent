# Testing

## Overview
Testing is a first-class citizen in this project, implemented via the **QA Agent** (`python/agent.py`).

## Test Frameworks
- **Maestro**: Used for testing Flutter/Mobile applications.
- **Playwright**: Used for testing Next.js/Web applications.

## QA Agent Workflow
1. **Detect Platforms**: The QA Agent parses `git diff` from target repos.
2. **Generate Tests**: For each platform detected, AI (Ollama) generates:
   - Maestro YAML flows (`/tmp/ez-agent-tests/{product}/maestro/`)
   - Playwright spec files (`/tmp/ez-agent-tests/{product}/playwright/`)
3. **Execute**:
   - `run_maestro`: Executes generated flows on a physical device or emulator.
   - `run_playwright`: Executes generated specs in a headless browser environment.
4. **Report**: Results are aggregated, sent to Discord, and filed as bugs in EZ-Connect if failures occur.

## Internal Testing
- **Dashboard**: Tested via Next.js `next lint` and dev-mode verification.
- **Agent Workers**: Tested via local execution of `python agent.py qa/research/leads`.

## Success Criteria
- **Pass/Fail aggregated reporting**: Summary of all platforms tested.
- **Bug Filing**: Automatic creation of bug reports on failures.
- **Discord Alerts**: Real-time status updates for the dev team.

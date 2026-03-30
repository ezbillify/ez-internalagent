# Integrations

## Internal Systems
- **EZ-Connect API**: Main reporting and bug-tracking endpoint for agents.
- **Product Registry**: Local `products.json` and Supabase for managing target app metadata.

## External Platforms
- **GitHub**:
  - `GITHUB_AGENT_TOKEN` used for cloning and polling repos.
  - Diff analysis triggers QA workflows.
- **Discord**:
  - Webhooks used for passing test results and research reports.
- **Ollama API**:
  - Local interaction via `http://localhost:11434`.
  - JSON mode used for structured test generation.
- **Supabase SDK**:
  - Used in `dashboard/` for data retrieval and state management.
- **n8n**:
  - Workflow triggers likely coming from EZ-Connect or GitHub webhooks.
- **Maestro CLI**:
  - Executed locally by QA agent for Flutter tests.
- **Playwright Test**:
  - Executed locally by QA agent for Web tests.

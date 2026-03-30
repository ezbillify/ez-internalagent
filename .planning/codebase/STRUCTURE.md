# Structure

## Project Layout

### `/python`
Core logic for AI agents and test execution.
- `/python/agent.py`: Main entry point for the QA, Research, and Lead Gen agents.
- `/python/agents/`: Subclasses for each agent type.
- `/python/utils/`: High-leverage utilities for diff parsing, test generation, and runner logic.
- `/python/requirements.txt`: Python dependencies.

### `/dashboard`
Next.js 15 application for the Agent Hub.
- `/dashboard/app/`: Next.js App Router root.
- `/dashboard/app/api/`: Frontend API routes.
- `/dashboard/app/products/`: Product management views.
- `/dashboard/app/settings/`: Dashboard and agent configuration.
- `/dashboard/package.json`: Frontend dependencies and scripts.

### `/n8n`
Workflow definitions for automation.
- `/n8n/workflow.json`: The principal automation flow.

### `/config`
Shared configuration and product registry.
- `/config/.env.example`: Template for environment variables.
- `/config/products.json`: Registry of target applications (Flutter, Next.js, etc.).

### `/scripts`
Deployment and setup tools.
- `/scripts/setup-macmini.sh`: Local server setup script.
- `/scripts/com.ezbillify.ollama.plist`: macOS service definition for Ollama.

### `/nehal`
Workspace area for Nehal (likely the developer profile or specific project files).

### `/.agent`
GSD (Get Shit Done) installation directory.
- `/.agent/skills/`: Custom capability definitions for agentic workflows.
- `/.agent/get-shit-done/`: Core GSD logic and workflows.

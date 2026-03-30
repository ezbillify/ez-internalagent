# Conventions

## Python
- **Type Hinting**: Use type hints for function arguments and return values.
- **Argparse CLI**: Consistent usage of `argparse` for all worker agents.
- **Environment Variables**: Use `os.getenv` with sensible defaults (e.g., `OLLAMA_URL`).
- **Utility Modules**: Encapsulate complex logic (git diff, test runs) into `utils/` to keep `agent.py` focused on orchestration.

## Next.js (Dashboard)
- **App Router**: Use `/app/` directory and server/client components appropriately.
- **Tailwind CSS 4**: Preference for utility classes over custom CSS.
- **Lucide Icons**: Standardization on `lucide-react` for iconography.
- **Zustand**: Lightweight state management for frontend stores.
- **React 19 / Next.js 15**: Use the latest features (Server Actions, Concurrent features).

## AI / LLM
- **Local-First**: Default to Ollama for all LLM tasks.
- **Model Standard**: `qwen2.5-coder:7b` for code-heavy tasks (test generation).
- **Structured Output**: AI generates YAML (Maestro) or TypeScript (Playwright) flows with JSON headers.

## Git & Workflow
- **Commit Strategy**: Commits for documentation and code should be atomic.
- **GSD Context**: All major changes should be tracked via GSD (Get Shit Done) phases.
- **Secrets Management**: No API keys in source code; use `.env` files exclusively.

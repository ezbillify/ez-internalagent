# Concerns

## Technical Debt & Performance
- **Ollama Latency**: Generating complex Playwright or Maestro flows on a `qwen2.5-coder:7b` model may take significant time on standard hardware (e.g., Mac Mini).
- **Physical Device Dependencies**: Maestro testing relies on available connected physical devices, which could lead to flakiness or bottlenecks in the QA pipeline if not managed properly.
- **Diff Parsing Errors**: `utils/diff_parser.py` may fail on particularly large or complex diffs (recreations, major moves), leading to incorrect platform detection.

## Security
- **API Token Proliferation**: The agent requires numerous high-privilege tokens (GitHub, Discord, Supabase, EZ-Connect). Storing these in `.env` files across different environments requires careful coordination and rotation.
- **Local Model Constraints**: While data is kept local via Ollama, model quality might not match OpenAI/Claude for subtle edge cases in test generation.

## Observability
- **Error Tracking**: While bugs are filed on EZ-Connect, errors *within* the agents themselves (e.g., Ollama server down, timeout during test run) might be harder to debug if not logged centrally.
- **Workflow Monitoring**: `n8n` workflows can be difficult to monitor and debug if they fail silently between external systems.

## Future Constraints
- **Scaling to Many Products**: `products.json` and the shared registry may need a better management backend (Supabase) if the number of monitored repos grows significantly.
- **Version Compatibility**: Next.js 15 and React 19 are bleeding edge; compatibility issues with third-party libraries may arise.

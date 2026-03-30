# Plan: Dependency Installation & Config

## Goal
Install all required libraries for the Python workers and Next.js dashboard, and initialize environment configuration.

## Requirements Checklist
- [ ] Python packages: `requests`, `python-dotenv`, `pyyaml`.
- [ ] Node packages: Full Next.js 15 dev environment (`lucide-react`, `tailwindcss`, `supabase`, etc.).
- [ ] Environment file: `.env` exists with necessary keys.

## Implementation Steps

### Plan 1 — Install Python deps
- Action: `pip install -r python/requirements.txt`
- Verification: `pip list` contains the packages.

### Plan 2 — Install Node deps
- Action: `npm install` in `/dashboard` (using `npm i` for speed).
- Verification: `node_modules` exists in `/dashboard`.

### Plan 3 — Create .env
- Action: `cp config/.env.example .env` if not already present.
- Verification: `.env` file exists.

## Success Criteria (Verification Loop)
1. `import requests` in Python works without error.
2. `dashboard/node_modules/` is populated.
3. `.env` is accessible and contains values.

---
*Created: 2026-03-30 14:10 by Antigravity*

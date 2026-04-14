# RentChain (Monorepo)

This repository is organized into two top-level folders:

- `frontend/`: Next.js web app (UI + current API routes)
- `backend/`: reserved for a standalone backend service (optional / future)

## Quick start

From the repo root:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Notes

- The app runs in webpack dev mode by default (`--webpack`) to avoid Turbopack CPU instruction issues on some machines.


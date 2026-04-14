# Backend

Standalone backend service (Express).

## Run locally

```bash
npm install
npm run dev
```

Backend listens on `http://localhost:4000` by default.

## API

All endpoints are under `/api`:

- `GET /api/health`
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:id`
- `GET /api/unlocks`
- `POST /api/unlocks`
- `POST /api/payments/unlock` (x402 entrypoint)

## x402 (production)

To enable real payments:

1. Copy `.env.example` → `.env` (or set env vars in your hosting)
2. Set:
   - `APP_URL` to your **public backend URL** (not frontend)
   - `TREASURY_WALLET_ADDRESS` to your Solana treasury wallet
   - optionally `PAYAI_API_KEY_ID` / `PAYAI_API_KEY_SECRET`

When `TREASURY_WALLET_ADDRESS` is set, the backend will return **HTTP 402** from `POST /api/payments/unlock` until a valid payment header is provided.


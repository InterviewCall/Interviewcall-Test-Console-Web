# InterviewCall console

Staff console for the entrance-test system. Next.js (frontend only): every request goes to the NestJS API.

## Run it

```bash
npm install
cp .env.example .env.local     # set API_ORIGIN if the API isn't on :4000
npm run dev                    # http://localhost:3000
```

The API must allow this origin: in the backend `.env`, `ALLOWED_ORIGINS` includes `http://localhost:3000`.

## How it talks to the API

- The browser calls `/api/v1/...` on this origin; `next.config.ts` rewrites it to `API_ORIGIN`. The httpOnly session cookie therefore stays first-party and no CORS is needed. Behind a proxy, set the backend's `TRUST_PROXY_HOPS=1`.
- `src/proxy.ts` sends visitors without a session cookie to `/login`. It is only a convenience; the API is what enforces access.
- API types are generated from the backend's OpenAPI document. With the API running: `npm run api:types`.

## Layout

- `src/app` routes: `(auth)` login and change-password, `(app)` staff and account
- `src/features/<name>` api hooks, Zod schemas and screens for one feature
- `src/components/ui` design-system pieces; `src/lib` api client, query client, form helpers

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`, `api:types`

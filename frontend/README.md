# NOVAMED — Frontend

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS.

See the main [README](../README.md) for features, architecture and the full setup.

## Run

```bash
npm install
# create .env.local (see env.local.example):
# API_URL="http://localhost:5196/api"
npm run dev
```

The backend must be running. Staff log in at `/login` with an account created by an admin
(the first admin comes from the backend's `SeedAdmin` settings).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |

## Notes

- `API_URL` is a server-only variable: the browser never talks to the API.
- Images in `public/` are placeholders; NovaMed is a fictional clinic group.

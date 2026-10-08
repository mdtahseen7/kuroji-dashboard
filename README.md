# kuroji-dashboard

Admin dashboard for the self-hosted [kuroji-api](https://github.com/mdtahseen7/kuroji-api) (anime metadata API).

- **DB status** — queried live from Neon Postgres: database size, row counts per table, indexer progress.
- **Live status** — pings the kuroji API and merges `/admin/stats` (Redis, VPS, indexer) when reachable. If the VPS is mid-renewal, the DB section still renders and the API section shows offline gracefully.
- **Actions** — start/stop the indexer, queue a single-anime update. All forwarded server-side with the admin key; the key never reaches the browser.

## Env vars

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled Postgres connection string |
| `KUROJI_API_URL` | kuroji API base URL — update this if the VPS IP changes after a renewal |
| `ADMIN_KEY` | must match `ADMIN_KEY` in the kuroji API's `.env` |
| `DASHBOARD_PASSWORD` | password gate for this dashboard |

## Develop

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

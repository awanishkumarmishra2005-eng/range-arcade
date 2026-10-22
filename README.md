# Range Arcade

Two games (Enemy Assault and Dart Pro) plus a private visit counter.

## Files
- `index.html`: the games. Sends one visit ping on load.
- `admin.html`: visit stats page, protected by an admin key.
- `api/hit.js`: counts a visit (serverless function).
- `api/stats.js`: returns totals to the admin page (requires the key).

## Setup for the visit counter (about 15 minutes)

1. Create a free Redis database at upstash.com. Copy the **REST URL** and **REST Token**.
2. Generate a long admin key. In PowerShell:
   `[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")`
3. In Vercel, open the project, then **Settings → Environment Variables**, and add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `ADMIN_KEY`
4. Redeploy (**Deployments → Redeploy**).
5. Open `/admin.html`, enter the admin key, and check the total.

Notes:
- The counter only works on Vercel. `python -m http.server` does not run `api/` functions, so the game still runs locally but nothing is counted.
- Stored data is daily totals only. No IP addresses, cookies or names.

## Limits
- It counts page loads, not unique people. Reloads and bots are counted.
- Dates use UTC, so a visit late at night in India may appear on the previous day.
- The admin page uses one shared key. Keep it secret and rotate it if it leaks.
- Upstash and Vercel free tiers have usage limits. Check them before you share the link widely.

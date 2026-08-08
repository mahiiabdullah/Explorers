# Poridhi VM deployment runbook

Use this on the Poridhi VM after you SSH in. The compose file is wired
for these three LB endpoints (already created in your screenshot):

| Service  | VM port | LB hostname                                              |
|----------|---------|----------------------------------------------------------|
| Frontend | 3001    | `6a0b1d00950c78444441b4fb_0f8ad04d.lib.poridhi.io`       |
| Backend  | 5001    | `6a0b1d00950c78444441b4fb_ba1b8620.lib.poridhi.io`       |
| Gateway  | 9001    | `6a0b1d00950c78444441b4fb_89094519.lib.poridhi.io`       |

---

## 1. Get the project onto the VM

Option A — git:
```bash
git clone <your-repo-url> cinema
cd cinema
```

Option B — copy from your laptop:
```bash
# On your laptop (PowerShell, from D:\Explorer)
scp -r D:\Explorer poridhi@<VM_IP>:~/cinema

# Then SSH in
ssh poridhi@<VM_IP>
cd ~/cinema
```

---

## 2. Pull + build + start

```bash
docker compose pull gateway
docker compose build
docker compose up -d
```

---

## 3. Watch it come up

```bash
docker compose ps
# Wait until backend, gateway, frontend show "(healthy)"
# (postgres + redis show "(healthy)" too)
```

If a service won't go healthy, tail its logs:
```bash
docker compose logs -f --tail=100 <service-name>
```

---

## 4. Smoke tests (from inside the VM)

These hit the containers directly — should always work:

```bash
# Backend health (Hello World)
curl http://localhost:5001/

# Gateway root ({"service":"cinema-gateway"})
curl http://localhost:9001/

# Frontend HTML
curl -s http://localhost:3001/ | head -20
```

---

## 5. Smoke tests (through the LB hostnames)

Hit these from your **laptop browser**, not the VM:

```
https://6a0b1d00950c78444441b4fb_0f8ad04d.lib.poridhi.io   # frontend (use this)
https://6a0b1d00950c78444441b4fb_ba1b8620.lib.poridhi.io   # backend (api calls land here)
https://6a0b1d00950c78444441b4fb_89094519.lib.poridhi.io   # gateway (redirect target)
```

If the frontend loads but every API call fails with CORS, the LB
hostnames didn't get into the CORS allowlist. Re-check
`CinemaTicket-backend/src/app.ts` — `FRONTEND_URL` env var should be
the frontend LB hostname. Same for `NEXT_PUBLIC_*` build args.

---

## 6. End-to-end booking

1. Open the frontend LB URL in your browser.
2. Sign up with a new email + password.
3. Pick a movie → pick a showtime.
4. Hold 2 seats.
5. Click Pay → you'll be redirected to the **gateway** LB hostname.
6. Click "Confirm" on the gateway's redirect page → you'll bounce back to
   `/booking/<id>/confirmed` with status `SUCCEEDED`.

If step 5 doesn't redirect, the gateway's `GATEWAY_PUBLIC_URL` env var
is wrong (should be the gateway LB hostname, not `localhost:9000`).

If step 6 hangs, the webhook from the gateway can't reach the backend.
Check `docker compose logs backend` for `/webhooks/payment` hits and
confirm `BACKEND_URL=http://backend:5000` in compose (NOT the LB URL —
the gateway POSTs from inside Docker, where `backend` resolves via DNS).

---

## 7. Tear down

```bash
docker compose down         # stop, keep volumes
docker compose down -v      # stop AND wipe DB
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Frontend loads but API calls 404 / CORS error | `NEXT_PUBLIC_API_URL` build arg not set, or CORS allowlist missing the LB hostname. Rebuild frontend: `docker compose build --no-cache frontend`. |
| Backend container exits immediately | Check `docker compose logs backend` — usually missing `DATABASE_URL` or Postgres not ready. |
| Gateway healthcheck fails | The pulled image may need `wget` baked in. Run `docker exec -it <gw> sh` and `which wget`. |
| Webhook never fires after Pay | `BACKEND_URL` is the LB URL instead of `http://backend:5000`. Gateway can't reach the LB from inside Docker. |
| `prisma migrate deploy` hangs | Postgres not ready. `docker compose logs postgres` should show `database system is ready to accept connections`. |
| Frontend shows "Could not hold seats" | `useAuthStore` not hydrated; user not signed in. Check `auth` module + `localStorage.getItem('cinema-auth')`. |
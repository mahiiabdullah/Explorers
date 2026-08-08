# CinemaSeat — Dockerized booking platform

End-to-end cinema seat-booking platform. Three services + Postgres + Redis,
booted with a single `docker compose up`.

## Stack

| Service  | Tech                                | Port | Notes                                          |
|----------|-------------------------------------|------|------------------------------------------------|
| frontend | Next.js 14 (standalone)             | 3000 | TypeScript, Tailwind, Zustand, RHF             |
| backend  | Express 5 + Prisma 7                | 5000 | TypeScript strict, JWT auth, scrypt            |
| gateway  | Mock payment gateway                | 9000 | Pulled from `asifmahmoud414/mock-gateway`      |
| postgres | Postgres 16                         | 5432 | Internal only                                  |
| redis    | Redis 7                             | 6379 | Cache; backend tolerates being down            |

## Repo layout

```
.
├── cinema-app/            # Next.js frontend
├── CinemaTicket-backend/  # Express + Prisma API
├── cinema-gateway/        # Mock gateway source (not built — pulled from DockerHub)
├── Structure/             # Design docs (entities, architecture, API contract, schema)
├── docker-compose.yml     # 5-service stack with healthchecks
├── .env.example           # Single source of truth for env defaults
└── PORIDHI_DEPLOY.md      # Runbook for the Poridhi VM LB deployment
```

## Local run

```bash
docker compose pull gateway
docker compose build
docker compose up -d
```

Open http://localhost:3006 (the compose publishes the frontend on 3006 → 3000).

## Poridhi VM run

See [`PORIDHI_DEPLOY.md`](./PORIDHI_DEPLOY.md). TL;DR:

```bash
ssh poridhi@<VM_IP>
cd ~ && git clone https://github.com/mahiiabdullah/Explorers.git cinema
cd cinema
docker compose pull gateway
docker compose build
docker compose up -d
```

The compose file already wires the Poridhi LB URLs as `NEXT_PUBLIC_*` build args
and as `FRONTEND_URL` / `GATEWAY_PUBLIC_URL` env vars, so the stack boots behind
the LB without further edits.

## API contract

See `Structure/03-api-contract.md` for the full request/response shapes. The
backend conforms to `CinemaSeat_Problem_Statement.pdf` §A — every response
follows `{ success, message, data?, errorDetails? }` and every request is
versioned under `/api/v1`.

## References

- `CinemaSeat_Problem_Statement.pdf` — task brief
- `Zero_to_Production_Rulebook.pdf` — engineering standards (logging, error
  handling, security, deployment, testing)
- `CinemaSeat_Gateway_Reference.pdf` — mock gateway contract
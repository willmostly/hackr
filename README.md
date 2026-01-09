# hackr

A "Tinder for Hackathons" app where engineers swipe on project ideas, team leads rank interested engineers, and an algorithm optimally assigns everyone to teams.

## Features

- **Magic link authentication** - passwordless login via email
- **Tinder-style swiping** - engineers and team leads swipe on ideas to show interest
- **Team lead ranking** - team leads rank interested engineers by preference
- **Hungarian algorithm matching** - optimal team assignment minimizing total preference score
- **Phase-based flow** - registration → swiping → ranking → matching → results

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Monorepo**: npm workspaces

## Development Setup

### Prerequisites

- Node.js 18+
- Docker

### 1. Start PostgreSQL

```bash
docker run -d \
  --name hackr-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres
```

### 2. Create the database

```bash
docker exec hackr-postgres createdb -U postgres hackr
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run database migrations

```bash
npm run db:migrate -w @hackr/server
```

### 5. (Optional) Seed test data

```bash
npm run db:seed -w @hackr/server
```

This creates test users:
- **Team leads**: `lead1@test.com`, `lead2@test.com`
- **Engineers**: `fe1@test.com`, `fe2@test.com`, `be1@test.com`, `be2@test.com`, `ml1@test.com`, `infra1@test.com`
- **Admin**: `admin@test.com`

### 6. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Usage

1. **Login** - Enter any email to receive a magic link (shown directly in dev mode)
2. **Register** - Choose your role (Engineer or Team Lead) and specialty
3. **Team leads** create project ideas with role requirements
4. **Admin** advances phases via the admin panel (`/admin`)
5. **Everyone** swipes on ideas during the swiping phase
6. **Team leads** rank interested engineers during the ranking phase
7. **Admin** runs the matching algorithm
8. **Everyone** views their team assignments

## Project Structure

```
hackr/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   ├── server/          # Express API
│   │   └── src/
│   │       ├── db/          # Schema, migrations, seeds
│   │       ├── middleware/  # Auth middleware
│   │       ├── routes/      # API endpoints
│   │       └── services/    # Business logic
│   └── web/             # React frontend
│       └── src/
│           ├── api/         # API client
│           ├── components/  # UI components
│           ├── hooks/       # React hooks
│           └── pages/       # Route pages
└── package.json
```

## Environment Variables

The server uses these defaults (override with environment variables):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `hackr` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for magic links |

## Manual Phase Control

Reset or change phases directly in the database:

```bash
# Set to registration phase
docker exec hackr-postgres psql -U postgres -d hackr -c "UPDATE app_settings SET value = 'registration' WHERE key = 'phase';"

# Available phases: registration, swiping, ranking, matching, complete
```

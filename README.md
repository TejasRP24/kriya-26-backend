# GHCC KRIYA 26 — Codes of the Caribbean Backend

Multi-round hackathon platform backend with code execution, scoring, and leaderboard.

## Tech Stack
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (admin + team)
- **Code Execution**: Judge0 API (self-hosted)
- **Languages**: C, Java, Python

## Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .envexample.txt .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default: 3000) |
| `MAIL_ID` | Gmail address for OTP |
| `MAIL_PASSWORD` | Gmail app password |
| `JWT_SECRET` | Secret key for JWT signing |
| `JUDGE0_API_URL` | Judge0 API endpoint |

## API Endpoints

All routes are prefixed with `/kriyabe`.

### Admin — `/api/admin`
- `POST /login` / `POST /logout` — Admin auth
- `POST|PUT|DELETE /algorithmcard` — Algorithm card CRUD
- `POST|GET|PUT|DELETE /round1/questions` — Round 1 Q CRUD
- `POST|GET|PUT|DELETE /round2/questions` — Round 2 Q CRUD
- `GET /leaderboard` / `POST /leaderboard/adjust` — Leaderboard
- `GET|POST|PUT|DELETE /teams` — Team management

### Teams — `/api/teams`
- `POST /login` / `POST /logout` — Team auth (via kriyaId)
- `POST /choose-shipconfig` — Select ship (WARSHIP/MERCHANT/GHOST)
- `POST /round1answers` / `POST /round2answers` — Submit answers
- `POST /select-action-cards` / `POST /use-action-card` — Action cards
- `GET /profile/:id` / `GET /progress/:id` — Team info

### Round 1 & 2 — `/api/round1` & `/api/round2`
- `POST|GET|PUT|DELETE /questions` — Question CRUD

### Submissions — `/api/round1/submissions` & `/api/round2/submissions`
- `POST /` — Submit (Round 2 includes code execution pipeline)
- `GET /team/:id` / `GET /question/:id` or `/problem/:id`
- `PUT|DELETE /:id`

### Algorithms — `/api/algorithms`
- Full CRUD for algorithm cards

### Action Cards — `/api/action-cards`
- `GET /` / `GET /:id` / `DELETE /:id`

### Leaderboard — `/api/leaderboard`
- `GET /` / `GET /teams/:id` / `POST /adjust`

## Ship Configurations

| Ship | Multiplier | Round 2 Lives | Rule |
|------|-----------|--------------|------|
| WARSHIP | 1.30x | 2 | High risk, high reward |
| MERCHANT | 1.00x | 3 | Baseline |
| GHOST | 0.80x | 5 | Low risk, more attempts |

## Round 2 Submission Flow

1. Team submits code → validated against assigned problem
2. Code executed via Judge0 against all test cases
3. **Compilation error** → lose a life
4. **Wrong answer** → lose a life
5. **All pass** → SOLVED, score calculated with ship multiplier, leaderboard updated
6. **Lives = 0** → SUNK, lives reset, team can retry

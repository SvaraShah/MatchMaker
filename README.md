# Two-Sided Matchmaker CRM & AI Matrimony Platform

A production-ready, full-stack **Two-Sided Marriage-Bureau Platform** built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS v4**, and server-side **OpenAI SDK integration**.

The platform provides two role-based experiences:
1. **ADMIN / MATCHMAKER**: Professional CRM workspace for managing client portfolios, running AI compatibility analysis, reviewing activity timelines, and interacting with the AI Matchmaker Agent.
2. **REGISTERED USER**: Premium matrimonial experience for discovering curated opposite-gender matches, saving shortlists, expressing interests, and updating partner preferences.

---

## 🌟 Key Capabilities

- **Two Role System**: `ADMIN` (Matchmaker) and `USER` (Matrimonial Client) with server-side role authorization and cookie-based JWT sessions.
- **Pure PostgreSQL & Prisma ORM**: Complete database schemas (`User`, `Customer`, `CustomerPreference`, `Match`, `MatchRequest`, `Shortlist`, `Note`, `TimelineEvent`, `AuditLog`).
- **Server-Side Heterosexual Gender Filtering**: Female clients receive Male candidate profiles; Male clients receive Female candidate profiles on all user-facing match discovery feeds.
- **8-Dimension Deterministic Matching Engine**: Primary compatibility scoring system evaluating Age, Education, Career/Income, Religion/Caste, Family Values, Lifestyle Habits, Location/Relocation, and Children preferences out of 100%.
- **Server-Side OpenAI Integration**: Privacy-sanitized AI introduction pitches and match explanations generated using the official `openai` SDK (`gpt-4o-mini`) with controlled fallbacks.
- **User Privacy Serializers**: Normal users never receive sensitive phone numbers, email addresses, password hashes, or internal CRM notes.
- **Dynamic Greetings**: Time-of-day greetings ("Good morning", "Good afternoon", "Good evening") personalized to the user's name/role.
- **Match / Shortlist / Interest Semantics**:
  - `Match`: System-generated compatibility pairing with deterministic score & AI pitch.
  - `Shortlist`: Private user bookmark of candidate profiles.
  - `MatchRequest`: Active expression of interest with Accept/Decline status tracking.

---

## 🏗️ Architecture Overview

```
                          TWO-SIDED MARRIAGE-BUREAU PLATFORM
                   ┌───────────────────────┬───────────────────────┐
                   │  ADMIN / MATCHMAKER   │  REGISTERED USER      │
                   ├───────────────────────┼───────────────────────┤
                   │ /admin Routes         │ /app Routes           │
                   │  - CRM Dashboard      │  - Matrimonial UX     │
                   │  - Client Management  │  - Discover Matches   │
                   │  - AI Matchmaker Agent│  - Requests & Interests│
                   │  - Audit Logs & Stats │  - My Shortlist       │
                   │                       │  - Profile & Prefs    │
                   └───────────────────────┴───────────────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │ Shared Backend APIs │
                                │ - Role Auth & AuthZ │
                                │ - Gender Filter     │
                                │ - Deterministic     │
                                │   Matching Engine   │
                                │ - OpenAI Service    │
                                │ - Prisma & Postgres │
                                └─────────────────────┘
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

```env
# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/matchmaker?schema=public"

# Secret key for JWT session cookies
AUTH_SECRET="your_production_secret_key_here"

# OpenAI API Key (Server-Side Only)
OPENAI_API_KEY="sk-..."
```

> [!CAUTION]
> Never expose `OPENAI_API_KEY` or `DATABASE_URL` to the client. Keep them server-side.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client & Migrate Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Database
Seeds 1 Admin account (`matchmaker@tdc.com` / `password123`) and ~130 matrimonial User profiles from `src/data/db.json`:
```bash
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Development Credentials

| Role | Email | Password | Target Route |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `matchmaker@tdc.com` | `password123` | `/admin` |
| **USER** | `ruksana.trivedi@example.com` | `password123` | `/app` |

---

## 🛠️ API Route Summary

### Authentication APIs
- `POST /api/auth/login` — Login user or admin, sets HTTP-only session cookie.
- `POST /api/auth/logout` — Clear session cookie.
- `GET /api/auth/me` — Verify authenticated session user.

### User APIs (`/api/me/*`)
- `GET /api/me/profile` & `PATCH /api/me/profile` — Get and update personal profile.
- `GET /api/me/preferences` & `PATCH /api/me/preferences` — Get and update partner preferences.
- `GET /api/me/matches` — Discover candidate profiles (opposite gender filtered).
- `POST /api/me/shortlist` & `DELETE /api/me/shortlist/[id]` & `GET /api/me/shortlist` — Save/manage shortlist.
- `POST /api/me/interests` — Send interest request to a candidate.
- `GET /api/me/requests` & `PATCH /api/me/requests/[id]` — View, accept, or decline received interests.

### Admin APIs (`/api/admin/*`)
- `GET /api/admin/analytics` — Real-time CRM platform metrics.
- `POST /api/admin/agent/chat` — Admin AI Matchmaker Agent chat endpoint.
- `GET /api/customers` & `GET /api/customers/[id]` — Admin client registry views.
- `POST /api/customers/[id]/notes` — Log client call notes & update journey status.
- `POST /api/matches/action` — Record match proposals and update customer timeline.
- `POST /api/matches/analyze` — Run deterministic score + OpenAI pitch generation + DB save.

---

## 🛡️ Security Features

1. **Server-Side Authorization**: Enforced on API routes with `requireAdmin` and `requireUser`.
2. **Password Hashing**: Bcrypt password hashing (`10` salt rounds).
3. **HTTP-Only Cookies**: Secure, `SameSite=Lax` session management.
4. **Privacy Sanitization**: User views exclude phone numbers, email addresses, internal notes, and audit logs.
5. **SQL Injection Protection**: Automated via Prisma ORM parameterized queries.

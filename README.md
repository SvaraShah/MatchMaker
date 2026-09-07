# MatchMaker — Premium Matrimonial Matchmaker Workspace

A high-end, production-ready internal workspace designed specifically for professional matrimonial matchmakers and marriage bureau operators. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

The application features a warm, sophisticated matrimonial visual direction (ivory `#FAF9F6` canvas, quiet subtle rose accents, serif typography, and premium profile cards) powered by a **12-dimension deterministic matching engine** with hard gender eligibility filtering and rich matrimonial profile datasets.

---

## 🌟 Key Product Capabilities

- **Quiet Light Sidebar & Workspace Layout**: Designed around matchmaker workflow efficiency. Includes brand heart logo (*MatchMaker — People • Profiles • Possibilities*), quiet rose navigation highlights, global search header, and footer quote (*"Meaningful Matches, Brighter Futures."*).
- **Deterministic 12-Dimension Match Engine**:
  - **Hard Gender Eligibility Pre-Filter**: Female clients match strictly with Male candidates; Male clients match strictly with Female candidates. Invalid gender pairings are 100% excluded.
  - **Realistic Score Distribution**:
    - `85–95%`: Excellent Match
    - `70–84%`: Good Match
    - `55–69%`: Moderate Match
    - `Below 55%`: Low Compatibility
  - **Comprehensive Category Breakdown**: Evaluates Age, Location, Religion, Jain Preference & Sect (Shwetambar / Digambar / Any), Caste & Sub-caste, Occupation, Education, Income, Height, Marital Status, Diet & Lifestyle, and Family Values.
- **Admin Command Center (`/admin`)**: Time-based greeting, 8 KPI stat cards (Total Clients, Active Profiles, New This Week, Matches Suggested, Pending Interests, Connections, Follow-ups Due, High Compatibility), Today's Follow-ups table, Recent Activity feed, High Compatibility profile cards, and Analytics visuals.
- **Client Directory 2.0 (`/admin/clients`)**: Search bar, deep multi-filters (Gender, Religion, Jain Sect, City, Marital Status, Journey Stage), and toggleable Grid & Data Table views.
- **Client 360° Dossier (`/admin/clients/[id]`)**: Prominent **"Looking For" Partner Preferences** banner showcasing 12 criteria side-by-side, profile completeness %, categorized profile tabs (About, Preferences, Career, Family, Timeline, Matchmaker Notes), and quick action bar.
- **Candidate Matching & Side-by-Side Comparison (`/admin/matches?client=[id]`)**: Candidate recommendations sorted by score, expandable *"Why this match?"* reasoning, and an interactive side-by-side attribute alignment comparison modal (Client VS Candidate).
- **9-Stage Kanban Matchmaking Pipeline (`/admin/pipeline`)**: Page-level scroll containment (browser window never horizontally overflows), controlled column horizontal scroll wrapper, structured matrimonial cards, clear button hierarchy (*Find Matches* primary vs *View Dossier* secondary), and polished empty states.
- **Task Follow-ups Hub (`/admin/follow-ups`)**: Categorized task manager (Today, Overdue, Upcoming, Completed) with priority badges (High, Medium, Low) and quick status toggles.
- **Executive Analytics (`/admin/analytics`)**: Conversion funnel, compatibility score distribution, client demographics by city, matches by religion/sect, and client growth trends.

---

## 🏗️ Matchmaker Workflow Core

```
                         PROFESSIONAL MATCHMAKER WORKFLOW
       ┌─────────────────┐
       │   CLIENTS       │ ──► Search & multi-filter client directory
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  CLIENT 360     │ ──► Review 12-dimension "Looking For" Partner Preferences
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  FIND MATCHES   │ ──► Execute deterministic engine with hard gender pre-filter
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ COMPATIBILITY   │ ──► Transparent score breakdown & "Why this match?" reasoning
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  SIDE-BY-SIDE   │ ──► Compare Client VS Candidate attribute matrix
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ SUGGEST & TRACK │ ──► Shortlist candidate, suggest match, log follow-up, track pipeline
       └─────────────────┘
```

---

## 💻 Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Typography**: Playfair Display / Cormorant Garamond (Serif Headings) + Plus Jakarta Sans (UI / Controls)
- **Data Engine**: Deterministic Matcher (`src/lib/deterministicMatcher.ts`) & Hardcoded Matrimonial Dataset (`src/lib/mockData.ts`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application opens directly into `/admin` (MatchMaker Admin Workspace).

---

## 🔍 Verification & Build Commands

```bash
# Check TypeScript compilation (0 errors)
npx tsc --noEmit

# Run Next.js production build verification
npm run build
```

---

## 📁 Key Project Routes

| Route | Description |
| :--- | :--- |
| `/admin` | Admin Command Center Dashboard |
| `/admin/clients` | Client Directory 2.0 with search & deep multi-filters |
| `/admin/clients/[id]` | Client 360° Dossier & "Looking For" Partner Preferences |
| `/admin/matches?client=[id]` | Candidate Matching Engine & Side-by-Side Comparison modal |
| `/admin/pipeline` | 9-Stage Kanban Matchmaking Pipeline |
| `/admin/follow-ups` | Task Follow-ups Hub |
| `/admin/analytics` | Matchmaking Intelligence & Analytics |
| `/admin/messages` | Matchmaker Direct Client Communication |

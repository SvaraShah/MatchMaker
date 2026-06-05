# Matchmaker CRM & AI Matchmaking Engine

An internal CRM-style dashboard designed for professional matchmaking experts to manage clients, track their journey, log notes, evaluate compatibility, and share hand-picked pairings powered by an advanced rule-based matching engine and OpenAI completions.

---

## Technical Stack
- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Database**: File-based Structured JSON (`src/data/db.json`)
- **Seeder**: Faker JS (`@faker-js/faker`) via TSX
- **AI**: OpenAI Chat Completions (fallback-resilient native fetch implementation)
- **Animations**: Canvas Confetti

---

## Architectural Highlights

### 1. Compatibility Scoring Engine (`src/lib/matchingEngine.ts`)
Prospects are ranked with a score from `0` to `100`, evaluated across 8 distinct weights:
1. **Age (15%)**: Assesses alignment based on preferred age bounds.
   - *Male Client*: Prefers younger matches (traditional preference heuristic).
   - *Female Client*: Prefers older/same-age matches (long-term stability indicator).
2. **Education (15%)**: Weighting of degrees, prioritizing dual postgraduate degree alignments and field compatibility (e.g., both medical/tech).
3. **Career & Stability (15%)**: Evaluates income bracket differences. Focuses on stable income compatibility for female clients.
4. **Religion & Caste (15%)**: Matches denomination preferences and caste filters.
5. **Family Values (10%)**: Checks structure preferences (Joint vs. Nuclear family setups).
6. **Lifestyle Habits (10%)**: Score weights for diet overlap (Vegetarian strictness), smoking, and drinking preferences.
7. **Relocation & Location (10%)**: Values same-city residential stability or mutual relocation flexibilities.
8. **Children Preference (10%)**: Aligns goals on having kids (Yes/No/Open).

*Traditional metrics like height are factored into male/female scores (preferring shorter female partners for males and taller male partners for females).*

### 2. High-Fidelity Local AI Fallback (`src/lib/openai.ts`)
The server-side endpoint makes direct fetch requests to OpenAI completions (`gpt-4o-mini`).
- **If the `OPENAI_API_KEY` is missing or invalid**, the engine gracefully falls back to an offline rule-based content compiler. This analyzer maps profile fields to generate authentic, personalized matchmaking pitches and introductions without degrading application response times.

### 3. Native Print Styles for PDF Exports (`src/app/globals.css`)
Clicking the **"Export Match Report"** button triggers the browser's printing panel. Tailored `@media print` directives hide sidebars, filter headers, and action icons, formatting the client profile dossier into a clean document suitable for PDF distribution.

---

## Directory Structure
```
MatchMaker/
├── scripts/
│   └── seed.ts                  # Seeding script for 130 authentic Indian profiles
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/            # Cookie-based authentication routes (login/logout)
│   │   │   ├── customers/       # CRM listing and single client endpoints
│   │   │   └── matches/         # Log matchmaker decisions (Save, Reject, Send)
│   │   ├── customer/[id]/       # Profile Dossier, Timeline Logs, and Recommendations
│   │   ├── dashboard/           # Main CRM grid, search, and filters
│   │   ├── login/               # Sign-in UI with autofill demo credentials
│   │   ├── globals.css          # Color tokens, scrollbars, print directives
│   │   ├── layout.tsx           # Anti-flash theme check script
│   │   └── page.tsx             # Redirect landing page
│   ├── data/
│   │   └── db.json              # Local persistent database file
│   ├── lib/
│   │   ├── db.ts                # Database access layers
│   │   ├── matchingEngine.ts    # Scoring rules
│   │   └── openai.ts            # OpenAI chat completions and local fallback
│   ├── types/
│   │   └── matchmaker.ts        # Shared TS typings
│   └── middleware.ts            # Route protection
├── package.json
└── tsconfig.json
```

---

## Local Development & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_actual_openai_key
```
*(If left blank or omitted, the application will automatically engage the high-fidelity mock AI generator for matches).*

### 3. Seed the Database
Generate 130 authentic Indian profiles categorized across cities, backgrounds, and occupations:
```bash
npx tsx scripts/seed.ts
```

### 4. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Demo Credentials
- **Email**: `matchmaker@tdc.com`
- **Password**: `password123`

---

## Build and Verification
To compile the application and verify layout structures:
```bash
npm run build
```

---

## Production Deployment to Vercel

This app compiles into a standard Next.js project and can be deployed to Vercel in a few steps:

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```
2. **Log in to Vercel**:
   ```bash
   vercel login
   ```
3. **Trigger Deployment**:
   Run the command from the root folder:
   ```bash
   vercel
   ```
   Follow the prompts to link the project.
4. **Configure Environment Variables**:
   In the Vercel Dashboard, go to **Settings > Environment Variables** and add `OPENAI_API_KEY` if using live AI features.
5. **Production Deploy**:
   ```bash
   vercel --prod
   ```

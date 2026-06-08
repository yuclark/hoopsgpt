# hoopsgpt 🏀

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq Cloud](https://img.shields.io/badge/Groq%20Cloud-F55036?style=for-the-badge)](https://groq.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logoColor=black)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon_Database-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)

A High-Velocity Live-Data AI Analytics Agent for NBA Statistics. Fully decoupled chatbot architecture streaming real-time statistics directly from official NBA servers, parsing game logs on the fly, comparing recent player trends to baseline totals, and generating premium sports-tape narrative deep dives.

---

## Core Architectural Highlights (Our Engineering Wins)

*   **Sanitization Layer (Zero-Crash Message Formatting):** Resolves structured Vercel AI SDK client schema mismatches against LLM provider schema expectations. Before passing message objects into `streamText`, a dedicated middleware maps incoming message structures, flattens client-side nested `parts` arrays into strict flat `content` strings, and sanitizes input vectors to eliminate prompt validation crashes.
*   **Live API Agent Architecture (Scraperless Fetching):** Transitioned completely past outdated local databases, static file archives, or fragile HTML web scrapers. The backend implements a dynamic, two-stage server-side agent that queries official NBA Stats API endpoints. First, it fuzzy-matches player names against the global directory `commonallplayers` to resolve person IDs, and then retrieves live metrics on demand using `playercareerstats` or `playergamelogs`.
*   **Firewall Bypass Engineering (Realistic Browser Emulation):** Bypasses Cloudflare blockades and strict rate-limiting policies enforced by the official NBA statistics endpoints. Every server-side fetch request is engineered with simulated browser headers, featuring a realistic `User-Agent`, a matching `Origin` header, and a `Referer` pointing directly to `https://www.nba.com/` to guarantee uninterrupted data streaming.
*   **Cascading Season Fallbacks (Robust Inactive-Player Handling):** Designed a recursive cascading fallback engine when fetching player game logs. If the current season (`2025-26`) returns an empty set due to injury, off-season windows, or inactive status, the resolver automatically falls back to search historical data windows (`2024-25` and `2023-24`) sequentially, ensuring consistent dashboard population without throwing empty dataset exceptions.
*   **Server-Side Mathematical Analytics (Dynamic Box Score Computations):** Calculates advanced statistics over a custom slice limit on the fly:
    *   **True Shooting Percentage (TS%):** Aggregates total points, field goal attempts, and free throw attempts over the dynamic range, calculating true shooting efficiency using the standard formula:
        $$\text{TS\%} = \frac{\text{Total Points}}{2 \times (\text{Total FGA} + 0.44 \times \text{Total FTA})}$$
    *   **Minute Parsing:** Dynamically converts minute parameters from both floats and messy `"MM:SS"` string notations into clean decimal values to prevent average calculation errors.
    -   **Baseline Delta Variance:** Evaluates recent averages against the player's season-wide averages, triggering a server-side `HOT STREAK ALERT` when recent volume or efficiency exceeds the baseline by $\ge 2.0$ PPG or $\ge 3.0\%$ TS%.
*   **Epistemic Anti-Hallucination Guardrails:** Anchors the LLM to strictly factual responses. The system prompt configures strict execution parameters that forbid the model from predicting, estimating, or inventing any player metrics. If a data point is not explicitly returned in the pre-computed tool payload, it is treated as non-existent, forcing the model to rely strictly on official data.
*   **Three-Step Conversational Response Lifecycle:** Provides a clean, organic user experience using a structured sandwich layout:
    1.  **Step 1 (Pre-Tool Banter):** The model streams a high-energy, basketball-savvy conversational introduction (e.g. *"Let's pull up the tape on Lauri Markkanen real quick..."*) before executing the tool.
    2.  **Step 2 (Visual Mapping):** The model invokes the `queryPlayerStats` tool which streams structured JSON back, mapping the visual statistical dashboard dynamically to the unique tool call ID.
    3.  **Step 3 (Post-Tool Narrative):** Resumes streaming directly underneath the visual cards to generate a sharp, analytical paragraph under 150 words focusing on shot profiles, spacing value, and delta comparisons.

---

## Repository Directory Tree

```text
hoopsgpt/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # The central engine: tool parameters, prompt guardrails, and streaming setup
│   ├── layout.tsx
│   └── page.tsx                 # Decoupled UI view rendering interactive dashboard components and tables
├── src/
│   └── db/
│       ├── index.ts             # Connection client config for Neon serverless PostgreSQL
│       ├── schema.ts            # Drizzle table schemas mapping player statistics relationships
│       └── seed.ts              # Seeding script populating historical player databases
├── drizzle.config.ts            # Drizzle Kit configuration node
├── package.json
├── tsconfig.json
└── README.md
```

---

## Environment Configuration Setup

To run the application, create a `.env.local` file in the root directory and define the following variables:

```env
# Groq API Key for Llama-3.3-70b-versatile streaming
GROQ_API_KEY=gsk_your_groq_api_key_here

# Neon Postgres Database Connection URI
DATABASE_URL=postgresql://neondb_owner:password@ep-host.aws.neon.tech/neondatabase?sslmode=require
```

---

## Quick Start Guide

### 1. Install Dependencies
Run the installation script in the root directory:
```bash
npm install
```

### 2. Seed the Database
Seed the PostgreSQL instance with player baseline statistics:
```bash
npm run db:seed
```

### 3. Run Development Server
Boot up the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the interactive dashboard.

### 4. Compile Check
Run the strict TypeScript type check sequence:
```bash
npx tsc --noEmit
```
This guarantees there are no type safety violations or compilation mismatches in the application.

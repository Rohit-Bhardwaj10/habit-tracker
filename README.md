# Habit Tracker

A beautiful, performant, and reliable habit tracking application built with Next.js, Node.js, and PostgreSQL (Neon Serverless).

## Features

- **Timezone-Aware Architecture**: Built from the ground up to respect the user's local timezone. A check-in in Tokyo is tracked perfectly relative to a user in New York.
- **Cozy Pastel Antigravity Design**: A weightless, spatial UI featuring subtle glassmorphism, 3D transforms, and GSAP animations.
- **Robust Authentication**: JWT-based auth flow with local storage and timezone-aware user profiles.
- **Resilient Backend**: Graceful error handling and retry mechanisms built into the API client to handle database cold starts.
- **Detailed Analytics**: View your current streak, longest streak, and total check-ins.
- **Contribution History**: GitHub-style heatmap calendar for tracking your habit consistency over time.
- **Backfill Check-ins**: Missed a day? You can backfill past check-ins directly from the history calendar.

## How We Modeled Local Days & Timezones

Handling timezones and streaks across global users is the hardest part of habit tracking. A streak is measured strictly in the user's **own local days**, not elapsed hours.

### The Problem
If a user in `Asia/Kolkata` checks in on Monday at 11 PM and Tuesday at 1 AM, only 2 hours have passed, but it counts as two distinct local days, keeping the streak alive. If we just saved the `Date.now()` without context, interpreting "did they check in today?" becomes an incredibly complex and bug-prone moving target.

### The Solution: `localDay` Strings

1. **User Timezone Persistence**: When a user signs up, their local IANA timezone string (e.g. `Asia/Kolkata`) is saved to their profile on the database.
2. **Dual-Column Check-ins**: 
   - A Check-in model stores the exact UTC timestamp of the action (`checkedAt`).
   - More importantly, it stores the calculated `localDay` (e.g., `"2026-03-10"`). 
   - The database enforces a `@@unique([habitId, localDay])` constraint. This guarantees a user can NEVER have two check-ins for the same habit on the same local calendar day, resolving any potential race conditions.
3. **Pure, Isolated Streak Computation**:
   - The streak calculation engine (`backend/src/utils/streaks.ts`) is completely decoupled from the system clock and the database.
   - It takes an array of `localDay` strings, a `todayStr`, and a `yesterdayStr` and computes the streaks purely mathematically. 
   - This makes the logic trivially testable (see `localDay.test.ts`) and completely bulletproof.
4. **Server-Authored Truth**:
   - The frontend makes **zero** decisions about whether a streak is alive.
   - The backend reads the array of `localDays`, generates the user's localized `todayStr` and `yesterdayStr` on the fly using Luxon, computes the streaks, and serves the final `currentStreak` and `longestStreak` numbers to the frontend.
   - Backfilling a past date? It just injects a new `localDay` string into the array. The server re-computes the math, seamlessly joining broken streaks without complex database triggers or background cron jobs.

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, Custom Glassmorphism
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Lucide React
- **Date Handling**: Luxon

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT, bcrypt

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or pnpm
- A Neon PostgreSQL database connection string

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on `.env.example`:
   ```
   PORT=4000
   DATABASE_URL="your-neon-postgres-connection-string"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:3000"
   ```
4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` directory:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:4000/api"
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Philosophy

The UI is built upon the **Antigravity** design language:
- **Spatial Depth**: Overlapping elements with backdrop blurs and subtle drop shadows.
- **Weightless Motion**: GSAP staggers and hover lifts (`translate-y`, `shadow` expansion).
- **Pastel Palette**: Warm off-whites, slates, roses, teals, and ambers for a calm and focused user experience.

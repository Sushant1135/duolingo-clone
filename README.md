# Duolingo Web App Clone

Fullstack SDE assignment implementation of a Duolingo-style learning app. The project recreates the core learning path, lesson loop, hearts, XP, streaks, quests, leaderboard, shop, and learner profile using Next.js, FastAPI, and SQLite.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite
- Audio: Web Audio API sound effects and browser Speech Synthesis

## Features

- Duolingo-style learning path with units, locked/unlocked skills, active lesson nodes, progress rings, crowns, and guidebook modals.
- Lesson player with five exercise types: multiple choice, word-bank translation, match pairs, fill in the blank, and type-the-answer.
- Immediate correct/incorrect feedback bar with answer explanations.
- Hearts system with heart loss, passive regeneration, refill via gems, and an out-of-hearts modal.
- Persistent learner progress for XP, streak, hearts, gems, completed lessons, skill unlocks, quests, and achievements.
- Seeded German course with two distinct sections (Foundations and Everyday Communication), three unique units per section, and unit-specific skills, lessons, exercises, vocabulary, and guidebooks.
- Profile, leaderboard, quests, shop, dark mode, sound controls, and evaluator/dev testing tools.

## Project Structure

```text
backend/
  main.py                 Compatibility entrypoint for `uvicorn main:app`
  app/
    main.py                FastAPI setup, database initialization, seeding
    core/database.py       SQLite engine, declarative base, and sessions
    models/
      entities.py          SQLAlchemy persistence models
      schemas.py           Pydantic request and response models
    features/
      courses/              Course API controller and course-content service
      lessons/              Lesson API controller and answer-evaluation service
      users/                Learner API controller and progress/quest service
      leaderboards/         League API controller
      shop/                 Store API controller and purchase service
    routes/api.py           API router registry
    services/seed_data.py   Seeded German course and learner data

frontend/
  src/app/                  Next.js App Router entrypoints and global styles
  src/features/
    learn/                  Path, section, lesson navigation MVC
    practice/               Practice session MVC
    profile/                Learner profile MVC
    leaderboards/           League MVC and league model
    quests/                 Daily and monthly quest MVC
    shop/                   Store MVC
    settings/               Preferences MVC and preference model
  src/models/               Shared API/domain types and course helpers
  src/services/             Shared typed API client and browser audio integration
  src/shared/
    controllers/             Shared theme state provider
    views/components/        Reusable UI and lesson components
```

The backend groups HTTP controllers and domain services by feature while keeping
the shared relational entities and Pydantic contracts centralized. Route
registration wires feature routers; controllers handle HTTP concerns and delegate
reusable domain operations to services. The frontend follows the same feature
boundary: each feature has its view and a custom-hook controller for state,
navigation, and user actions. Next.js-required route files in `src/app` remain
thin entrypoints. Cross-feature types, API transport, browser integrations, theme
state, and reusable UI are shared rather than duplicated.

## Database Schema

Core tables:

- `users`: default logged-in learner profile, streak, XP, gems, hearts, active course, league.
- `courses`: language courses.
- `units`: ordered course sections with guidebook content.
- `skills`: ordered learning path skills inside units.
- `lessons`: lesson records for each skill.
- `exercises`: JSON-backed exercise prompts, options, and solutions.
- `user_lesson_progress`: per-user lesson completions and scores.
- `user_skill_progress`: per-user skill unlock/completion state.
- `leaderboard_users`: seeded competitors plus synced current user.
- `quests`: daily quest progress and claim state.
- `user_daily_activity`: first-completion XP, lesson, high-score, and timed-learning totals by date.
- `monthly_quests`: monthly quest progress, reward claims, and earned badge history.
- `achievements`: profile achievement progress.

The SQLite database is created and seeded automatically when the backend starts.

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/users/me` | Active learner profile, hearts, streak, XP, gems |
| `PATCH` | `/api/users/me` | Update demo learner stats |
| `POST` | `/api/users/refill-hearts` | Refill hearts through gems, practice, or demo refill |
| `POST` | `/api/users/simulate-streak` | Simulate streak dates for testing |
| `POST` | `/api/users/reset-progress` | Reset learner progress to the start |
| `GET` | `/api/courses` | List available courses |
| `GET` | `/api/courses/{course_id}/tree` | Full unit/skill path with lock states |
| `GET` | `/api/courses/units/{unit_id}/guidebook` | Unit guidebook notes |
| `GET` | `/api/lessons/{lesson_id}` | Lesson detail with exercises |
| `POST` | `/api/lessons/exercises/{exercise_id}/submit` | Evaluate an exercise answer and update hearts |
| `POST` | `/api/lessons/{lesson_id}/complete` | Award XP/gems, update streak, unlock progress |
| `GET` | `/api/leaderboard` | League standings |
| `GET` | `/api/users/quests` | Daily quests, monthly quest status, and badge history |
| `POST` | `/api/users/quests/{quest_id}/claim` | Claim completed daily quest rewards |
| `POST` | `/api/users/quests/monthly/claim` | Claim the completed monthly quest reward |
| `GET` | `/api/shop` | Shop inventory |
| `POST` | `/api/shop/purchase` | Purchase mocked shop items |

## Local Setup

### 1. Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URL: `http://localhost:8000`

Swagger docs: `http://localhost:8000/docs`

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

To open the development app on a phone connected to the same Wi-Fi, use the computer's Wi-Fi IPv4 address instead of `localhost`, for example `http://192.168.1.25:3000`. The app's API client uses that same hostname for the backend. Allow Node.js and Python through Windows Firewall on private networks if prompted or if the phone cannot connect.

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd run dev
```

## Validation

```bash
cd backend
python -m compileall .

cd ../frontend
npm.cmd run lint
npm.cmd run build
```

## Evaluator Notes

- Authentication is simplified to a default learner with `user_id = 1`.
- Course content is intentionally small but fully database-backed and seeded.
- Real speech recognition and payments are placeholders, as allowed by the assignment.
- The dev/testing tools modal can reset progress, refill hearts, deduct hearts, simulate streak dates, and test sounds.
- Frontend deployment can use Vercel with `NEXT_PUBLIC_API_URL` pointing to the deployed backend.
- Backend deployment can use Render, Railway, or similar with `uvicorn main:app --host 0.0.0.0 --port $PORT`.

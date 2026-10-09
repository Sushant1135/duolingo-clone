# Duolingo Web App Clone

A full-stack language-learning web application developed as part of an SDE assignment. The project recreates the core learning experience of Duolingo, combining an interactive learning path, structured lessons, progress tracking, gamification, and learner-focused features in a responsive web interface.

The application uses **Next.js and TypeScript** for the frontend, **FastAPI and SQLAlchemy** for the backend, and **SQLite** for persistent data storage. Its German learning course is organized into sections, units, skills, lessons, and exercises, with course progress and learner activity stored in the database.

## Project Overview

The application is designed to demonstrate the development of a complete full-stack product, from interactive frontend components to backend APIs and relational data persistence.

Key areas include:

- **Interactive learning experience:** A structured learning path with units, skills, locked and unlocked lessons, progress indicators, and contextual guidebooks.
- **Lesson execution:** An interactive lesson player supporting multiple exercise formats, answer evaluation, and immediate feedback.
- **Gamification:** XP, streaks, hearts, gems, daily quests, monthly quests, achievements, and leaderboard rankings.
- **Learner progress:** Persistent tracking of completed lessons, scores, skill progression, and daily learning activity.
- **Practice and review:** Dedicated practice activities and review experiences to reinforce vocabulary and previously learned material.
- **Rewards and store:** A shop with purchasable demo items and reward-related interactions.
- **Personalization:** Learner profile, theme preferences, sound controls, and development tools for testing application behavior.

The project emphasizes modular feature organization, reusable components, typed API communication, and a clear separation between frontend presentation and backend business logic.

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

The backend organizes HTTP controllers and domain services by feature while keeping shared relational entities and Pydantic contracts centralized. Route registration connects the feature routers, controllers handle HTTP requests, and services contain reusable domain operations.

The frontend follows the same feature-oriented approach. Each feature contains its views and custom-hook controllers for state, navigation, and user actions. Next.js route files in `src/app` serve as thin entrypoints, while shared types, API communication, browser integrations, theme state, and reusable UI components are maintained separately to reduce duplication.

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

Open a terminal and run:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URL: `http://localhost:8000`

Swagger docs: `http://localhost:8000/docs`

### 2. Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

To access the development application from a phone connected to the same Wi-Fi network, use the computer's Wi-Fi IPv4 address instead of `localhost`, for example `http://192.168.1.25:3000`. The app's API client uses that same hostname for the backend. Allow Node.js and Python through Windows Firewall on private networks if prompted or if the phone cannot connect.

## Deployment

The production setup uses Vercel for the Next.js frontend and Render for the
FastAPI backend. Learner progress is stored in SQLite on a 1 GB persistent
Render disk; the Render API service therefore uses a paid instance and disk.
Without persistent storage, learner progress can be lost when the API restarts
or is redeployed.

### Deploy the backend to Render

1. In Render, create a Blueprint and connect this GitHub repository.
2. Render reads `render.yaml` from the repository root to create the API service.
   It builds from `backend/`, checks `/` for health, and stores the database at
   `/var/data/duolingo.db` on the persistent disk.
3. Wait for the service to finish deploying and copy its public URL, for example
   `https://duolingo-clone-api.onrender.com`.
4. Check that the API responds at the service URL and that `/docs` loads.

### Deploy the frontend to Vercel

1. Import this GitHub repository into Vercel.
2. Set the project Root Directory to `frontend`.
3. Add the environment variable `NEXT_PUBLIC_API_URL` with the Render API URL
   (for example, `https://duolingo-clone-api.onrender.com`; do not add a trailing
   slash).
4. Deploy or redeploy after setting the variable, since Next.js reads it when
   building the frontend.

The frontend calls the public API directly, so no secrets belong in
`NEXT_PUBLIC_API_URL`. The API currently allows browser requests from any
origin; restrict CORS to the deployed Vercel domain before adding private user
data or authentication.

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd run dev
```

## Validation

Run the following commands to check the backend and frontend.

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

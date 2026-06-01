# BrainTap Cloud Functions (`europe-west1`)

## Prerequisites

- Firebase project on the **Blaze** plan (required for Cloud Functions + scheduled jobs).
- Firebase CLI logged in: `firebase login`
- Project selected: `firebase use braintap-b0486` (or your alias)

## Install & build

```bash
cd functions
npm install
npm run build
```

## Deploy

From the repo root:

```bash
firebase deploy --only functions
```

Deploys:

- `validateAndSaveScore` — callable; anti-cheat + RTDB `leaderboard/{daily,weekly,alltime}/{mode}/{uid}`
- `resetDailyLeaderboard` — CRON daily 00:00 UTC
- `resetWeeklyLeaderboard` — CRON Monday 00:00 UTC

## Local emulator

```bash
cd functions && npm run serve
```

Starts Functions + Realtime Database emulators (see root `firebase.json`). Point the app at emulators during dev if needed (`connectFunctionsEmulator` / `connectDatabaseEmulator` in `src/lib/firebase.ts`).

## Client

After deploy, the app calls `validateAndSaveScore` automatically when a game ends (`submitValidatedScore` in `src/services/firebase/scores.ts`).

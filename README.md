# AI Interviewer

A professional interview simulation platform that uses AI to conduct interactive interviews. A React/TypeScript frontend talks to **Firebase Cloud Functions** that call Google's Gemini model to ask role-specific questions, adapt to the candidate's answers and produce feedback at the end.

Live app: https://ai-interviewer-1d892.web.app

## Features

- 🎤 Voice (Web Speech API) and text interviews, with text-to-speech for the interviewer
- 🎯 Role-specific interviews: engineering, project/program management, leadership and oil & gas roles
- 🧠 Gemini-powered conversation and a per-question feedback report
- 🔒 **Invite-only access**: only Google accounts invited by the admin can sign in
- 🛡️ **Admin console** (`/admin`): invite or revoke users by email and see each user's last access, interview attempts and the roles they practiced
- 🎨 [Flat UI](https://designmodo.github.io/Flat-UI/)-inspired design with **light and dark mode** (follows the system, switchable from every page)
- 📱 Responsive interface

## Architecture

```
Browser (React + Vite)  ──Firebase Auth (Google)──►  ID token
        │
        └── httpsCallable ──► Cloud Functions (Node 22, us-central1)
                                   │  verified token + invitation check
                                   ├── Firestore  (sessions, users, invitations, audits)
                                   └── Gemini API (key in Secret Manager)
```

- **Hosting** serves `client/dist`.
- **Functions** are callable (`onCall`) so the Firebase ID token travels automatically. Every function verifies a signed-in, email-verified user who is either the admin or invited; interview sessions are bound to the caller's email.
- **Firestore** is only reachable through the functions: `firestore.rules` denies all direct client access.
- Sessions live in the `sessions` collection and expire 1 hour after last use (a Firestore TTL policy on `expiresAt` deletes them).

### Functions

| Function | Who | Purpose |
| --- | --- | --- |
| `whoami` | any signed-in user | Returns `{ email, isAdmin, allowed }`; never throws for uninvited users |
| `init` | invited / admin | Starts an interview session for a role and records the attempt |
| `createUser` | invited / admin | Upserts the user profile |
| `sendMessage` | invited / admin | Sends a candidate message and returns the interviewer's reply |
| `endInterview` | invited / admin | Ends the interview |
| `getFeedback` | invited / admin | Generates per-question feedback |
| `listInvitations` | admin | Invitees with last access, attempts and roles |
| `inviteUser` | admin | Adds an email to the allowlist |
| `revokeInvitation` | admin | Removes an email from the allowlist |
| `wakeup` | anyone | Health check |

### Design patterns used

- **Adapter** – `client/src/services/api.ts` keeps a small `apiFunctions` surface and hides the callable transport.
- **Guard (single entry point)** – `functions/src/access.js` (`requireAccess`, `requireAdmin`) is the one place access rules live.
- **Custom hooks / composition** – the chat is split into `useInterviewChat`, `useSpeechRecognition`, `useMicrophone` and small presentational components.

## Interviewer avatar (3D)

The interviewer is a 3D character rendered with three.js that speaks (English only, `en-US`), moves its lips and shows expressions.

- **How it works:** `sendMessage` returns `{ text, emotion }` (Gemini answers in JSON with one of `neutral, friendly, curious, encouraging, serious, thoughtful`). The browser voice (`speechSynthesis`, en-US) reads the text; word-boundary events and a letter-to-viseme map (`components/avatar/lipsync.ts`) drive the model's mouth, plus blinking, eye wandering and head movement while idle. The mouth uses the model's own `viseme_*` shapes when it has them and falls back to ARKit blendshapes otherwise. Speech recognition is also fixed to `en-US`.
- **Fallback:** if WebGL or the model is unavailable the avatar is replaced by the robot badge and the chat works as before.
- **Scene:** she sits in a procedural office (window, bookshelf, desk lamp; `components/avatar/room.ts`, no image files). The room is drawn once, blurred like a lens would, and also used as the environment map, so the light on her skin matches the window and lamp behind her. The look follows the reference game [saltline](https://github.com/jestrade/videogame-saltline-fable-5.2): soft key/fill/rim lights with self-shadowing, sheen and ambient occlusion on the materials, then bloom, filmic tone mapping, vignette, film grain and a hint of chromatic aberration (`components/avatar/stage.ts`).
- **Model:** `client/public/models/interviewer.glb` (git-ignored; copy your model there). It is a single mesh with no skeleton or blendshapes, so `RigidFaceRig` bends it in the vertex shader: jaw and a dark mouth cavity for speech, lip rounding, smile, blinking (lids squash shut) and a head turn on the neck. The face landmarks are in `FACE` (`rigid-face-rig.ts`); update them if the model changes. A glTF with ARKit blendshapes also works: `FaceRig` is picked automatically (`_L/_R` or `Left/Right` names; Oculus `viseme_*` shapes when present). Check the license of any model before redistributing it. The three.js loaders need `client/public/basis/` (Basis transcoder, committed).
- **Try it without Gemini:** with the emulators running, open `http://127.0.0.1:5002/avatar-lab` (only available in emulator builds) to type a sentence, pick an emotion and watch the avatar speak.

## Repository layout

```
ai-interviewer/
├── client/                  # React + TypeScript + Vite app
│   └── src/
│       ├── components/      # chat/, auth/, admin/, feedback/, layout/, brand/, theme/, ui/ (shadcn)
│       ├── contexts/auth/   # AuthProvider (Google sign in, admin sign in, session restore)
│       ├── hooks/           # use-speech-recognition, use-microphone, use-elapsed-timer, ...
│       ├── lib/             # roles, speech helpers
│       ├── pages/           # root (routes), private (interview), admin, admin-login
│       └── services/        # api.ts (callable adapter), firebase.ts, sentry, session storage
├── functions/               # Firebase Cloud Functions (backend)
│   ├── index.js             # function exports
│   └── src/                 # access.js, handlers.js, config.js, services/, data/prompts.js
├── firebase.json            # hosting + functions + firestore config
├── firestore.rules          # deny-all (data only via functions)
├── firestore.indexes.json   # TTL policy on sessions.expiresAt
├── node-server/             # LEGACY Express + Redis backend, kept for reference
└── django-server/           # LEGACY, kept for reference
```

> `node-server/` and `django-server/` are no longer used. The backend is Firebase Functions.

## Prerequisites

- Node.js 22
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`) logged in with access to the project
- A Firebase project on the **Blaze** plan with Authentication (Google provider) and Firestore enabled
- A Google Gemini API key

## Setup

### 1. Functions

```bash
cd functions
npm install
cp .env.example .env          # set GEMINI_MODEL, OFFENSIVE_KEYWORDS, ADMIN_EMAIL
firebase functions:secrets:set GEMINI_API_KEY   # paste the key when prompted
```

`.env` holds non-secret parameters (it is git-ignored). The Gemini key is stored in Secret Manager.

### 2. Client

```bash
cd client
cp .env.example .env          # fill in the VITE_FIREBASE_* values from the Firebase console
npm install
npm run dev                   # http://localhost:5173
```

The dev client talks to the **deployed** functions. For an isolated local setup use the emulators (next section).

### Local development with the emulators

Runs Auth, Functions and Firestore locally under the demo project `demo-ai-interviewer`. Demo project ids can never reach real Firebase, so production data, users and quotas are untouched.

```bash
# one-time: local Gemini key (git-ignored)
cp functions/.secret.local.example functions/.secret.local   # then edit GEMINI_API_KEY

# terminal 1 (repo root)
firebase emulators:start --config firebase.emulator.json --project demo-ai-interviewer --import ./emulator-data

# terminal 2 - pick one
cd client && npm run dev:emulator      # Vite dev server, http://localhost:8080
cd client && npm run build:emulator    # build served by the Hosting emulator, http://127.0.0.1:5002
```

`firebase.emulator.json` serves `client/dist-emulator` (built by `build:emulator`), so the production `client/dist` is never used or overwritten by local testing. A plain `firebase emulators:start` serves the production build, which talks to real Firebase.

- `npm run dev:emulator` uses the Vite `emulator` mode: it loads `client/.env.emulator` and connects the SDK to the emulators (`client/src/services/emulators.ts`). It is ignored by `npm run build`, so deployed bundles never contain emulator URLs.
- `./emulator-data` seeds the admin `jesuestrada@gmail.com` (it is also `ADMIN_EMAIL` in `functions/.env.demo-ai-interviewer`), so it already appears in the Auth emulator's fake Google account picker; other emails can be added there and invited from `/admin`.
- Emulator UI: http://127.0.0.1:4000. Changes are lost when the emulators stop; add `--export-on-exit ./emulator-data` to keep them (this overwrites the seed).
- Ports: Auth 9099, Functions 5001, Firestore 8081, UI 4000.

### Environment variables

Functions (`functions/.env`):

| Variable | Description |
| --- | --- |
| `ADMIN_EMAIL` | The admin account (default `jesuestrada@gmail.com`) |
| `GEMINI_MODEL` | Gemini model name (default `gemini-2.5-flash`) |
| `OFFENSIVE_KEYWORDS` | Comma-separated words that end the interview |
| `GEMINI_API_KEY` | **Secret** – set with `firebase functions:secrets:set` |

Client (`client/.env`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, and optionally `VITE_SENTRY_DSN`.

## Usage

**Candidates**

1. Ask the admin to invite your Google email.
2. Open the app, pick the role you are applying for and continue with Google.
3. Answer by typing or with the microphone. When the interview ends, open **Show Feedback**.

**Admin**

1. On the sign-in page choose **Admin Login** (`/admin/login`) and sign in with the admin Google account.
2. In `/admin` enter an email and press **Invite**. No email is sent automatically: use the ✉️ button on the row to open a prepared message in your mail client.
3. The table shows status (Pending until the first sign in), last access, number of interview attempts and the roles each person practiced. Revoke access with the trash icon; the person is blocked on their next request.

Each sign-in with a role counts as one interview attempt.

## Deploying

```bash
cd client && npm run build && cd ..
firebase deploy --project ai-interviewer-1d892                      # everything
firebase deploy --only functions --project ai-interviewer-1d892     # just the backend
firebase deploy --only hosting --project ai-interviewer-1d892       # just the frontend
firebase deploy --only firestore --project ai-interviewer-1d892     # rules + TTL index
```

Container images of old function versions are cleaned up automatically after 1 day (`firebase functions:artifacts:setpolicy`).

## Testing

```bash
cd client && npm test        # React Testing Library + Jest
cd functions && npm test     # access-control unit tests
```

## Theming

The design tokens live in `client/src/index.css` (Flat UI palette: green sea / turquoise, peter river, midnight blue, clouds, alizarin; flat surfaces, 2px borders, 6px radius, Lato font) with a `.dark` variant. Theme switching uses `next-themes`; the toggle is `components/theme/theme-toggle.tsx`. Icons come from [lucide-react](https://lucide.dev).

## Troubleshooting

- **"Access denied" after signing in** – the Google account has not been invited (or was revoked). Ask the admin.
- **Admin Login says "Admin access only"** – sign in with the account configured in `ADMIN_EMAIL`.
- **Functions deploy fails** – the project must be on the Blaze plan, and `GEMINI_API_KEY` must exist as a secret.
- **Microphone** – check browser permissions; the Web Speech API works best in Chrome/Edge.
- **Logs** – `firebase functions:log --project ai-interviewer-1d892`.

# architecture.md — Running Dashboard Beginner's Guide

## What This Repo Does

This is a **personal running activity tracker**. You log your runs (date, duration in minutes, distance in km), and the app shows you visual summaries: a GitHub-style heatmap of which days you ran, stat cards with totals, and bar charts breaking down your activity by month.

It's a single-page web app (a website that loads once and never does a full page reload) that talks to a Google Sheet as its database through Google Apps Script (a free Google service that lets you write server-side code attached to Google Sheets).

## Why It Exists / What Problem It Solves

Tracking running habits in a spreadsheet works, but it's hard to spot patterns. This dashboard solves that by turning raw spreadsheet data into visual insights — you can instantly see how consistent you've been, which months you ran the most, and your year-to-date totals. It's built specifically for **one person's use** (password-protected), hosted for **free** (GitHub Pages + Google Sheets), and requires **zero backend infrastructure** to maintain.

**Pain points it addresses:**
- Spreadsheets are hard to visualize at a glance
- No free, simple, self-hosted running tracker that doesn't require signing up for a service
- Want to own your data (it stays in your Google Sheet)
- Want a GitHub-contribution-style heatmap for running, not just coding

## Who It's For

A single user (the repo owner) who wants a private, free, lightweight running tracker with automatic Strava integration.

## Where It Fits in the Bigger System

```
┌─────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│  GitHub Pages   │      │  Google Apps Script   │      │  Google Sheets   │
│  (hosts the     │─────▶│  (the "server" that   │─────▶│  (the database   │
│   React app)    │ HTTP │   reads/writes data)  │      │   storing runs)  │
└─────────────────┘      └──────────────────────┘      └──────────────────┘
     ▲                          ▲
     │ User opens website       │ Polls every 10 min
     │                          │
   [User]                  [Strava API]
```

| Component | Where it runs | Cost |
|-----------|---------------|------|
| React app (this repo) | GitHub Pages (static file hosting) | Free |
| Google Apps Script | Google's servers (runs as a "web app") | Free |
| Google Sheets | Google Drive | Free |
| Strava API | Strava's servers (polled by Apps Script) | Free |

There is no Kubernetes, no cloud database, no Docker — everything runs on free-tier Google, GitHub, and Strava services.

## Main Technologies Used

| Technology | What it is | What it does here |
|---|---|---|
| **React 18** | A JavaScript library for building user interfaces | Renders all the UI — forms, charts, tables, the heatmap grid |
| **Vite** | A fast build tool and dev server | Bundles the code for production, provides hot-reload during development |
| **Tailwind CSS** | A utility-first CSS framework (you write classes like `text-sm bg-white rounded-lg` instead of custom CSS) | All styling — layout, colors, dark mode, responsiveness |
| **React Router v6** | Client-side routing library | Handles navigation between Dashboard (`/`) and Activities (`/activities`) pages without full page reloads |
| **Recharts** | A React charting library built on D3 | Renders the 3 bar charts (days/minutes/km per month) |
| **HashRouter** | A variant of React Router that uses `#` in URLs (e.g., `site.com/#/activities`) | Required because GitHub Pages can't handle client-side routing — it only serves `index.html` for the root path |
| **Google Apps Script** | Google's server-side JavaScript platform attached to Google Sheets | Acts as the REST API — receives HTTP requests, reads/writes the Google Sheet, returns JSON. Also polls Strava API on a timer. |
| **Strava API** | Strava's REST API for accessing athlete activities | Polled every 10 minutes by Apps Script to auto-sync new runs |
| **gh-pages** | An npm package that deploys a folder to a `gh-pages` branch | One-command deployment: `npm run deploy` pushes the built site to GitHub Pages |

## High-Level Architecture

### Data Flow

1. **User opens the site** → GitHub Pages serves the React app
2. **Password gate** → User must enter the password (stored in `sessionStorage`, which means it lasts until the browser tab is closed)
3. **App loads data** → React calls `fetchActivities()` which sends an HTTP GET to Google Apps Script with the API key
4. **Google Apps Script** → Validates the API key, reads rows from the Google Sheet, returns JSON
5. **React renders** → The data is passed to Heatmap, StatsCards, and BarCharts components
6. **User logs a run** → Form submits → Confirmation dialog → HTTP POST to Apps Script → New row in Google Sheet → UI refreshes
7. **Strava auto-sync** → Every 10 minutes, Apps Script polls Strava API → Fetches recent activities → Filters for runs only → Skips duplicates → Adds new rows to Google Sheet

### Security Layers (3 layers, all simple)

1. **Private GitHub repo** — nobody can see the source code or the API key
2. **Password prompt** — blocks access to the site UI (password: checked against a hardcoded value in `config.js`)
3. **API key** — sent with every request to Google Apps Script, which rejects requests without a valid key
4. **Strava credentials** — stored in Google Apps Script's `PropertiesService` (server-side, encrypted at rest, never exposed to frontend)

> **Note:** This is "good enough" security for a personal project. The password and API key are stored in plain text in `config.js`. Since the repo is private and the site is only for one person, this is acceptable. For a production app serving many users, you'd use proper authentication (OAuth, JWT tokens, etc.).

## Main Folders, Modules, and How They Connect

```
src/
├── main.jsx              ← Entry point: mounts React into the HTML page
├── App.jsx               ← Top-level component: PasswordGate → Router → Pages
├── config.js             ← Constants: API URL, API key, site password
├── api.js                ← 4 functions: fetchActivities, createActivity, updateActivity, deleteActivity
├── dateUtils.js          ← 1 helper: parseDate('2026-03-01') → { year: 2026, month: 2, day: 1 }
│
├── pages/
│   ├── Dashboard.jsx     ← Main page: form + heatmap + stats + charts
│   └── Activities.jsx    ← Table page: view, edit, delete activities
│
├── components/
│   ├── PasswordGate.jsx  ← Wraps entire app, blocks until correct password entered
│   ├── Navbar.jsx        ← Top navigation bar with links and theme toggle
│   ├── ThemeToggle.jsx   ← Dark/light mode switch button
│   ├── ActivityForm.jsx  ← Input form (date, minutes, km) with confirmation dialog
│   ├── Heatmap.jsx       ← GitHub-style year grid (green = ran, gray = didn't run)
│   ├── StatsCards.jsx    ← 6 summary numbers (days/minutes/km for year and month)
│   ├── BarCharts.jsx     ← 3 bar charts using Recharts
│   ├── YearSelector.jsx  ← Dropdown to pick a year (current year down to 2020)
│   └── ConfirmDialog.jsx ← Reusable "Are you sure?" modal
│
└── styles/
    └── index.css         ← Tailwind imports + body dark mode transition
```

### How they connect (dependency graph):

```
main.jsx
  └─▶ App.jsx
        ├─▶ PasswordGate.jsx (reads config.js for SITE_PASSWORD)
        ├─▶ Navbar.jsx ──▶ ThemeToggle.jsx
        ├─▶ Dashboard.jsx
        │     ├─▶ ActivityForm.jsx ──▶ ConfirmDialog.jsx
        │     ├─▶ Heatmap.jsx
        │     ├─▶ StatsCards.jsx ──▶ dateUtils.js
        │     ├─▶ BarCharts.jsx ──▶ dateUtils.js
        │     ├─▶ YearSelector.jsx
        │     └─▶ api.js ──▶ config.js
        │
        └─▶ Activities.jsx
              ├─▶ YearSelector.jsx
              ├─▶ ConfirmDialog.jsx
              └─▶ api.js ──▶ config.js
```

### The Google Apps Script side (not deployed from this repo):

The file `google-apps-script/Code.gs` is a reference file. You don't deploy it from this repo — you paste its contents into the Google Apps Script editor (accessed from Extensions → Apps Script inside your Google Sheet). It runs on Google's servers and acts as the "backend API."

### Strava Integration (server-side only):

The Strava auto-sync runs entirely within Google Apps Script — no frontend changes needed. Key functions:

| Function | Purpose | How to run |
|---|---|---|
| `setupStravaCredentials()` | Store Strava API credentials in PropertiesService | Run once manually in Apps Script editor |
| `installStravaTrigger()` | Create a time-based trigger that polls every 10 min | Run once manually in Apps Script editor |
| `pollStravaActivities()` | Fetch recent Strava runs and add to sheet | Runs automatically via trigger |
| `removeStravaTrigger()` | Stop the auto-sync | Run manually if needed |

See `STRAVA_SETUP.md` for the full setup guide.

## Developer Workflow

### First-time setup

```bash
# 1. Clone the repo
git clone https://github.com/NguyenTu1323/running-dashboard.git
cd running-dashboard

# 2. Install dependencies
npm install

# 3. Configure your credentials
# Edit src/config.js with your Google Apps Script URL and API key
```

### Google Sheets setup (one-time)

1. Create a new Google Sheet
2. In row 1, add headers: `id | date | minutes | km`
3. Go to **Extensions → Apps Script**
4. Paste the Code.gs content
5. Click **Deploy → New Deployment → Web App**
6. Set "Execute as" = **Me**, "Who has access" = **Anyone**
7. Copy the deployment URL → paste into `src/config.js` as `APPS_SCRIPT_URL`
8. Set your chosen API key in both `Code.gs` and `src/config.js`

### Run locally

```bash
npm run dev
# Opens at http://localhost:5173/running-dashboard/
```

The dev server supports hot module replacement (HMR) — when you save a file, the browser updates instantly without a full page reload.

### Build for production

```bash
npm run build
# Output goes to dist/ folder (~584KB)
```

### Deploy to GitHub Pages

```bash
npm run deploy
# This runs: npm run build → gh-pages pushes dist/ to gh-pages branch
# Site is live at: https://NguyenTu1323.github.io/running-dashboard/
```

### Debug

- Open browser DevTools (F12) → Console tab for JavaScript errors
- Network tab to inspect API calls to Google Apps Script
- React DevTools browser extension for component state inspection
- No test framework is set up — testing is done manually by using the app

## Key Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build + push to `gh-pages` branch (deploys to GitHub Pages) |

There are **no test, lint, format, or type-check commands** configured. The project uses plain JavaScript (not TypeScript, despite having `@types/react` in devDependencies — those are there for editor autocompletion only).

## Branching Strategy and Git History

**Evidence from the codebase:**
- The project works on the `main` branch directly (confirmed by the user during development)
- Deployment goes to a separate `gh-pages` branch (managed automatically by the `gh-pages` npm package)
- No CI/CD pipeline (no `.github/workflows/` directory)
- No branch protection rules visible

**Inferred workflow:** Direct commits to `main`, manual deploy via `npm run deploy`. This is typical for a single-developer personal project.

## Coding Style and Naming Conventions

| Pattern | Example | Where to see it |
|---|---|---|
| **Functional components** (no class components) | `export default function Heatmap({ ... })` | Every `.jsx` file |
| **PascalCase** for component files and names | `StatsCards.jsx`, `ActivityForm.jsx` | `src/components/` |
| **camelCase** for utility files and variables | `dateUtils.js`, `loadActivities` | `src/` root files |
| **Named exports** for utilities, default exports for components | `export function parseDate()` vs `export default function Heatmap()` | `dateUtils.js` vs components |
| **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`) | Heavy use of `useMemo` for expensive computations | Heatmap, BarCharts, StatsCards |
| **Tailwind utility classes** inline (no separate CSS files per component) | `className="bg-white dark:bg-gray-800 rounded-xl p-4"` | Every component |
| **Dark mode** via `dark:` prefix classes | `text-gray-900 dark:text-white` | Every component |
| **Green accent color** (#39d353, GitHub's contribution green) | Used in heatmap cells, bar chart fills, buttons | Heatmap, BarCharts, buttons |

## Why These Tools/Patterns Instead of Simpler Alternatives

| Choice | Why not the simpler alternative? |
|---|---|
| **React** instead of plain HTML/JS | The UI has interactive state (forms, year selection, edit mode, dark mode). React makes managing this state much simpler than manual DOM manipulation. |
| **Vite** instead of Create React App | Vite is significantly faster for development (instant HMR) and produces smaller builds. CRA is deprecated as of 2023. |
| **Tailwind CSS** instead of regular CSS | Faster to write, consistent design system, dark mode built-in via `dark:` classes. No need to name CSS classes or manage separate stylesheets. |
| **HashRouter** instead of BrowserRouter | GitHub Pages only serves `index.html` for the root URL. BrowserRouter would break on page refresh (e.g., `/activities` would return 404). HashRouter puts routes after `#`, so the server always serves `index.html`. |
| **Recharts** instead of Chart.js | Recharts is React-native (renders as React components, not canvas). Easier to integrate with React's rendering lifecycle. |
| **Custom CSS heatmap** instead of a library | No React heatmap library exactly matches GitHub's contribution graph style. A custom implementation gives full control over the layout and is only ~120 lines of code. |
| **Google Sheets + Apps Script** instead of a real database | Free, zero maintenance, familiar interface. For a single user logging a few runs per week, a spreadsheet is more than enough. No need for Postgres, Firebase, or Supabase. |
| **`parseDate()` string splitting** instead of `new Date()` | `new Date('2026-03-01')` parses as **UTC midnight**. In timezones behind UTC (like Vietnam, UTC+7), calling `.getDate()` on this returns **February 28** instead of March 1. Splitting the string directly avoids this entirely. This is documented in `dateUtils.js` and `CLAUDE.md`. |

## Most Important Files to Read First (in order)

1. **`src/config.js`** — 3 lines, shows what credentials the app needs
2. **`src/api.js`** — 4 functions, shows how the app talks to Google Sheets
3. **`src/App.jsx`** — 23 lines, shows the app structure (password gate → router → pages)
4. **`src/pages/Dashboard.jsx`** — the main page, shows how all components come together
5. **`src/components/Heatmap.jsx`** — the most complex component, demonstrates the date handling pattern
6. **`src/dateUtils.js`** — 5 lines, but critical to understand the timezone-safe date parsing approach

## Concrete Example: Adding a "Notes" Field to Activities

**Use case:** You want to add a free-text "notes" field so you can write things like "felt great" or "knee pain" with each run.

### Files to modify (in order):

#### 1. Google Sheet — Add a column

Add a `notes` column header in cell E1 of your Google Sheet (after `km`).

#### 2. `google-apps-script/Code.gs` — Update the backend

In the Apps Script editor, update the `doPost` handler to read/write the `notes` field when creating and updating activities. The `doGet` handler already returns all columns, so it should automatically include `notes`.

#### 3. `src/components/ActivityForm.jsx` — Add the input field

```jsx
// Add state for notes
const [notes, setNotes] = useState('');

// Add an input field in the form (after the km input)
<div>
  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</label>
  <input
    type="text"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Optional notes"
    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
      bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
  />
</div>

// Update the grid from grid-cols-3 to grid-cols-4 to fit the new field
// Update handleConfirm to include notes in the data:
await onSubmit({ date, minutes: Number(minutes), km: Number(km), notes });

// Update the confirmation message to show notes:
message={`Date: ${date}\nMinutes: ${minutes}\nDistance: ${km} km\nNotes: ${notes || '(none)'}`}

// Reset notes after submit:
setNotes('');
```

**Why this file:** This is the form users fill in to log a run. Adding the input here lets users type notes when creating an activity.

#### 4. `src/pages/Activities.jsx` — Show notes in the table

```jsx
// Add a column header
<th className="...">Notes</th>

// In view mode, show the notes
<td className="px-4 py-3 text-gray-900 dark:text-white">{a.notes || '-'}</td>

// In edit mode, add an input for notes
<td className="px-4 py-2">
  <input type="text" value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} ... />
</td>

// Update editData state to include notes:
setEditData({ date: activity.date, minutes: String(activity.minutes), km: String(activity.km), notes: activity.notes || '' });

// Update handleSaveEdit to send notes:
await updateActivity(editId, { ...editData, minutes: Number(editData.minutes), km: Number(editData.km) });
// notes is already a string, so it passes through as-is
```

**Why this file:** This is where users view and edit existing activities. Adding the column here lets them see and modify notes.

#### 5. No changes needed to `api.js`

The API functions already pass through the entire `data` object, so `notes` will be included automatically. This is because `createActivity(data)` sends whatever `data` object it receives — it doesn't hardcode specific fields.

**Why no change:** The API layer is generic — it sends whatever data you give it. This is a benefit of the simple design.

## Risks, Gaps, and Unclear Areas

### Known gaps

| Gap | Impact | Evidence |
|---|---|---|
| **No tests** | Bugs are caught manually. No `jest`, `vitest`, or testing-library in `package.json`. | No test files exist anywhere in the project |
| **No linting or formatting** | Code style depends on the developer. No `eslint` or `prettier` configured. | No `.eslintrc`, `.prettierrc`, or lint scripts in `package.json` |
| **No TypeScript** | No compile-time type checking. `@types/react` packages are installed but unused (editor hints only). | All files are `.js` / `.jsx`, no `tsconfig.json` |
| **`Code.gs` is a reference copy** | The actual backend code lives in the Google Apps Script editor. The repo copy should be kept in sync manually. | `google-apps-script/Code.gs` |
| **Credentials in source code** | API key and password are hardcoded in `config.js`. Safe only because the repo is private. | `src/config.js` contains plain-text credentials |
| **No error retry or offline support** | If the Google Apps Script is down or slow, the app just shows an error. No retry logic, no caching, no service worker. | `api.js` throws on failure, `Dashboard.jsx` catches and shows error text |

### Inferred (not confirmed)

- **No CI/CD**: There's no `.github/workflows/` directory. Deployment appears to be manual (`npm run deploy`).
- **Single user only**: The password is shared via `config.js`. There's no user accounts, sessions, or multi-tenant support.
- **Google Sheets row limit**: Google Sheets supports ~10 million cells. At 4 columns per activity, you could store ~2.5 million activities — far more than a lifetime of running data. This is not a practical risk.
- **Apps Script execution limits**: Google Apps Script has a 6-minute execution limit and daily quotas, but for a single user logging a few runs per week, these limits are irrelevant.

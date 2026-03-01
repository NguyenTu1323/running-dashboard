# Running Dashboard

A personal running activity tracker that visualizes your runs with a GitHub-style heatmap, stats cards, and monthly bar charts. Data is stored in Google Sheets — no server or database to maintain.

## Features

- **Log runs** — date, duration (minutes), distance (km) with confirmation dialog
- **Activity heatmap** — GitHub-style contribution grid showing which days you ran
- **Stats cards** — year and month totals for days, minutes, and km
- **Bar charts** — monthly breakdown of days, minutes, and km
- **Activities table** — view, inline-edit, and delete past entries
- **Dark mode** — toggle between light and dark themes (persisted)
- **Password protected** — simple password gate using sessionStorage
- **Year selector** — filter all views by year

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Styling (with dark mode) |
| Recharts | Bar chart visualizations |
| React Router v6 | Client-side routing (HashRouter) |
| Google Sheets | Database |
| Google Apps Script | REST API backend |
| GitHub Pages | Free hosting |

## Setup

### 1. Google Sheets

1. Create a new Google Sheet
2. Add headers in row 1: `id | date | minutes | km`
3. Go to **Extensions → Apps Script**
4. Paste your Apps Script backend code (handles CRUD operations with API key validation)
5. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the deployment URL

### 2. Configure the App

Edit `src/config.js`:

```js
export const APPS_SCRIPT_URL = 'YOUR_DEPLOYMENT_URL';
export const API_KEY = 'YOUR_SECRET_KEY';       // must match Code.gs
export const SITE_PASSWORD = 'YOUR_PASSWORD';
```

### 3. Install and Run

```bash
npm install
npm run dev
# Opens at http://localhost:5173/running-dashboard/
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to GitHub Pages |

## Project Structure

```
src/
├── App.jsx               # Router + password gate
├── config.js             # API URL, API key, password
├── api.js                # CRUD functions (fetch, create, update, delete)
├── dateUtils.js          # Timezone-safe date parsing
├── pages/
│   ├── Dashboard.jsx     # Heatmap, stats, charts, activity form
│   └── Activities.jsx    # Table with inline edit/delete
└── components/
    ├── Heatmap.jsx       # GitHub-style activity grid
    ├── StatsCards.jsx    # Year/month summary metrics
    ├── BarCharts.jsx     # Monthly bar charts (Recharts)
    ├── ActivityForm.jsx  # Run logging form
    ├── PasswordGate.jsx  # Authentication wrapper
    ├── Navbar.jsx        # Navigation bar
    ├── ThemeToggle.jsx   # Dark/light mode switch
    ├── YearSelector.jsx  # Year dropdown
    └── ConfirmDialog.jsx # Confirmation modal
```

## Architecture

```
Browser → GitHub Pages (React SPA) → Google Apps Script (API) → Google Sheets (Data)
```

For a detailed deep-dive, see [architecture.md](architecture.md).

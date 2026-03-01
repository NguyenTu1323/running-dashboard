# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173/running-dashboard/)
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run deploy     # Build + deploy to GitHub Pages via gh-pages
```

## Architecture

React 18 SPA hosted on GitHub Pages, using Google Sheets as a database via Google Apps Script REST API.

```
User → GitHub Pages (React SPA) → Google Apps Script API → Google Sheets
              ↑
     Password gate (sessionStorage)
     API key on every request
```

- **Routing**: HashRouter (not BrowserRouter) — required for GitHub Pages compatibility
- **Styling**: Tailwind CSS with `class`-based dark mode
- **Charts**: Recharts for bar charts; custom CSS grid for GitHub-style heatmap
- **Base path**: `/running-dashboard/` in vite.config.js — must match GitHub repo name

### Key Files

- `src/config.js` — Apps Script URL, API key, site password (sensitive values)
- `src/api.js` — CRUD functions with date normalization
- `src/dateUtils.js` — `parseDate()` helper for timezone-safe date string parsing
- `google-apps-script/Code.gs` — Backend code (pasted into Google Apps Script editor, not deployed from here)

### Critical Pattern: Date Handling

**Never use `new Date('YYYY-MM-DD')` to parse date strings** — it parses as UTC midnight, causing dates to shift back 1 day in timezones behind UTC. Instead:
- Use `parseDate()` from `src/dateUtils.js` which splits the string directly
- Construct dates with `new Date(year, month, day)` (local time) when a Date object is needed
- Build date strings manually: `` `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` ``

### Pages

- `/` (Dashboard) — Activity form, heatmap, stats cards, bar charts with year selector
- `/activities` — Table with inline edit/delete, year filter

### Security Layers

1. Private GitHub repo
2. Password prompt (stored in sessionStorage, checked against `SITE_PASSWORD`)
3. API key sent with every Google Apps Script request

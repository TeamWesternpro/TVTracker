# TV Tracker 2.0

Your personal TV companion. Track every show, never miss a premiere.

## Live Site

[tv-tracker-pm4d.vercel.app](https://tv-tracker-pm4d.vercel.app)

## Tech Stack

- **Frontend:** Plain HTML, CSS, JavaScript (no frameworks, no build tools)
- **Backend:** Supabase (authentication, database, storage)
- **Hosting:** Vercel
- **Theme:** Gold (#D4A843) and Blue (#1E3A5F)

## Features

### Pages

| Page | Description |
|------|-------------|
| **Home** | Hero section, site stats, 6-card feature grid, CTA |
| **Tracker** | Add, edit, delete shows. Filter by status, search by title. Color-coded cards with poster images |
| **Calendar** | Monthly calendar with release dates. Add upcoming shows, export to personal calendars |
| **About Us** | What We Do, feature highlights, FAQ accordion, team info |
| **Auth** | Login, signup, forgot password (Supabase auth) |
| **Profile** | Upload avatar, change username |

### Tracker

- **Status filtering** with count badges: Currently Watching (yellow), Watched (green), Plan to Watch (purple), Upcoming (red)
- **Real-time search** — filter shows by title as you type
- **Show cards** with 2:3 poster ratio, status-colored left borders, platform logo
- **Add/Edit shows** with structured creator and cast info (name, role, photo, status)
- **Shared Series Library** — shows saved once are shared across all users; tracking data is per-user

### Calendar Integration

- **Add premiere dates to calendar** from the Tracker form via checkbox
- **Personal calendar export** — Google Calendar, Outlook, Yahoo Calendar, Apple Calendar (.ics download)
- **Duplicate prevention** — warns before adding the same show+date twice
- **"Add Upcoming Show"** for shows not yet tracked

### Authentication & Profiles

- Email/password auth via Supabase
- New accounts redirected to profile setup page
- Avatar upload (compressed to 200px JPEG)
- Username display in navbar and on feedback/feature request submissions
- Unauthenticated users see only the auth page

### Footer & Legal

- Brand section, link columns (Explore, Support, Legal), copyright
- Modal-based pages: Terms of Service, Privacy Policy, Cookie Policy
- Feature Request and Feedback forms with Discord webhook integration

## Project Structure

```
├── index.html              # Home page
├── tracker.html            # Show tracker
├── calendar.html           # Release calendar
├── about.html              # About Us
├── auth.html               # Login / Signup / Forgot Password
├── profile.html            # User profile
├── vercel.json             # Vercel config (no-cache headers)
├── css/
│   └── styles.css          # All styles (~2500 lines)
├── js/
│   ├── config.js           # Supabase credentials
│   ├── auth.js             # Auth state, session check, navbar
│   ├── data.js             # Data layer (Supabase + localStorage fallback)
│   ├── calendar-utils.js   # Calendar utilities (ICS, export URLs, duplicate check)
│   └── legal.js            # Legal modals + Discord webhooks
├── image/
│   └── favicon.png         # Site favicon
└── README.md
```

## Database Tables (Supabase)

### `series_library` (shared)
Shared metadata for all shows — one row per unique series.

### `user_tracker` (per-user)
Each user's tracking data. Links to `series_library` via `series_id`.

### `profiles`
User profile data — avatar (base64) and username.

## Setup

1. Clone the repo
2. Create a Supabase project and run the SQL from `js/data.js` comments to create tables
3. Add your Supabase URL and anon key to `js/config.js`
4. Set Supabase Site URL to your deployed domain (for email confirmation redirects)
5. Deploy to Vercel: `npx vercel --prod`

## Environment Variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## Cache Busting

CSS and JS files use `?v=N` query strings to bust browser cache. Bump the version number when making changes:

```html
<link rel="stylesheet" href="css/styles.css?v=7">
<script src="js/data.js?v=5"></script>
```

## Co-founded by

**TeamWesternProduction**

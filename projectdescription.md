# WinTheDay

**Mini Product Requirements Document**
v1.0 | March 2026 | MVP Scope

---

## Product Overview

| | |
|---|---|
| **One-liner** | Strava meets GitHub contribution graph for your whole life. Rate your day, see your streak, share your score. |
| **Core insight** | People do more when progress is visible and shareable. Strava proved it for running. WinTheDay applies it to life. |
| **Platform** | Mobile-first Progressive Web App (PWA) |
| **Target user** | Self-improvement-minded 20-35 year olds who track workouts, habits, or goals and want accountability through social sharing. |
| **Stack** | Next.js 14, Supabase (auth + DB), Tailwind CSS, Vercel |

---

## How It Works

The core loop is dead simple: Score your day, see the pattern, share the result.

### Step 1: Set Up Categories

On first use, the user selects 4-6 life categories and assigns a weight to each (how much it matters to them). Default categories are provided, but everything is customizable.

| Category | Example anchors | Default weight | Customizable? |
|---|---|---|---|
| **Sport / Fitness** | 1=no movement, 7=solid workout, 10=peak | 1x | Yes |
| **Education / Learning** | 1=nothing, 5=read/podcast, 10=deep study | 1x | Yes |
| **Career / Work** | 1=unproductive, 5=normal day, 10=shipped it | 1x | Yes |
| **Health / Wellness** | 1=junk food + no sleep, 10=clean + rested | 1x | Yes |
| **Relationships** | 1=isolated, 5=texted friends, 10=quality time | 1x | Yes |
| **Personal / Creative** | 1=nothing, 5=hobby time, 10=flow state | 1x | Yes |

### Step 2: Score Your Day

Each evening (or whenever), the user rates each category on a 1-10 slider. Each slider shows anchor labels so scores are consistent and meaningful, not vibes-based.

### Step 3: See Your Score

The app calculates a **weighted daily percentage**. Formula:

```
Daily Score = (sum of (rating × weight) / sum of (10 × weight)) × 100
```

**Example:** If Sport (weight 2x) = 8, Career (1x) = 6, Health (1x) = 9, and Relationships (1x) = 5, then: (8×2 + 6×1 + 9×1 + 5×1) / (10×2 + 10×1 + 10×1 + 10×1) = 36/50 = **72%**

### Step 4: Share It

One tap generates a beautiful, branded share card showing the daily score, category breakdown, date, and streak. Optimized for Instagram Stories and Twitter. The card is the viral loop.

### Step 5: Track Over Time

A GitHub-style heatmap calendar shows every day of the year. Darker green = higher score. The user can see their consistency patterns at a glance, which days they tend to score low, and their longest streaks.

---

## MVP Feature Scope (v1)

Ruthlessly minimal. Four features, one screen each.

| # | Feature | Description | Priority |
|---|---|---|---|
| 1 | **Daily scoring input** | Slider (1-10) for each category with anchor labels. Save button. One tap per category. | P0 - Must have |
| 2 | **Custom categories** | Add/remove/rename categories. Set weight (1x, 2x, 3x) per category. 4-6 categories max. | P0 - Must have |
| 3 | **Share card** | Auto-generated image card with daily %, category breakdown, date, and branding. Download or share. | P0 - Must have |
| 4 | **Calendar heatmap** | GitHub-style green boxes view. 365-day view. Tap a day to see breakdown. Color intensity = score. | P0 - Must have |

### Explicitly NOT in v1

- Social feed / following other users
- Notifications or reminders
- Goal setting or targets
- AI insights or recommendations
- Native app (iOS/Android) — PWA only
- Weekly/monthly reports
- Leaderboards or competitions

---

## Core User Flow

### First Visit (Onboarding)

1. Land on splash screen with tagline + CTA
2. Sign up via magic link (email) or Google OAuth
3. Choose categories from defaults or create custom (with weight sliders)
4. Score your first day
5. See your score + share card. Prompted to share.

### Daily Return

1. Open app, see today's empty scorecard (or yesterday's if not yet scored)
2. Slide each category, hit Save
3. See daily score animation (score counting up to final %)
4. Optional: tap Share to generate card
5. Optional: tap Calendar to see heatmap history

---

## Share Card Design Spec

The share card is the growth engine. It must be beautiful, instantly readable, and make people ask "what app is this?"

### Card contents

- Large daily score: "78%" with color (green >75, yellow 50-75, red <50)
- Date: "Tuesday, March 31, 2026"
- Category breakdown: mini bars or dots showing each category's score
- Mini heatmap: last 7 days as small colored squares (teaser for the full view)
- WinTheDay branding + URL at bottom

### Card specs

- 1080x1920px (Instagram Story) as primary format
- 1080x1080px (square, for feed posts) as secondary
- Dark background with vibrant accent colors
- Generated client-side using html2canvas or similar

---

## Calendar Heatmap Spec

Directly inspired by GitHub's contribution graph. This is the long-term motivation engine.

- 365-day grid, weeks as columns, days as rows (Mon-Sun)
- Color scale: empty (no data) → light green (low) → dark green (high)
- Tap any day to see a popup with that day's category breakdown
- Current streak counter displayed above the grid
- Month labels along the top for orientation

---

## Data Model (Supabase)

### users

- `id` (uuid, PK)
- `email` (text)
- `created_at` (timestamp)

### categories

- `id` (uuid, PK)
- `user_id` (FK → users)
- `name` (text) — e.g., "Sport"
- `weight` (integer, 1-3) — importance multiplier
- `icon` (text) — emoji or icon key
- `anchors` (jsonb) — `{1: "no movement", 5: "walked", 7: "workout", 10: "peak"}`
- `sort_order` (integer)
- `is_active` (boolean)

### daily_scores

- `id` (uuid, PK)
- `user_id` (FK → users)
- `date` (date) — unique per user per day
- `scores` (jsonb) — `{category_id: score, ...}`
- `total_percent` (numeric) — calculated weighted %
- `created_at` (timestamp)

---

## Screens (4 total)

| Screen | Purpose | Key elements |
|---|---|---|
| **Score** | Daily input. The main screen. Rate each category. | Sliders, anchor labels, Save button, today's date |
| **Result** | Shows calculated daily %. Animates score counting up. | Big %, category breakdown, Share button |
| **Calendar** | GitHub-style heatmap. Long-term view. | 365-day grid, streak counter, tap-to-reveal |
| **Settings** | Manage categories, weights, anchors, account. | Category editor, weight sliders, sign out |

---

## Development Plan

Sequential tasks, each independently shippable. Same approach as BookTok: small, testable chunks.

| # | Task | Details | Estimate |
|---|---|---|---|
| 1 | **Project setup** | Next.js 14 + Supabase + Tailwind + Vercel. Auth with magic link. | 1 session |
| 2 | **Data model + seed** | Create tables in Supabase. Seed default categories + anchors. | 1 session |
| 3 | **Scoring screen** | Slider UI for each category. Show anchor on slide. Save to DB. | 2 sessions |
| 4 | **Result screen + calc** | Weighted % calculation. Score animation. Category bars. | 1 session |
| 5 | **Share card generation** | html2canvas card. Download button. Story + square formats. | 2 sessions |
| 6 | **Calendar heatmap** | 365-day grid. Color scale. Tap to reveal. Streak counter. | 2 sessions |
| 7 | **Settings + category editor** | Add/edit/delete categories. Weight + anchor management. | 1 session |
| 8 | **PWA setup + polish** | Manifest, service worker, install prompt, offline score entry. | 1 session |

**Total estimate: ~11 sessions** (a session = focused 2-3 hour block with Claude/Codex)

---

## Success Metrics (v1)

- Nurtilek uses it daily for 2+ weeks (dogfooding test)
- Share card is screenshot-worthy: 3+ friends ask "what is this?"
- Scoring takes < 60 seconds (frictionless daily habit)
- Heatmap creates a visible pattern after 7 days

---

## Future Possibilities (NOT v1)

*Ideas to explore after v1 is validated. Listed for context, not commitment.*

- Social feed: follow friends, see their scores (Strava-style)
- Weekly/monthly summary reports with trends
- Push notifications / daily reminder at user-chosen time
- AI insights: "You score lowest on Relationships on Mondays"
- Leaderboards among friend groups
- Native iOS/Android app with widgets
- API / integrations (auto-score Sport from Apple Health / Strava)
- Shareable annual wrapped (like Spotify Wrapped but for life)

# TODOS

Deferred work from MVP Polish plan (2026-04-01).

## v2 Features

### Push Notifications
Web Push API + Vercel KV + Cron Job. Daily reminder at 9 PM local time if user hasn't scored.
Requires: service worker, VAPID keys, Vercel KV for subscriptions, Vercel Cron Job, permission prompt UX.
Deferred until core scoring ritual is validated on mobile web.
Estimated effort: human ~2 days / CC ~25 min.

### Custom Categories
User-configurable category names beyond the 5 defaults (Health, Learning, Career, Relationships, Spirit).
Requires: settings UI, migration logic for existing scores, category metadata in localStorage.
Deferred to v2 per design doc.

### Backend Persistence (Supabase)
Cloud storage, auth, cross-device sync. Replace localStorage with Supabase.
Requires: Supabase project setup, auth flow, data migration from localStorage, real-time sync.
Note: @supabase/supabase-js SDK removed from MVP to cut bundle size. Re-add when ready.
Deferred to v2 per design doc.

### Calendar .ics Fallback
Export a recurring calendar event as alternative reminder if push notifications unavailable.
Low priority since push itself is deferred.

## Technical Debt

### html2canvas + Tailwind v4 oklch() Audit
Tailwind v4 uses oklch() color functions by default. html2canvas 1.4.1 does not support oklch().
After implementation, audit the share card capture path: run html2canvas, inspect the output
for missing colors or blank regions. If oklch() leaks into captured elements, override with
hex/rgb fallbacks in ShareCard.tsx inline styles.
Risk: share card looks correct on screen but captures with wrong/missing colors.

# GymBro: calendar, clocks, and UI

## Behavior

- Dashboard, history, and progress show a monthly calendar sourced from the signed-in user's workout history. Only completed sessions receive marks. Multiple sessions share one marked day; selecting it lists the sessions. Dates follow the device's local timezone and the session's start date.
- The running workout clock measures time since its persisted start timestamp. Rest uses a persisted deadline; pausing preserves its remaining seconds. Focus, pageshow, and visibility changes resynchronize both clocks. Resuming a saved workout restores its routine and rest settings.
- Completed workouts save the original start timestamp rather than reconstructing the start from rounded minutes. Existing records need no migration.
- The landing page has a clearly labeled, unsaved set-logging demo. The account UI shares neutral surfaces, consistent navigation, legible numbers, and an orange action accent. Emoji decorations and the avatar's unsupported strength/stamina claims were removed.

## Visual decisions

ENERGY 6 / RHYTHM 7 / MOTION 2. Condensed athletic headings give the landing page a training-journal identity; body and app text use Geist for legibility. Warm paper distinguishes introduction from the existing dark workout environment. Orange identifies actions and completed training days. Icons describe lifting, dates, navigation, and records, using the existing icon dependency. The original brand mark remains intact. The landing journal has the sole offset shadow to resemble a notebook; ordinary app surfaces remain flat. Motion is restricted to interaction feedback and respects reduced-motion preferences.

## Verification

- PASS: `npm test`, five checks covering background time gaps, rest expiry, pause/resume math, Monday-first/leap-year calendars, and local date boundaries.
- PASS: `npx tsc --noEmit`.
- PASS: `npm run build`; temporary fixture preview routes were removed before the production build.
- PASS: Chromium landing interactions: set toggles, total volume, completion, reset, section anchors, and sign-up link; no JavaScript errors.
- PASS: Chromium account components with isolated server-action fixtures: calendar marks/details/month navigation; rest catch-up, pause/resume, time adjustments, reload recovery, expiry, and save payload; progress rendering and profile form submission. No existing account records were changed.
- PASS: landing and dashboard page widths 320, 375, 768, 1024, and 1440px without horizontal overflow; workout, progress, and profile checked at 375px. Desktop/mobile screenshots inspected.
- PASS: main text contrast measured: body on paper 6.21:1; white on the orange band 4.97:1; muted text on app surfaces 8.90:1; dark text on orange actions 6.69:1. Large accent headings on paper measure 4.35:1.
- PASS: navigation uses real destinations; demo controls have accessible names and pressed states; calendar completion uses check marks in addition to color; new calendar has loading, empty, error, and retry states; new controls retain focus outlines.
- PASS: no new testimonials, fabricated account statistics, decorative emoji, glow layers, or anonymous placeholder users in the product. Demo data is labeled.

## Platform boundary

The clock remains accurate after backgrounding and reopening. Rest chimes are scheduled on the audio clock after a user gesture, independently of display ticks. An operating system can still suspend audio or terminate a browser process; an exact alarm while force-closed is not guaranteed by this web app. Real-device audio, vibration, and lock-screen behavior still require an Android/iOS check. Browser background policy: [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

Database connection was checked with a read-only `SELECT 1`. UI write flows were exercised against fixtures, not the existing database. Environment secrets stay in the Git-ignored local configuration.

## Performance follow-up

The development log showed repeated dashboard actions at about 1.8 seconds, history document requests around 2.7 seconds, and per-exercise previous-set requests during routine startup. The development server's working set was about 3.5 GB.

- Dashboard and progress queries now run concurrently. The dashboard overview shares its parent's stats instead of fetching them again.
- History receives its initial records in the server response rather than fetching them again after hydration. The progress calendar remains mounted while analytics load, preserving the selected date and avoiding another history fetch.
- Bottom navigation receives authenticated state from the layout. Session lookup is memoized within server rendering using [React cache](https://react.dev/reference/react/cache), whose results are invalidated per request. The database pool is reused across route bundles and hot reloads.
- Routine preparation uses one client action. Previous sets for all routine exercises are fetched with one user-scoped SQL query; the single-exercise callers reuse that query too.
- A read-only warm-connection benchmark of the same five dashboard queries measured 1555 ms sequentially versus 321 ms concurrently, with identical results. These numbers exclude session lookup, cold connections, browser rendering, and full navigation time.
- Tests cover grouping, latest completed workout per exercise, bodyweight zero, absent exercise history, and isolation between users. The SQL integration test uses read-only VALUES CTEs rather than changing real tables. Run it explicitly with `node --env-file=.env.local --experimental-strip-types --test tests/workout-history.test.mjs`; ordinary `npm test` skips the database test when no DATABASE_URL is supplied.

Local preview uses `npm run build` then `npm start`. Use `npm run dev` when source hot reload is needed. Existing tabs need a reload after switching builds.

## Mobile calendar spacing

Removed the day buttons' aspect ratio, which combined with their minimum height could make them wider than narrow grid columns. Buttons now use their column's full width, explicit row heights, zero horizontal padding, and an 8px gap. Selected-day and keyboard-focus rings stay inside the button. A dense calendar fixture with every adjacent date marked passed containment, spacing, focus, and no-overflow checks at 320, 360, 375, 390, 430, 768, and 1024px; the 375px screenshot was inspected.

# Warm UI verification

## Dark mode follow-up

- PASS — Browser checks for landing, sign-in, dashboard, routines, progress, exercises, profile, and workout logger at 320, 375, 430, 768, 1024, and 1440px. No horizontal overflow. Dashboard, calendar, charts, and sign-in screenshots inspected.
- PASS — Manual toggle, reload persistence, cross-tab storage sync, system theme defaults and live changes, keyboard activation, and blocked-storage fallback.
- PASS — Six bootstrap unit cases cover saved light/dark, system defaults, invalid preferences, and denied storage. Total regression run: 12 passed, one database integration test skipped.
- The temporary account preview uses isolated server-action fixtures; no existing account records were changed.
- PASS — Production build and standalone TypeScript check. Production browser smoke verified dark/light toggling, reload persistence, navigation to sign-in, mobile width, private-route redirects, and 404 for the removed preview route.

Scope: landing, dashboard, routines, history, progress, exercise library, profile, routine builder, and active workout. Auth, database ownership rules, persisted workout clocks, and earlier request batching remain in place.

## Delivery checks

- PASS — Purpose: the warm palette and casual voice follow the user's brief in DESIGN.md. The plate motif refers to lifting; the existing brand mark is preserved. No new dependency or external image asset was added.
- PASS — Layout: Chromium checks at 320, 375, 430, 768, 1024, and 1440px, including eight account screens with isolated fixture responses. No page overflow. Desktop and mobile screenshots inspected.
- PASS — Calendar: completed-day marks, date details, previous/next month, fixed column gaps, and reduced motion verified in-browser. Selection never changes cell size. Calendar history is fetched once per mounted calendar.
- PASS — Interaction: demo set toggles/reset, routine filters, exercise search/category filters, profile save response, workout start/check/rest timer, and dialog focus/Escape checked using fixtures. Background time jumps, pause/resume, reload recovery, expiry, list failure messages, and retry were also exercised. Existing account data is not used for test writes.
- PASS — Contrast: main text on cream 12.71:1; muted text on card 5.22:1; light text on terracotta 5.32:1; olive text on the sample calendar 4.91:1; completed-day text on peach 5.58:1. Input boundaries and the demo check icon exceed the 3:1 non-text threshold.
- PASS — States and semantics: calendar loading/empty/error/retry states retained; list fetch failures have retry states; form fields have labels; new icon buttons have names; filter controls expose pressed state; focus outlines remain visible.
- PASS — Motion: finite CSS animations only; reduced-motion settings remove delays and movement. No ticking animation was added to the calendar.
- PASS — Content: example data is labeled in landing and temporary test fixtures. No fabricated testimonials, fitness claims, marketing totals, or decorative emoji were introduced.

Temporary preview routes and local test artifacts are excluded from the final production application. Production smoke checks passed for the landing demo, sign-in route, responsive widths, private-route protection, and missing fixture routes. Production build and TypeScript passed; regression tests passed six local checks, with the database integration check skipped in this UI-only run. Real-device audio and vibration retain the platform limits recorded in fitness-refresh.md.

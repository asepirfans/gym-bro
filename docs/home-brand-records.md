# Home, brand, and record-list refinement

The user requested five initial personal-record cards followed by show more, a redesigned logo, and a quieter home page.

- Personal records show the first five entries. The same accessible button expands the rest and collapses back to five. It exposes `aria-expanded` and controls the record-list region. Counts and delete controls still use the full dataset; a list of five or fewer has no expansion button.
- Home no longer mounts the workout-insight panel or requests `getAIWorkoutInsights`. Core metrics, calendar, routines entry point, consistency, recent sessions, and the progress link remain. The removed local-storage collapse preference is no longer accessed.
- The new vector mark combines a G-shaped weight plate and barbell with charcoal, cream, and peach. No gradients or shared SVG IDs. The header/auth/landing mark, SVG favicon, 32px favicons, Apple icon, and exported workout-card mark use matching geometry. Icon metadata has a cache-busting version for existing browsers.

Browser checks pass with isolated server-action fixtures: five of twelve initial records, keyboard expansion/collapse, five-record boundary, mobile-to-desktop overflow at 320/375/430/768/1024/1440px, no insight-panel action request, recent-workout sharing, actual PNG containing the new mark, and light/dark/auth/landing brand rendering. No existing account data is modified.

Regression suite: 16 passed, one database integration check skipped. Production build, TypeScript, production theme/navigation checks, and served logo assets pass. Temporary preview route removed; local server runs on port 3002.

## Dashboard opener follow-up

The user rejected the motivational banner shown in their screenshot. It is replaced with a flat dashboard header: a sans-serif greeting, factual last-session information linked to history, and direct start/routine actions. The large colored container, italic serif slogan, filler paragraph, and decorative weight-plate artwork/CSS are removed.

Browser checks pass at 320/375/430/768/1024/1440px in light/dark modes. The mobile opener stays below 220px. Start/routine destinations, long user/session names, empty/error data states, and active-workout continuation are checked with isolated fixtures. No extra data request was added.

Production build and TypeScript pass; the preview route is removed before shipping.

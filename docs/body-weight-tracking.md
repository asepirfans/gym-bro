# Body-weight tracking and concise copy

## Delivered behavior

- Progress has separate Latihan and Berat badan tabs. Weight history is requested only after opening its tab, including for users with no completed workouts.
- Date-based kg entries support decimal commas/dots and up to two decimal places. Selecting an existing date changes the action to Perbarui. Saving the same day updates that day's entry rather than duplicating it.
- The latest measurement and change since the first entry are neutral values. The chart shows the latest 30 entries in date order; history starts with five rows and can expand/collapse. Edit, delete confirmation, loading, empty, validation, mutation-failure, and load retry states are present.
- The calendar's motivational/helper copy and redundant day caption are removed. Empty dates say Tidak ada latihan. The routine promo panel is removed from Home. History and Progress page headings use direct titles. Workout history starts with five cards, with show more/less; the calendar still receives the full history.

## Storage and rollout

`bodyWeight` stores owner, date, kg, and creation time. Owner/date has a unique index and kg has a positive-value constraint. Existing app tables and workout records are unchanged. Per the repository schema convention, this table has a plain owner column rather than introducing a foreign key.

All three server actions resolve the user from the server session. List/delete use an owner condition; upsert is scoped to the owner/date key. Client-supplied owner IDs are never accepted. Queries use bound parameters.

The current configured database has the additive migration applied. For another environment:

```powershell
node --env-file=.env.local scripts/apply-body-weight.mjs
```

The script runs `drizzle/0000_body_weight.sql` transactionally and can run again without dropping tables. The matching Drizzle schema is in `lib/db/schema.ts`.

## Verification

- Full regression with the configured DB: 19 passed, zero skipped. Body-weight validation covers commas, bounds, invalid dates/leap days and malformed inputs. Actual parameterized list/upsert/delete queries are tested against a transaction-local temporary table: user isolation, date uniqueness, order, unauthorized deletion and invalid weight checks. No existing account records are inserted or changed by tests.
- Actual unauthenticated HTTP requests to list/save/delete actions are rejected before DB access.
- Browser fixtures cover history 5/show more, removed copy, lazy weight loading, save/correct/validate/failure behavior, graph, edit/delete cancellation and confirmation, empty/load retry, and 320/375/430/768/1024/1440px in both themes.
- TypeScript passes. Date fields use date-only strings and local-day defaults, avoiding UTC conversion of calendar dates.
- Production build, theme/navigation smoke, protected-route checks, fixture cleanup, and the read query against the actual migrated table pass. The app is running at localhost:3002.

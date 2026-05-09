# Tasks — Find More Songs

Status legend: **DONE** = shipped in v1.0.0; **OPEN** = candidate work. `[P]` = parallel-safe.

## US1 — Find more by an artist

- **DONE** Library hook on grid view — `screen.js:8-31`
- **DONE** Library hook on tree view — `screen.js:34-57`
- **DONE** Idempotent link injection (`dataset.fmLinked`) — same blocks
- **DONE** Search submit + render — `screen.js:fmSearch` + table render
- **DONE** Backend search route — `routes.py:11`

## US2 — Filter by ownership

- **DONE** Three-tab filter (All / Available / Owned) — `screen.js` filter handler
- **DONE** In-memory filtering on cached `fmData`
- **DONE** Counts displayed in header (total / owned / available)

## US3 — Open CustomsForge page

- **DONE** Row click opens CustomsForge URL — table render

## US4 — Open from nav

- **DONE** Nav entry `find-more` — `plugin.json`
- **DONE** Empty state when artist field is blank

## Cross-cutting

- **DONE** Exact case-insensitive artist filter on remote results — `routes.py:21-25`
- **DONE** Ownership lookup via `meta_db.conn.execute(... COLLATE NOCASE)` — `routes.py:28-31`
- **DONE** 15-second HTTP timeout on RSPlaylist call
- **DONE** Stdlib-only backend (no extra requirements)
- **OPEN** [P] Wrap RSPlaylist call in try/except, return `{error}` instead of 500 (graceful outage UX)
- **OPEN** [P] Fuzzy ownership matching (e.g. ignore `(Live)`, `(Remastered)` suffixes)
- **OPEN** [P] Artist autocomplete from local library
- **OPEN** Test for the ownership join (no fixture today)

## Documentation

- **DONE** README with install + screenshots + RSPlaylist note
- **OPEN** [P] CHANGELOG / version history

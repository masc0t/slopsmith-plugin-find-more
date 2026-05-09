# Feature Specification: Find More Songs

**Plugin id**: `find_more`
**Status**: Shipped (v1.0.0)
**Type**: Screen plugin + 1 backend route + library hooks

## Summary

Searches RSPlaylist's public CDLC index for songs by a given artist, marks each result as Owned or Available based on the user's local library, and links to CustomsForge for download.

## User Stories

### US1 — Find more by an artist (Priority: P1)

**Given** I see a song by "Foo Fighters" in my library,
**When** I click `[find more]` next to the artist name (in grid view or tree view),
**Then** the Find More screen opens, the artist field is pre-filled, and the search runs immediately.

### US2 — Filter by ownership (Priority: P1)

**Given** I have results loaded,
**When** I click All / Available / Owned tabs,
**Then** the table re-renders without re-querying — Available shows what I don't own, Owned shows what I have, All shows both.

### US3 — Open a song's CustomsForge page (Priority: P2)

**Given** I see an Available result,
**When** I click its row,
**Then** its CustomsForge page opens in a new tab.

### US4 — Open Find More from the nav (Priority: P3)

**Given** I'm not in the player,
**When** I open the Plugins dropdown → Find More,
**Then** the screen opens with an empty artist field; I can type and search.

## Functional Requirements

- **FR1**: `GET /api/plugins/find_more/search?artist=<name>` MUST return `{artist, total, owned, available, results[]}`.
- **FR2**: Results MUST be filtered to exact-artist (case-insensitive) match against the requested artist — RSPlaylist's substring matches across other artists are dropped.
- **FR3**: Each result MUST include `title, artist, album, tuning, paths, creator, dd, downloads, cdlc_id, updated, owned`.
- **FR4**: Sort order MUST be `(owned, -updated)` — Available first, then most-recently-updated.
- **FR5**: Library hooks MUST be idempotent (`dataset.fmLinked` flag) so re-renders don't duplicate links.
- **FR6**: Library hooks MUST work with both grid view and tree view.
- **FR7**: Plugin MUST NOT require any external Python dependency beyond stdlib.

## Non-Functional Requirements

- HTTP timeout for RSPlaylist call: 15 seconds (`routes.py:17`).
- Plugin gracefully handles RSPlaylist downtime: surface the error in the UI, don't 500.

## Out of Scope

- Direct download from CustomsForge (the plugin links out, user downloads manually).
- Pagination beyond RSPlaylist's ~20-result cap.
- Artist suggestions / autocomplete.
- Cross-plugin coordination (e.g. auto-import once downloaded).

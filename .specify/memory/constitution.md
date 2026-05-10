# Find More Songs — Plugin Constitution

This plugin discovers more CDLC by an artist via RSPlaylist's public API and surfaces them next to the user's local library so they can decide what to add next.

## Core Principles

### I. No CustomsForge Account, No User Credentials
Search is powered by RSPlaylist's public search endpoint (`https://rsplaylist.com/api/search.php?search=...`). The plugin MUST NOT require a CustomsForge login or store CF credentials. The user clicks through to CustomsForge for download — actual download is out of scope.

### II. Ownership Comparison Is Local
Results are joined against `meta_db.songs` by case-insensitive title match per artist. Matched rows are flagged `owned: true`. Sort order is "available first, then newest updated." No external lookup of "have you already downloaded this" — purely a local DB diff.

### III. Library Surface Is Non-Invasive
The plugin extends `renderGridCards` and `renderTreeInto` (Slopsmith core globals) by appending `[find more]` links to artist names. It MUST NOT replace, reorder, or alter existing rendering — it appends in idempotent fashion (`dataset.fmLinked` guard).

### IV. Filter In-Memory, Not Re-Query
Once results land, "All / Available / Owned" filters operate on the cached `fmData` array. Re-querying the artist is explicit (search submit). This keeps the network footprint to one round-trip per artist.

### V. Tolerate RSPlaylist Quirks
RSPlaylist returns a flat result list across all artists matching the query — the plugin filters down to the requested artist by case-insensitive equality. RSPlaylist caps results at ~20, which the README acknowledges as a limitation for prolific artists. This is a third-party constraint, not a bug.

## Inherits from Slopsmith Core Constitution

- **Vanilla JS, no framework.**
- **Plugin isolation**: backend imports nothing from core except `meta_db` (via `setup(app, context)`).
- **Manifest-driven loading**: `plugin.json` declares `id: "find_more"`, `nav.screen = "find-more"`.
- **Single-user, single-host.** No per-user search history.
- **No additional Python deps** — uses only `urllib` + `json` from stdlib.

**Version**: 1.0.0 | **Ratified**: 2026-05-09 | **Last Amended**: 2026-05-09

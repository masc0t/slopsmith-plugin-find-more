# Implementation Plan — Find More Songs

## Architecture

**Frontend** (`screen.html` 37 lines, `screen.js` 187 lines):
- DOM-rendered table; no canvas.
- Module-scope state (`fmData`, `fmCurrentFilter`, `fmLastArtist`).
- Two library hooks installed via wrap-around override of `window.renderGridCards` and `window.renderTreeInto`. Both append `[find more]` links idempotently using `dataset.fmLinked`.
- Three filter buttons (All / Available / Owned) re-render in-memory.
- Search submit calls the backend route, populates `fmData`, renders.

**Backend** (`routes.py` 61 lines, 1 route):
- `setup(app, context)` captures `meta_db`.
- `GET /api/plugins/find_more/search?artist=<name>`:
  1. URL-encode artist, GET `https://rsplaylist.com/api/search.php` with 15-second timeout.
  2. Filter remote results to exact-artist (case-insensitive equality).
  3. Query `meta_db.songs` for local titles by this artist (`COLLATE NOCASE`).
  4. Build merged result list with `owned` flag.
  5. Sort `(owned, -updated)`.
  6. Return `{artist, total, owned, available, results[]}`.

## Integration Points (Slopsmith core)

| Surface | How used |
|---|---|
| `context['meta_db']` | local songs DB for ownership lookup |
| `window.renderGridCards` (hooked) | append `[find more]` links to grid cards |
| `window.renderTreeInto` (hooked) | append `[find more]` links to tree artist headers |
| `window.showScreen('plugin-find_more')` | navigate to plugin |
| `plugin.json:nav.screen = "find-more"` | core mounts the screen |

## File Map

| Path | Purpose | Lines |
|---|---|---|
| `plugin.json` | manifest | ~10 |
| `screen.html` | search input + filter buttons + table container | 37 |
| `screen.js` | search submit, filter, library hooks | 187 |
| `routes.py` | RSPlaylist proxy + ownership join | 61 |
| `README.md` | install + how it works + screenshots | ~80 |

## Tech Stack

- Python: stdlib only (`urllib`, `json`).
- JS: vanilla, fetch API.
- No external Python deps — README confirms this is intentional.

## External Dependencies

- **RSPlaylist** — `https://rsplaylist.com/api/search.php?search=<artist>` — public, anonymous, ~20-result cap.
- **CustomsForge** — link target only; no API call.

## Out-of-Plan / Won't Build

- Direct CustomsForge download (link out only).
- Pagination beyond RSPlaylist's cap.
- Fuzzy ownership matching (exact case-insensitive only).
- Search history / saved searches.
- Artist autocomplete.

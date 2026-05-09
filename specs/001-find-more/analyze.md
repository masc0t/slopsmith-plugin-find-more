# Analysis — Find More Songs

## Coverage

| Area | Spec'd | Implemented | Notes |
|---|---|---|---|
| RSPlaylist search proxy | yes | yes | `routes.py:11-61` |
| Local ownership join | yes | yes | meta_db query |
| Library link injection (grid + tree) | yes | yes | idempotent guard |
| Filter (All / Available / Owned) | yes | yes | in-memory |
| Open CustomsForge page | yes | yes | row click |
| Stdlib-only backend | yes | yes | RSPlaylist call uses `urllib` |
| Tests | yes (open) | no | no fixtures |

## Drift

- README mentions a sister plugin `slopsmith-plugin-midi-capo` (Virtual Capo) — out-of-scope for this plugin's spec but worth noting in any consolidated index.
- Author tag in README is `masc0t/slopsmith-plugin-find-more` (different author from byrongamatos). No drift; just acknowledging the cross-author plugin ecosystem.
- No drift between README and code.

## Gaps

1. **No graceful degradation on RSPlaylist outage.** A 5xx from RSPlaylist would currently return 500 to the client. Wrapping in try/except and returning `{error: "RSPlaylist unreachable"}` would match the discextract pattern.
2. **No fuzzy ownership matching.** Local library variations like `"Eruption (Live at Castle Donington)"` vs `"Eruption"` create false negatives — user sees an Available result they technically already own. A normalisation pass (strip `(...)` suffixes, trim whitespace) would help.
3. **No tests.** A small fixture (mock RSPlaylist response + tiny meta_db rows) would lock down the join + sort logic.
4. **No artist autocomplete.** Users have to type the artist exactly; no learning from local library.
5. **Search history is volatile.** `fmLastArtist` is module-scope; no persistence across navigations.

## Recommendations

- **Low cost / high value**: wrap RSPlaylist call in try/except, return JSON error. ~5 lines.
- **Low cost**: case-fold + strip parenthetical suffixes in the ownership comparison. Reduces false negatives without false positives.
- **Medium**: tests with a mocked RSPlaylist response + `meta_db` fixture.
- **Low cost**: persist `fmLastArtist` to localStorage so navigating away/back keeps the user's place.
- **Cosmetic**: add a "powered by RSPlaylist (cap: 20 results)" footer note in the UI so the cap doesn't surprise users who notice missing songs.

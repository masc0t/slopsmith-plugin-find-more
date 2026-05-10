# Clarifications — Find More Songs

## Q1: Why is the result cap 20?
**A**: RSPlaylist's public API caps responses at ~20. README acknowledges this as a known limitation for prolific artists like Metallica. Out of the plugin's control.

## Q2: How are duplicates handled when a song appears multiple times on CustomsForge?
**A**: Each remote result is treated independently — if two CustomsForge entries share the same title, both appear. Owned-flag is a `title.lower() in local_titles` check; both rows would flag as owned if any local title matches.

## Q3: What if the user's library has a slightly different title spelling?
**A**: Exact case-insensitive match. "Eruption" vs "Eruption (Live)" wouldn't dedupe. `[OPEN]` whether to add fuzzy matching.

## Q4: Does the plugin remember past searches?
**A**: Only the most recent — `fmLastArtist` is module-scope in `screen.js`. Refresh / restart loses it. No persistence.

## Q5: How are tunings displayed?
**A**: As-is from RSPlaylist (`tuning_name` field — e.g. "E Standard", "Drop D"). No normalisation or grouping.

## Q6: Is RSPlaylist authenticated?
**A**: No. Public anonymous search endpoint. No API key required.

## Q7: What's the relationship to the CustomsForge plugin (`slopsmith-plugin-cf`)?
**A**: They're independent. CF plugin has its own browser; Find More is a thinner artist-focused query against RSPlaylist (a third party that aggregates CF data). No code shared.

## Q8: How does the plugin handle RSPlaylist outage?
**A**: `urllib.request.urlopen` raises and the FastAPI handler returns a 500. The frontend's fetch will show the error. `[NEEDS CLARIFICATION]` whether to wrap in try/except and return `{error: "..."}` for friendlier UX (matches discextract's pattern).

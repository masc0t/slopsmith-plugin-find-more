"""Find More Songs plugin – search CustomsForge for more songs by an artist."""

import json
import urllib.parse
import urllib.request


def setup(app, context):
    meta_db = context["meta_db"]

    @app.get("/api/plugins/find_more/search")
    def search_artist(artist: str):
        # Fetch all songs for the artist from RSPlaylist
        url = ("https://rsplaylist.com/api/search.php?search="
               + urllib.parse.quote(artist))
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            remote_songs = json.loads(resp.read())

        # Filter to only results matching the requested artist (case-insensitive)
        artist_lower = artist.strip().lower()
        remote_songs = [
            s for s in remote_songs
            if s.get("artist", "").lower() == artist_lower
        ]

        # Get local songs by this artist
        rows = meta_db.conn.execute(
            "SELECT title FROM songs WHERE artist COLLATE NOCASE = ?",
            (artist.strip(),),
        ).fetchall()

        local_titles = {row[0].lower() for row in rows}

        # Build results: mark each remote song as owned or not
        results = []
        for s in remote_songs:
            results.append({
                "title": s.get("title", ""),
                "artist": s.get("artist", ""),
                "album": s.get("album", ""),
                "tuning": s.get("tuning_name", ""),
                "paths": s.get("paths_string", ""),
                "creator": s.get("creator", ""),
                "dd": s.get("dd", False),
                "downloads": s.get("downloads", 0),
                "cdlc_id": s.get("cdlc_id"),
                "updated": s.get("updated"),
                "owned": s.get("title", "").lower() in local_titles,
            })

        # Sort: not-owned first, then by newest updated
        results.sort(key=lambda r: (r["owned"], -(r["updated"] or 0)))

        return {
            "artist": artist.strip(),
            "total": len(results),
            "owned": sum(1 for r in results if r["owned"]),
            "available": sum(1 for r in results if not r["owned"]),
            "results": results,
        }

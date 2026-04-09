# Slopsmith Plugin: Find More Songs

A plugin for [Slopsmith](https://github.com/byrongamatos/slopsmith) that searches [CustomsForge](https://ignition4.customsforge.com/) for more songs by an artist and shows you more songs to add to your collection.

Search results are powered by [RSPlaylist](https://rsplaylist.com/search/) and do not require a CustomsForge account.


## Features

- **Artist search** — find all available CDLC on CustomsForge for any artist
- **Ownership tracking** — songs you already have are marked as **Owned**, the rest as **Available**
- **Filter results** — toggle between All, Available, and Owned
- **Song details** — tuning, paths (Lead/Rhythm/Bass/Vocals), download count, and last updated date
- **CustomsForge links** — click any row to open the song's page on CustomsForge
- **Library integration** — **[find more]** links appear next to artist names in both grid and tree views
- **Auto-populate** — opens with the current song's artist when navigating from the player

##

<img width="312" height="413" alt="find more 1" src="https://github.com/user-attachments/assets/035e24d0-bc9e-4a11-ae3a-91af180799be" />

##

<img width="1012" height="653" alt="find more 3" src="https://github.com/user-attachments/assets/f6ed3c82-8867-49aa-a537-24811432392c" />



## Installation

```bash
cd /path/to/slopsmith/plugins
git clone https://github.com/masc0t/slopsmith-plugin-find-more.git find_more
docker compose restart
```

## How It Works

1. Click **[find more]** next to any artist name in the library, or open **Find More** from the Plugins dropdown
2. The plugin queries RSPlaylist's public API for all CDLC by that artist
3. Results are compared against your local library to show what you already own
4. Click any Available row to open its CustomsForge page for download

## Known Issues

RSPlaylist only returns 20 results, so this plugin is less useful for artists with heaps of DLC such as Metallica

## Requirements

No additional dependencies — uses only Python standard library modules.

## Other Plugins

- [Virtual Capo](https://github.com/masc0t/slopsmith-plugin-midi-capo) — auto-send MIDI pitch shift to match each song's tuning during playback (Fractal Audio)
- [Invert Highway](https://github.com/masc0t/slopsmith-plugin-invert-highway) — flip the chord note stacking order on the highway

## License

MIT



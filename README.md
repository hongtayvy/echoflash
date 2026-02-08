# EchoFlash (React + TS)

Features:

- Multiple decks (create/rename/delete)
- Card CRUD (question/answer + optional tags)
- Search + tag filtering
- Study mode:
  - flip animation
  - shuffle
  - know / don’t know marks + stats
  - keyboard shortcuts (Space, arrows, S, K, D)
- CSV import:
  - question,answer,(optional tags)
  - header or no header
  - worker parsing + progress
  - preview + error reporting
- CSV export
- Local persistence via Zustand + localStorage

## Install & Run

```bash
npm i
npm run dev
```

## Extend ideas

- Multi-device sync (add backend + auth)
- Spaced repetition (SM-2)
- Deck sharing via export/import JSON
- PWA offline support

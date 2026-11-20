# echoflash

Flashcard web app (React 18 + TypeScript + Vite + Tailwind). Multiple decks, card CRUD with tags, search/tag filter, study mode (flip, shuffle, know / don't know, keyboard shortcuts), CSV import (worker parsing, preview, error report) and export. All data is client-side: no backend.

## Commands
- `npm i`, `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build`), `npm run preview`
- No test runner and no lint script configured.

## Layout (`src/`)
- `routes/` DecksPage, DeckPage, StudyPage, NotFoundPage. Routes: `/` redirects to `/decks`, `/decks/:deckId`, `/decks/:deckId/study`.
- `store/useAppStore.ts` single Zustand store with `persist` middleware (decks, cards, study sessions).
- `lib/` csv.ts (PapaParse), storage.ts (`STORAGE_KEY = "echoflashs_app_v1"`, `safeJsonParse`), download.ts, cn.ts, utils.ts
- `components/` small UI kit (Button, Input, Modal, ConfirmDialog...) plus CardEditorModal, CardRow, DeckCard, StudyCard, CsvImportModal, TagPills
- `types/index.ts` shared types

## Conventions and gotchas
- Persistence is localStorage via Zustand `persist` (name = STORAGE_KEY, version 1). Changing the stored shape needs a version bump and a migration, or users lose data.
- The flashcard type in `types/index.ts` is named `echoflash` (lowercase), not `Card`. It looks like a rename artifact; use it as-is unless you do the rename everywhere.
- Libraries: framer-motion (flip animation), nanoid (ids), papaparse (CSV), react-hot-toast, lucide-react, zustand.
- `.gitignore` covers node_modules, dist, .env*, tsbuildinfo. CSV export uses `escapeFormulae`. react-router-dom 6 has open advisories (open redirect, SSR-only issue) fixable only by upgrading to v7.

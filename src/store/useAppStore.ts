import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Deck, echoflash, DeckId, CardId, StudySession, StudyMark } from "../types";
import { STORAGE_KEY } from "../lib/storage";
import { clamp } from "../lib/utils";

type AppState = {
  decks: Record<DeckId, Deck>;
  cards: Record<CardId, echoflash>;
  study: Record<DeckId, StudySession | undefined>;

  getDeckCards: (deckId: DeckId) => echoflash[];

  createDeck: (name: string) => DeckId;
  renameDeck: (deckId: DeckId, name: string) => void;
  deleteDeck: (deckId: DeckId) => void;

  createCard: (deckId: DeckId, data: { question: string; answer: string; tags: string[] }) => CardId;
  updateCard: (cardId: CardId, data: { question: string; answer: string; tags: string[] }) => void;
  deleteCard: (cardId: CardId) => void;
  bulkAddCards: (deckId: DeckId, rows: { question: string; answer: string; tags?: string[] }[]) => number;

  startStudy: (deckId: DeckId, cardIds: CardId[], shuffled: boolean) => void;
  toggleFlip: (deckId: DeckId) => void;
  nextCard: (deckId: DeckId) => void;
  prevCard: (deckId: DeckId) => void;
  shuffleStudy: (deckId: DeckId) => void;
  markCard: (deckId: DeckId, cardId: CardId, mark: StudyMark) => void;
  resetMarks: (deckId: DeckId) => void;
};

function now() {
  return Date.now();
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      decks: {},
      cards: {},
      study: {},

      getDeckCards: (deckId) => {
        const { cards } = get();
        return Object.values(cards)
          .filter((c) => c.deckId === deckId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      createDeck: (name) => {
        const id = nanoid();
        const deck: Deck = { id, name: name.trim() || "Untitled Deck", createdAt: now(), updatedAt: now() };
        set((s) => ({ decks: { ...s.decks, [id]: deck } }));
        return id;
      },

      renameDeck: (deckId, name) => {
        set((s) => {
          const d = s.decks[deckId];
          if (!d) return s;
          return {
            decks: {
              ...s.decks,
              [deckId]: { ...d, name: name.trim() || d.name, updatedAt: now() },
            },
          };
        });
      },

      deleteDeck: (deckId) => {
        set((s) => {
          const decks = { ...s.decks };
          delete decks[deckId];

          const cards = { ...s.cards };
          for (const [id, c] of Object.entries(cards)) {
            if (c.deckId === deckId) delete cards[id];
          }

          const study = { ...s.study };
          delete study[deckId];

          return { decks, cards, study };
        });
      },

      createCard: (deckId, data) => {
        const id = nanoid();
        const card: echoflash = {
          id,
          deckId,
          question: data.question.trim(),
          answer: data.answer.trim(),
          tags: data.tags ?? [],
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ cards: { ...s.cards, [id]: card } }));
        return id;
      },

      updateCard: (cardId, data) => {
        set((s) => {
          const c = s.cards[cardId];
          if (!c) return s;
          return {
            cards: {
              ...s.cards,
              [cardId]: {
                ...c,
                question: data.question.trim(),
                answer: data.answer.trim(),
                tags: data.tags ?? [],
                updatedAt: now(),
              },
            },
          };
        });
      },

      deleteCard: (cardId) => {
        set((s) => {
          const cards = { ...s.cards };
          delete cards[cardId];

          const study = { ...s.study };
          for (const deckId of Object.keys(study)) {
            const sess = study[deckId];
            if (!sess) continue;
            if (sess.marks[cardId]) {
              const marks = { ...sess.marks };
              delete marks[cardId];
              study[deckId] = { ...sess, marks, updatedAt: now() };
            }
            if (sess.order.includes(cardId)) {
              const order = sess.order.filter((x) => x !== cardId);
              const index = clamp(sess.index, 0, Math.max(0, order.length - 1));
              study[deckId] = { ...sess, order, index, updatedAt: now() };
            }
          }

          return { cards, study };
        });
      },

      bulkAddCards: (deckId, rows) => {
        const created: Record<CardId, echoflash> = {};
        for (const r of rows) {
          const q = r.question.trim();
          const a = r.answer.trim();
          if (!q || !a) continue;
          const id = nanoid();
          created[id] = {
            id,
            deckId,
            question: q,
            answer: a,
            tags: r.tags ?? [],
            createdAt: now(),
            updatedAt: now(),
          };
        }
        set((s) => ({ cards: { ...s.cards, ...created } }));
        return Object.keys(created).length;
      },

      startStudy: (deckId, cardIds, shuffled) => {
        const order = shuffled ? shuffle(cardIds) : [...cardIds];
        const session: StudySession = {
          deckId,
          startedAt: now(),
          updatedAt: now(),
          order,
          index: 0,
          flipped: false,
          marks: {},
        };
        set((s) => ({ study: { ...s.study, [deckId]: session } }));
      },

      toggleFlip: (deckId) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          return { study: { ...s.study, [deckId]: { ...sess, flipped: !sess.flipped, updatedAt: now() } } };
        });
      },

      nextCard: (deckId) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          const next = clamp(sess.index + 1, 0, Math.max(0, sess.order.length - 1));
          return {
            study: {
              ...s.study,
              [deckId]: { ...sess, index: next, flipped: false, updatedAt: now() },
            },
          };
        });
      },

      prevCard: (deckId) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          const prev = clamp(sess.index - 1, 0, Math.max(0, sess.order.length - 1));
          return {
            study: {
              ...s.study,
              [deckId]: { ...s.study[deckId]!, index: prev, flipped: false, updatedAt: now() },
            },
          };
        });
      },

      shuffleStudy: (deckId) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          const order = shuffle(sess.order);
          return { study: { ...s.study, [deckId]: { ...sess, order, index: 0, flipped: false, updatedAt: now() } } };
        });
      },

      markCard: (deckId, cardId, mark) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          return {
            study: {
              ...s.study,
              [deckId]: {
                ...sess,
                marks: { ...sess.marks, [cardId]: mark },
                updatedAt: now(),
              },
            },
          };
        });
      },

      resetMarks: (deckId) => {
        set((s) => {
          const sess = s.study[deckId];
          if (!sess) return s;
          return { study: { ...s.study, [deckId]: { ...sess, marks: {}, updatedAt: now() } } };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (s) => ({ decks: s.decks, cards: s.cards, study: s.study }),
    }
  )
);

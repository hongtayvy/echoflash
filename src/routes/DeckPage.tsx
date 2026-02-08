import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Download, Plus, Upload, Play, Shuffle, Search } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import CardRow from "../components/CardRow";
import CardEditorModal from "../components/CardEditorModal";
import ConfirmDialog from "../components/ConfirmDialog";
import CsvImportModal from "../components/CsvImportModal";
import { useAppStore } from "../store/useAppStore";
import { containsText, uniq } from "../lib/utils";
import { toechoflashsCsv } from "../lib/csv";
import { downloadText } from "../lib/download";
import type { echoflash } from "../types";

export default function DeckPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = useAppStore((s) => (deckId ? s.decks[deckId] : undefined));
  const cards = useAppStore((s) => (deckId ? s.getDeckCards(deckId) : []));
  const createCard = useAppStore((s) => s.createCard);
  const updateCard = useAppStore((s) => s.updateCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const bulkAddCards = useAppStore((s) => s.bulkAddCards);
  const startStudy = useAppStore((s) => s.startStudy);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<echoflash | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<{ open: boolean; id?: string }>({ open: false });

  const [importOpen, setImportOpen] = useState(false);

  const allTags = useMemo(() => {
    const t = cards.flatMap((c) => c.tags);
    return uniq(t).sort();
  }, [cards]);

  const filtered = useMemo(() => {
    const q = search.trim();
    return cards.filter((c) => {
      const matchesText =
        !q || containsText(c.question, q) || containsText(c.answer, q) || c.tags.some((t) => containsText(t, q));
      const matchesTag = !tagFilter || c.tags.includes(tagFilter);
      return matchesText && matchesTag;
    });
  }, [cards, search, tagFilter]);

  if (!deckId || !deck) {
    return (
      <EmptyState
        title="Deck not found"
        subtitle="This deck may have been deleted."
        action={
          <Link to="/decks">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to decks
            </Button>
          </Link>
        }
      />
    );
  }

  const exportCsv = () => {
    const csv = toechoflashsCsv(cards.map((c) => ({ question: c.question, answer: c.answer, tags: c.tags })));
    downloadText(`${deck.name.replace(/[^\w\-]+/g, "_")}.csv`, csv, "text/csv");
    toast.success("Exported CSV");
  };

  const beginStudy = (shuffled: boolean) => {
    const ids = filtered.map((c) => c.id);
    if (ids.length === 0) {
      toast.error("No cards to study");
      return;
    }
    startStudy(deckId, ids, shuffled);
    navigate(`/decks/${deckId}/study`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/decks" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="mt-2 text-xl font-semibold">{deck.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {cards.length} card{cards.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="secondary" onClick={() => beginStudy(true)}>
            <Shuffle className="h-4 w-4" /> Study (Shuffle)
          </Button>
          <Button onClick={() => beginStudy(false)}>
            <Play className="h-4 w-4" /> Study
          </Button>
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }}>
            <Plus className="h-4 w-4" /> Add card
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-soft">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question, answer, tags…"
            className="w-full bg-transparent text-sm"
          />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Tag filter</div>
            <Button variant="ghost" size="sm" onClick={() => setTagFilter(null)} disabled={!tagFilter}>
              Clear
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <div className="text-sm text-zinc-500">No tags yet</div>
            ) : (
              allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    tagFilter === t
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                >
                  #{t}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={cards.length === 0 ? "No cards yet" : "No matching cards"}
          subtitle={cards.length === 0 ? "Add a card or import from CSV to get started." : "Try clearing filters/search."}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" /> Import CSV
              </Button>
              <Button onClick={() => { setEditing(null); setEditorOpen(true); }}>
                <Plus className="h-4 w-4" /> Add card
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CardRow
              key={c.id}
              card={c}
              onEdit={() => {
                setEditing(c);
                setEditorOpen(true);
              }}
              onDelete={() => setDeleteOpen({ open: true, id: c.id })}
            />
          ))}
        </div>
      )}

      <CardEditorModal
        open={editorOpen}
        mode={editing ? "edit" : "create"}
        initial={editing ? { question: editing.question, answer: editing.answer, tags: editing.tags } : undefined}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => {
          if (editing) {
            updateCard(editing.id, data);
            toast.success("Card updated");
          } else {
            createCard(deckId, data);
            toast.success("Card created");
          }
          setEditorOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleteOpen.open}
        title="Delete card?"
        description="This will permanently remove this card."
        destructive
        confirmText="Delete"
        onClose={() => setDeleteOpen({ open: false })}
        onConfirm={() => {
          if (!deleteOpen.id) return;
          deleteCard(deleteOpen.id);
          toast.success("Card deleted");
          setDeleteOpen({ open: false });
        }}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(rows) => {
          const added = bulkAddCards(deckId, rows);
          toast.success(`Imported ${added} card${added === 1 ? "" : "s"}`);
          setImportOpen(false);
        }}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/Button";
import Input from "../components/Input";
import DeckCard from "../components/DeckCard";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useAppStore } from "../store/useAppStore";

export default function DecksPage() {
  const navigate = useNavigate();
  const decks = useAppStore((s) => Object.values(s.decks).sort((a, b) => b.updatedAt - a.updatedAt));
  const cards = useAppStore((s) => s.cards);
  const createDeck = useAppStore((s) => s.createDeck);
  const deleteDeck = useAppStore((s) => s.deleteDeck);
  const renameDeck = useAppStore((s) => s.renameDeck);

  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");

  const [renameOpen, setRenameOpen] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });
  const [deleteOpen, setDeleteOpen] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of Object.values(cards)) map[c.deckId] = (map[c.deckId] ?? 0) + 1;
    return map;
  }, [cards]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return decks;
    return decks.filter((d) => d.name.toLowerCase().includes(needle));
  }, [decks, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Decks</h1>
          <p className="mt-1 text-sm text-zinc-600">Create decks, add cards, and study with keyboard shortcuts.</p>
        </div>
        <Button onClick={() => { setCreateOpen(true); setName(""); }}>
          <Plus className="h-4 w-4" /> New deck
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search decks…"
          className="w-full bg-transparent text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={decks.length === 0 ? "No decks yet" : "No matches"}
          subtitle={decks.length === 0 ? "Create your first deck and add a few cards." : "Try a different search."}
          action={
            <Button onClick={() => { setCreateOpen(true); setName(""); }}>
              <Plus className="h-4 w-4" /> New deck
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((d) => (
            <div key={d.id} className="relative">
              <DeckCard deck={d} count={counts[d.id] ?? 0} />
              <div className="mt-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRenameOpen({ open: true, id: d.id, name: d.name })}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteOpen({ open: true, id: d.id, name: d.name })}
                >
                  <span className="text-rose-600">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        title="Create deck"
        description="Name it something memorable."
        onClose={() => setCreateOpen(false)}
        maxWidthClass="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const id = createDeck(name);
                toast.success("Deck created");
                setCreateOpen(false);
                navigate(`/decks/${id}`);
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Deck name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Java Interview" />
        </div>
      </Modal>

      <Modal
        open={renameOpen.open}
        title="Rename deck"
        onClose={() => setRenameOpen({ open: false })}
        maxWidthClass="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameOpen({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!renameOpen.id) return;
                renameDeck(renameOpen.id, renameOpen.name ?? "");
                toast.success("Deck renamed");
                setRenameOpen({ open: false });
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">New name</label>
          <Input
            value={renameOpen.name ?? ""}
            onChange={(e) => setRenameOpen((s) => ({ ...s, name: e.target.value }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen.open}
        title="Delete deck?"
        description={`This will permanently remove "${deleteOpen.name ?? ""}" and all its cards.`}
        destructive
        confirmText="Delete"
        onClose={() => setDeleteOpen({ open: false })}
        onConfirm={() => {
          if (!deleteOpen.id) return;
          deleteDeck(deleteOpen.id);
          toast.success("Deck deleted");
          setDeleteOpen({ open: false });
        }}
      />
    </div>
  );
}

import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Shuffle, CheckCircle2, XCircle } from "lucide-react";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import StudyCard from "../components/StudyCard";
import Kbd from "../components/Kbd";
import { useAppStore } from "../store/useAppStore";

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const deck = useAppStore((s) => (deckId ? s.decks[deckId] : undefined));
  const cardsById = useAppStore((s) => s.cards);
  const session = useAppStore((s) => (deckId ? s.study[deckId] : undefined));

  const toggleFlip = useAppStore((s) => s.toggleFlip);
  const nextCard = useAppStore((s) => s.nextCard);
  const prevCard = useAppStore((s) => s.prevCard);
  const shuffleStudy = useAppStore((s) => s.shuffleStudy);
  const markCard = useAppStore((s) => s.markCard);
  const resetMarks = useAppStore((s) => s.resetMarks);

  const card = useMemo(() => {
    if (!deckId || !session) return null;
    const id = session.order[session.index];
    return id ? cardsById[id] : null;
  }, [cardsById, deckId, session]);

  const stats = useMemo(() => {
    if (!session) return { known: 0, dont: 0, total: 0, remaining: 0 };
    const marks = Object.values(session.marks);
    const known = marks.filter((m) => m === "know").length;
    const dont = marks.filter((m) => m === "dontknow").length;
    const total = session.order.length;
    const remaining = total - (known + dont);
    return { known, dont, total, remaining };
  }, [session]);

  useEffect(() => {
    if (!deckId) return;
    if (!deck) return;
    if (!session) {
      toast("Start a study session from the deck page.");
      navigate(`/decks/${deckId}`);
    }
  }, [deck, deckId, navigate, session]);

  useEffect(() => {
    if (!deckId || !session) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || (target as any).isContentEditable);
      if (typing) return;

      if (e.code === "Space") {
        e.preventDefault();
        toggleFlip(deckId);
      } else if (e.code === "ArrowRight") {
        nextCard(deckId);
      } else if (e.code === "ArrowLeft") {
        prevCard(deckId);
      } else if (e.key.toLowerCase() === "s") {
        shuffleStudy(deckId);
      } else if (e.key.toLowerCase() === "k" && card) {
        markCard(deckId, card.id, "know");
        nextCard(deckId);
      } else if (e.key.toLowerCase() === "d" && card) {
        markCard(deckId, card.id, "dontknow");
        nextCard(deckId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, deckId, markCard, nextCard, prevCard, session, shuffleStudy, toggleFlip]);

  if (!deckId || !deck) {
    return (
      <EmptyState
        title="Deck not found"
        subtitle="This deck may have been deleted."
        action={
          <Link to="/decks">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back to decks
            </Button>
          </Link>
        }
      />
    );
  }

  if (!session || session.order.length === 0) {
    return (
      <EmptyState
        title="No cards to study"
        subtitle="Add cards to this deck first."
        action={
          <Link to={`/decks/${deckId}`}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Back to deck
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={`/decks/${deckId}`} className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            Back to deck
          </Link>
          <h1 className="mt-2 text-xl font-semibold">Study: {deck.name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Card {session.index + 1} of {session.order.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => shuffleStudy(deckId)}>
            <Shuffle className="h-4 w-4" /> Shuffle
          </Button>
          <Button variant="secondary" onClick={() => resetMarks(deckId)}>
            Reset marks
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
          <div className="text-xs font-semibold text-zinc-500">KNOWN</div>
          <div className="mt-1 text-2xl font-semibold">{stats.known}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
          <div className="text-xs font-semibold text-zinc-500">DON’T KNOW</div>
          <div className="mt-1 text-2xl font-semibold">{stats.dont}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
          <div className="text-xs font-semibold text-zinc-500">REMAINING</div>
          <div className="mt-1 text-2xl font-semibold">{stats.remaining}</div>
        </div>
      </div>

      {card && (
        <StudyCard
          flipped={session.flipped}
          front={card.question}
          back={card.answer}
          onFlip={() => toggleFlip(deckId)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => prevCard(deckId)}>
            Prev <span className="hidden sm:inline"><Kbd>←</Kbd></span>
          </Button>
          <Button variant="secondary" onClick={() => nextCard(deckId)}>
            Next <span className="hidden sm:inline"><Kbd>→</Kbd></span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (!card) return;
              markCard(deckId, card.id, "dontknow");
              nextCard(deckId);
            }}
          >
            <XCircle className="h-4 w-4" /> Don’t know <span className="hidden sm:inline"><Kbd>D</Kbd></span>
          </Button>
          <Button
            onClick={() => {
              if (!card) return;
              markCard(deckId, card.id, "know");
              nextCard(deckId);
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Know <span className="hidden sm:inline"><Kbd>K</Kbd></span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-soft">
        <div className="font-semibold">Keyboard shortcuts</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
          <span><Kbd>Space</Kbd> flip</span>
          <span><Kbd>←</Kbd>/<Kbd>→</Kbd> prev/next</span>
          <span><Kbd>S</Kbd> shuffle</span>
          <span><Kbd>K</Kbd> know</span>
          <span><Kbd>D</Kbd> don’t know</span>
        </div>
      </div>
    </div>
  );
}

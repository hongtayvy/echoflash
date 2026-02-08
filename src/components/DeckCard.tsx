import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Deck } from "../types";

export default function DeckCard({ deck, count }: { deck: Deck; count: number }) {
  return (
    <Link
      to={`/decks/${deck.id}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft transition hover:-translate-y-[1px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{deck.name}</h3>
          <p className="mt-1 text-sm text-zinc-600">{count} card{count === 1 ? "" : "s"}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700" />
      </div>
    </Link>
  );
}

import { Pencil, Trash2 } from "lucide-react";
import Button from "./Button";
import TagPills from "./TagPills";
import type { echoflash } from "../types";

export default function CardRow({
  card,
  onEdit,
  onDelete,
}: {
  card: echoflash;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Q</div>
          <div className="mt-1 line-clamp-3 text-sm text-zinc-800">{card.question}</div>
          <div className="mt-3 text-sm font-semibold">A</div>
          <div className="mt-1 line-clamp-4 text-sm text-zinc-700">{card.answer}</div>
          <TagPills tags={card.tags} />
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit} aria-label="Edit card">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete card">
            <Trash2 className="h-4 w-4 text-rose-600" />
            <span className="text-rose-600">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

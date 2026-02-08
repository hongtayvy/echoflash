export default function TagPills({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.slice(0, 6).map((t) => (
        <span key={t} className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
          #{t}
        </span>
      ))}
      {tags.length > 6 && (
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
          +{tags.length - 6}
        </span>
      )}
    </div>
  );
}

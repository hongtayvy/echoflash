export default function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700">
      {children}
    </kbd>
  );
}

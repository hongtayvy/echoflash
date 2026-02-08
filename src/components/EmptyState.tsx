export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto max-w-md">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

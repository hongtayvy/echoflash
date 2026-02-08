import { cn } from "../lib/cn";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm placeholder:text-zinc-400",
        className
      )}
      {...props}
    />
  );
}

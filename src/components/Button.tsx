import { cn } from "../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export default function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-soft",
    secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-soft",
    danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-soft",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
  };
  return <button className={cn(base, sizes, variants[variant], className)} {...props} />;
}

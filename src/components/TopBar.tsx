import { Link, NavLink } from "react-router-dom";
import { Layers } from "lucide-react";
import { cn } from "../lib/cn";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/decks" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-soft">
            <Layers className="h-4 w-4" />
          </span>
          <span>EchoFlash</span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/decks"
            className={({ isActive }) =>
              cn(
                "rounded-xl px-3 py-2 text-sm font-medium",
                isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
              )
            }
          >
            Decks
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

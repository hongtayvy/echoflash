import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/cn";

export default function StudyCard({
  flipped,
  front,
  back,
  onFlip,
}: {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  onFlip: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <button
      onClick={onFlip}
      className={cn(
        "relative w-full rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-soft",
        "min-h-[240px] sm:min-h-[320px]"
      )}
      aria-label="Flip card"
    >
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
        className="relative"
      >
        <div style={{ backfaceVisibility: "hidden" }}>
          <div className="text-xs font-semibold text-zinc-500">QUESTION</div>
          <div className="mt-3 text-lg font-semibold text-zinc-900">{front}</div>
          <div className="mt-6 text-xs text-zinc-500">Click or press Space to flip</div>
        </div>

        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-xs font-semibold text-zinc-500">ANSWER</div>
          <div className="mt-3 text-base text-zinc-800">{back}</div>
          <div className="mt-6 text-xs text-zinc-500">Click or press Space to flip back</div>
        </div>
      </motion.div>
    </button>
  );
}

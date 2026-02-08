import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Button from "./Button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-xl",
}: Props) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-zinc-900/40" onClick={onClose} />
          <motion.div
            className={`relative w-full ${maxWidthClass} rounded-2xl bg-white shadow-soft`}
            initial={reduced ? { y: 0, scale: 1 } : { y: 14, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduced ? { y: 0, scale: 1 } : { y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5">
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
              </div>
              <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5">{children}</div>

            {footer && <div className="flex items-center justify-end gap-2 border-t border-zinc-100 p-5">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

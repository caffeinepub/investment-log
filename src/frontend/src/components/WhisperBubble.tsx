import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface WhisperBubbleProps {
  phrase: string | null;
  onDone: () => void;
}

export function WhisperBubble({ phrase, onDone }: WhisperBubbleProps) {
  useEffect(() => {
    if (!phrase) return;
    // Scale timeout by phrase length for comfortable reading
    const duration = Math.max(3500, phrase.length * 80);
    const timer = setTimeout(() => {
      onDone();
    }, duration);
    return () => clearTimeout(timer);
  }, [phrase, onDone]);

  return (
    <AnimatePresence>
      {phrase && (
        <motion.div
          key={phrase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none flex justify-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            className="inline-block px-4 py-2 rounded-2xl text-sm leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              color: "oklch(0.82 0.06 78)",
              fontStyle: "italic",
              letterSpacing: "0.01em",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {phrase}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

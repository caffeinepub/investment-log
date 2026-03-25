import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface WhisperBubbleProps {
  phrase: string | null;
  onDone: () => void;
}

export function WhisperBubble({ phrase, onDone }: WhisperBubbleProps) {
  useEffect(() => {
    if (!phrase) return;
    const timer = setTimeout(() => {
      onDone();
    }, 4000);
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
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(6px)",
              color: "#5a5a6a",
              fontStyle: "italic",
              letterSpacing: "0.01em",
              boxShadow: "0 1px 8px 0 rgba(0,0,0,0.06)",
              border: "1px solid rgba(200,200,220,0.35)",
            }}
          >
            {phrase}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

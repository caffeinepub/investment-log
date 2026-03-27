import { type ZenPhrase, pickRandomZenPhrase } from "@/lib/zenPhrases";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  isReady: boolean;
  onDone: () => void;
};

export default function ZenLoadingScreen({ isReady, onDone }: Props) {
  const [phrase] = useState<ZenPhrase>(() => pickRandomZenPhrase());
  const [visible, setVisible] = useState(true);
  const timerDoneRef = useRef(false);
  const readyRef = useRef(isReady);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Track readiness separately so we can react when it becomes true
  useEffect(() => {
    readyRef.current = isReady;
    if (isReady && timerDoneRef.current) {
      setVisible(false);
    }
  }, [isReady]);

  // 3-second minimum timer
  useEffect(() => {
    const id = setTimeout(() => {
      timerDoneRef.current = true;
      if (readyRef.current) {
        setVisible(false);
      }
    }, 3000);
    return () => clearTimeout(id);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => onDoneRef.current()}>
      {visible && (
        <motion.div
          key="zen-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5f2ee]"
          data-ocid="zen_loader.panel"
        >
          <div className="flex flex-col items-center gap-5 px-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl font-light tracking-[0.15em] text-stone-700"
              style={{
                fontFamily:
                  "'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif",
              }}
            >
              {phrase.kanji}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-xs tracking-widest text-stone-400"
            >
              {phrase.reading}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.7 }}
              className="mt-2 text-sm leading-relaxed text-stone-500"
              style={{
                fontFamily:
                  "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
              }}
            >
              {phrase.description}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

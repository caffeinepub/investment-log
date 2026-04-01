import { useLanguage } from "@/i18n";
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
  const { lang } = useLanguage();

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    readyRef.current = isReady;
    if (isReady && timerDoneRef.current) {
      setVisible(false);
    }
  }, [isReady]);

  // 3秒最低表示、5秒で強制終了
  useEffect(() => {
    const minTimer = setTimeout(() => {
      timerDoneRef.current = true;
      if (readyRef.current) {
        setVisible(false);
      }
    }, 3000);

    const maxTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  const displayQuote = lang === "en" ? phrase.quoteEn : phrase.quote;
  const displayAuthor = lang === "en" ? phrase.authorEn : phrase.author;

  return (
    <AnimatePresence onExitComplete={() => onDoneRef.current()}>
      {visible && (
        <motion.div
          key="zen-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          data-ocid="zen_loader.panel"
        >
          <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-2xl font-light leading-relaxed tracking-wide text-foreground/90"
              style={{
                fontFamily:
                  lang === "en"
                    ? "'Cormorant Garamond', Georgia, serif"
                    : "'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif",
                whiteSpace: "pre-line",
              }}
            >
              {displayQuote}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="text-xs text-muted-foreground tracking-wider"
              style={{
                fontFamily:
                  "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
              }}
            >
              — {displayAuthor}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

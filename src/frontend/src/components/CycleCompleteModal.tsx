import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

interface CycleCompleteModalProps {
  open: boolean;
  onStayHere: () => void;
  onNextCycle: () => void;
}

export default function CycleCompleteModal({
  open,
  onStayHere,
  onNextCycle,
}: CycleCompleteModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-ocid="cycle_complete.modal"
        >
          <motion.div
            className="bg-card rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <motion.p
              className="text-4xl mb-4"
              animate={{ rotate: [0, 10, -10, 6, -6, 0] }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              ✦
            </motion.p>
            <h2 className="text-xl font-bold text-foreground mb-3">
              実がなりました
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              この木との旅が、ひとつの実を結びました。
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onStayHere}
                className="w-full rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                data-ocid="cycle_complete.stay_button"
              >
                もう少しここにいる
              </Button>
              <Button
                onClick={onNextCycle}
                variant="outline"
                className="w-full rounded-xl h-11 font-medium"
                data-ocid="cycle_complete.next_button"
              >
                次の旅へ
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

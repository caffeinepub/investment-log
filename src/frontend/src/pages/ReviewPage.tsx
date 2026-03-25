import type { MeditationRecordWithId } from "@/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

interface ReviewPageProps {
  records: MeditationRecordWithId[];
  totalMinutes: bigint;
}

export default function ReviewPage({ records, totalMinutes }: ReviewPageProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthRecords = records.filter((r) =>
    r.record.date.startsWith(monthPrefix),
  );
  const monthMinutes = monthRecords.reduce(
    (sum, r) => sum + Number(r.record.duration),
    0,
  );
  const monthSessions = monthRecords.length;

  // Build a set of day numbers that have records this month
  const recordedDays = new Set(
    monthRecords.map((r) => Number(r.record.date.slice(8, 10))),
  );

  const { firstDay, daysInMonth } = getMonthDays(year, month);

  // Build calendar cells: leading empty + day numbers
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Memos: records with non-empty memo, sorted newest first
  const memoRecords = [...records]
    .filter((r) => r.record.memo.trim().length > 0)
    .sort((a, b) => {
      const dc = b.record.date.localeCompare(a.record.date);
      return dc !== 0 ? dc : Number(b.id - a.id);
    });

  function formatMonthMinutes(m: number): string {
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `${h}時間${rem}分` : `${h}時間`;
    }
    return `${m}分`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Monthly summary */}
      <Card className="rounded-2xl shadow-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            {year}年{month + 1}月のまとめ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="bg-secondary rounded-xl p-4 text-center"
              data-ocid="review.month_minutes.card"
            >
              <p className="text-xs text-muted-foreground mb-1">瞑想時間</p>
              <p className="text-2xl font-bold text-primary">
                {formatMonthMinutes(monthMinutes)}
              </p>
            </div>
            <div
              className="bg-secondary rounded-xl p-4 text-center"
              data-ocid="review.month_sessions.card"
            >
              <p className="text-xs text-muted-foreground mb-1">記録回数</p>
              <p className="text-2xl font-bold text-primary">
                {monthSessions}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  回
                </span>
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              累計{" "}
              <span className="text-primary font-semibold">
                {Number(totalMinutes)}
              </span>{" "}
              分
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card
        className="rounded-2xl shadow-card border-0"
        data-ocid="review.calendar.card"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            カレンダー
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              const hasRecord = day !== null && recordedDays.has(day);
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear();
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static calendar
                  key={idx}
                  className="flex flex-col items-center py-1"
                >
                  {day !== null && (
                    <>
                      <span
                        className={`text-sm w-7 h-7 flex items-center justify-center rounded-full leading-none ${
                          isToday
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-opacity ${
                          hasRecord ? "bg-primary opacity-80" : "opacity-0"
                        }`}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Memo list */}
      <Card
        className="rounded-2xl shadow-card border-0"
        data-ocid="review.memos.card"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            最近のメモ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memoRecords.length === 0 ? (
            <div
              className="py-8 text-center"
              data-ocid="review.memos.empty_state"
            >
              <p className="text-2xl mb-2">📝</p>
              <p className="text-sm text-muted-foreground">
                まだメモがありません。
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                記録にメモを添えると、ここに表示されます。
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-80">
              <div className="space-y-3 pr-2">
                {memoRecords.map((item, idx) => (
                  <motion.div
                    key={String(item.id)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    data-ocid={`review.memos.item.${idx + 1}`}
                    className="bg-secondary/50 rounded-xl p-3"
                  >
                    <p className="text-xs font-semibold text-primary mb-1">
                      {item.record.date.slice(5).replace("-", "/")}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {Number(item.record.duration)}分
                      </span>
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {item.record.memo}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

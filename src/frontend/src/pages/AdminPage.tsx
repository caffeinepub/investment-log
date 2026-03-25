import { useGetAllFeedback, useGetVisitCount } from "@/hooks/useQueries";
import { useLanguage } from "@/i18n";

export default function AdminPage() {
  const { t } = useLanguage();
  const { data: visitCount } = useGetVisitCount();
  const { data: feedback, isLoading } = useGetAllFeedback();

  const sorted = [...(feedback ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-xl mx-auto">
      <h1 className="text-lg font-medium mb-8 text-muted-foreground">Admin</h1>

      {/* Visit count */}
      <section className="mb-10">
        <p className="text-xs text-muted-foreground mb-1">
          {t("adminVisitors")}
        </p>
        <p className="text-5xl font-light tabular-nums">
          {visitCount !== undefined ? visitCount.toString() : "—"}
        </p>
      </section>

      {/* Feedback list */}
      <section>
        <p className="text-xs text-muted-foreground mb-4">
          {t("adminFeedback")}
        </p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">…</p>
        ) : sorted.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.empty_state"
          >
            {t("adminNoFeedback")}
          </p>
        ) : (
          <ul className="space-y-4" data-ocid="admin.list">
            {sorted.map((entry: any, i: number) => {
              const ms = Number(entry.timestamp) / 1_000_000;
              const date = new Date(ms).toLocaleDateString();
              const name = entry.name?.trim() || t("adminAnonymous");
              return (
                <li
                  key={entry.id?.toString() ?? i}
                  data-ocid={`admin.item.${i + 1}`}
                  className="border-b border-border pb-4"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.message}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddInvestment,
  useDeleteInvestment,
  useGetInvestments,
} from "@/hooks/useQueries";
import { Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatCurrency(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(timestamp: bigint) {
  // Motoko Time is nanoseconds
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

export default function InvestmentLog() {
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{
    ticker?: string;
    price?: string;
    reason?: string;
  }>({});

  const { data: investments = [], isLoading } = useGetInvestments();
  const addMutation = useAddInvestment();
  const deleteMutation = useDeleteInvestment();

  function validate() {
    const errs: typeof errors = {};
    if (!ticker.trim()) errs.ticker = "Ticker symbol is required";
    const parsedPrice = Number.parseFloat(price);
    if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0)
      errs.price = "Enter a valid purchase price";
    if (!reason.trim()) errs.reason = "Reason is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await addMutation.mutateAsync({
        ticker: ticker.trim().toUpperCase(),
        price: Number.parseFloat(price),
        reason: reason.trim(),
      });
      setTicker("");
      setPrice("");
      setReason("");
      toast.success("Investment logged successfully!");
    } catch {
      toast.error("Failed to log investment. Please try again.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Investment removed.");
    } catch {
      toast.error("Failed to delete investment.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.19 0.04 255), oklch(0.13 0.03 255))",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            InvestLog
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Form Card */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-card rounded-lg border border-border shadow-card"
            data-ocid="form.panel"
          >
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-xl font-bold text-foreground">
                Record New Investment
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your trades and the reasoning behind them.
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="ticker"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Ticker Symbol
                  </Label>
                  <Input
                    id="ticker"
                    data-ocid="investment.input"
                    placeholder="e.g. ICP"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="uppercase placeholder:normal-case"
                    aria-invalid={!!errors.ticker}
                    aria-describedby={
                      errors.ticker ? "ticker-error" : undefined
                    }
                  />
                  {errors.ticker && (
                    <p
                      id="ticker-error"
                      className="text-xs text-destructive"
                      data-ocid="investment.error_state"
                    >
                      {errors.ticker}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="price"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Purchase Price (USD)
                  </Label>
                  <Input
                    id="price"
                    data-ocid="investment.price_input"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? "price-error" : undefined}
                  />
                  {errors.price && (
                    <p
                      id="price-error"
                      className="text-xs text-destructive"
                      data-ocid="investment.price_error_state"
                    >
                      {errors.price}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-5">
                <Label
                  htmlFor="reason"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Reason for Buying
                </Label>
                <Textarea
                  id="reason"
                  data-ocid="investment.textarea"
                  placeholder="Why are you making this investment?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? "reason-error" : undefined}
                />
                {errors.reason && (
                  <p
                    id="reason-error"
                    className="text-xs text-destructive"
                    data-ocid="investment.reason_error_state"
                  >
                    {errors.reason}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                data-ocid="investment.submit_button"
                disabled={addMutation.isPending}
                className="w-full font-semibold text-white"
                style={{
                  background: addMutation.isPending
                    ? undefined
                    : "linear-gradient(90deg, oklch(0.58 0.2 260), oklch(0.5 0.22 260))",
                }}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Investment
                  </>
                )}
              </Button>
              {addMutation.isPending && (
                <div data-ocid="investment.loading_state" className="sr-only">
                  Saving investment...
                </div>
              )}
            </form>
          </motion.section>

          {/* Entries Card */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            className="bg-card rounded-lg border border-border shadow-card"
            data-ocid="entries.panel"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Investment Entries
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {investments.length}{" "}
                  {investments.length === 1 ? "entry" : "entries"} recorded
                </p>
              </div>
            </div>

            {isLoading ? (
              <div
                className="p-6 flex flex-col gap-3"
                data-ocid="entries.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : investments.length === 0 ? (
              <div
                className="py-16 flex flex-col items-center text-center gap-3"
                data-ocid="entries.empty_state"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  No investments logged yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Use the form above to record your first trade.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="entries.table">
                  <TableHeader>
                    <TableRow
                      className="border-b border-border"
                      style={{ background: "oklch(var(--table-header))" }}
                    >
                      <TableHead className="w-28 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Ticker
                      </TableHead>
                      <TableHead className="w-36 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Price
                      </TableHead>
                      <TableHead className="w-36 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Reason
                      </TableHead>
                      <TableHead className="w-20 font-semibold text-xs uppercase tracking-wide text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {investments.map((inv, i) => (
                        <motion.tr
                          key={String(inv.id) + inv.ticker + inv.timestamp}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                          data-ocid={`entries.item.${i + 1}`}
                        >
                          <TableCell className="py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">
                              {inv.ticker}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 font-medium text-sm">
                            {formatCurrency(inv.price)}
                          </TableCell>
                          <TableCell className="py-3 text-sm text-muted-foreground">
                            {formatDate(inv.timestamp)}
                          </TableCell>
                          <TableCell className="py-3 text-sm text-foreground max-w-xs">
                            <span className="line-clamp-2">{inv.reason}</span>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              data-ocid={`entries.delete_button.${i + 1}`}
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(inv.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              aria-label={`Delete ${inv.ticker} investment`}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background:
            "linear-gradient(90deg, oklch(0.19 0.04 255), oklch(0.13 0.03 255))",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 text-center">
          <p className="text-sm" style={{ color: "oklch(0.7 0.02 250)" }}>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

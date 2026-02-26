import { LoanSummary } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/format";

interface SummaryCardsProps {
  summary: LoanSummary;
  currency: string;
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  return (
    <section className="summary-grid" aria-label="Loan summary">
      <article className="summary-card">
        <h3>Remaining Balance</h3>
        <p>{formatCurrency(summary.remaining_balance, currency)}</p>
      </article>
      <article className="summary-card">
        <h3>Total Paid</h3>
        <p>{formatCurrency(summary.total_paid_submitted, currency)}</p>
      </article>
      <article className="summary-card">
        <h3>Progress</h3>
        <p>{summary.progress_percent.toFixed(2)}%</p>
      </article>
      <article className="summary-card">
        <h3>Est. Completion</h3>
        <p>{formatDate(summary.estimated_completion_date)}</p>
      </article>
    </section>
  );
}

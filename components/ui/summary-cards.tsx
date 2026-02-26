import { LoanSummary } from "@/types/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Wallet, CheckCircle2, Gift, Calendar, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  summary: LoanSummary;
  currency: string;
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  const total = summary.total_amount;

  const submittedPct = total > 0 ? Math.min(100, (summary.total_paid_submitted / total) * 100) : 0;
  const approvedPct = total > 0 ? Math.min(100, (summary.total_paid_approved / total) * 100) : 0;

  return (
    <>
      <section className="summary-grid" aria-label="Loan summary">
        <article className="summary-card">
          <div className="summary-card-icon">
            <Wallet size={16} />
          </div>
          <h3>Remaining</h3>
          <p>{formatCurrency(summary.remaining_balance, currency)}</p>
        </article>

        <article className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: "var(--success-bg)", borderColor: "var(--success-border)", color: "var(--success-text)" }}
          >
            <CheckCircle2 size={16} />
          </div>
          <h3>Total Paid</h3>
          <p>{formatCurrency(summary.total_paid_submitted, currency)}</p>
        </article>

        <article className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: "var(--purple-bg)", borderColor: "var(--purple-border)", color: "var(--purple-text)" }}
          >
            <Gift size={16} />
          </div>
          <h3>Waived</h3>
          <p>{formatCurrency(summary.total_waived, currency)}</p>
        </article>

        <article className="summary-card">
          <div
            className="summary-card-icon"
            style={{ background: "var(--warning-bg)", borderColor: "var(--warning-border)", color: "var(--warning-text)" }}
          >
            <Calendar size={16} />
          </div>
          <h3>Est. Completion</h3>
          <p style={{ fontSize: "1rem" }}>{formatDate(summary.estimated_completion_date)}</p>
        </article>
      </section>

      <article className="summary-card progress-card" style={{ margin: "0 0 20px" }}>
        <div className="progress-card-header">
          <div className="progress-title">
            <TrendingUp size={14} />
            Repayment Progress
          </div>
          <span className="progress-total-label">of {formatCurrency(total, currency)}</span>
        </div>

        <div className="dual-progress">
          {/* Submitted bar */}
          <div className="progress-row">
            <div className="progress-row-header">
              <div className="progress-row-label">
                <span className="progress-dot progress-dot-submitted" />
                Submitted
              </div>
              <span className="progress-row-amount">{formatCurrency(summary.total_paid_submitted, currency)}</span>
              <span className="progress-row-pct">{submittedPct.toFixed(1)}%</span>
            </div>
            <div
              className="progress-track progress-track-submitted"
              role="progressbar"
              aria-valuenow={submittedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Submitted payments"
            >
              <div className="progress-fill progress-fill-submitted" style={{ width: `${submittedPct}%` }} />
            </div>
          </div>

          {/* Approved bar */}
          <div className="progress-row">
            <div className="progress-row-header">
              <div className="progress-row-label">
                <span className="progress-dot progress-dot-approved" />
                Approved
              </div>
              <span className="progress-row-amount">{formatCurrency(summary.total_paid_approved, currency)}</span>
              <span className="progress-row-pct">{approvedPct.toFixed(1)}%</span>
            </div>
            <div
              className="progress-track progress-track-approved"
              role="progressbar"
              aria-valuenow={approvedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Approved payments"
            >
              <div className="progress-fill progress-fill-approved" style={{ width: `${approvedPct}%` }} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

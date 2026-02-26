"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  approvePayment,
  createLoanWaiver,
  getProofURLByPublic,
  getPublicLoan,
  rejectPayment
} from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { SummaryCards } from "@/components/ui/summary-cards";
import { PaymentTable } from "@/components/ui/payment-table";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import {
  Loader2,
  Eye,
  Receipt,
  History,
  ShieldCheck,
  XCircle,
  Percent,
  ExternalLink,
  Archive,
  AlertTriangle
} from "lucide-react";

interface PublicLoanViewProps {
  publicToken: string;
}

const OTHER_WAIVER_VALUE = "__other_waiver_amount__";

function buildWaiverOptions(remaining: number, monthlyPlan: number): number[] {
  if (remaining <= 0) return [];
  const candidates = [monthlyPlan, remaining * 0.25, remaining * 0.5, remaining]
    .map((amount) => Number(amount.toFixed(2)))
    .filter((amount) => amount > 0 && amount <= remaining);
  return Array.from(new Set(candidates)).sort((a, b) => a - b);
}

function buildWaiverOptionLabel(amount: number, remaining: number, currency: string): string {
  if (remaining <= 0) return formatCurrency(amount, currency);
  const percent = (amount / remaining) * 100;
  const roundedPercent =
    Math.abs(percent - Math.round(percent)) < 0.05
      ? Math.round(percent).toString()
      : percent.toFixed(1).replace(/\.0$/, "");
  return `${formatCurrency(amount, currency)} (${roundedPercent}% waiver)`;
}

interface RejectDialogState {
  paymentId: string;
  reason: string;
}

export function PublicLoanView({ publicToken }: PublicLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [waiverSelection, setWaiverSelection] = useState<string>("");
  const [customWaiverAmount, setCustomWaiverAmount] = useState<string>("");
  const [waiverLoading, setWaiverLoading] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState | null>(null);
  const [rejectingLoading, setRejectingLoading] = useState(false);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getPublicLoan(publicToken);
      setLoan(response);
    } catch (loadError) {
      setLoadError(loadError instanceof Error ? loadError.message : "Failed to load loan");
    } finally {
      setLoading(false);
    }
  }, [publicToken]);

  useEffect(() => {
    void loadLoan();
  }, [loadLoan]);

  async function handleApprove(paymentID: string) {
    try {
      const updated = await approvePayment(publicToken, paymentID);
      setLoan(updated);
      toast.success("Payment approved successfully.");
    } catch (approveError) {
      toast.error(approveError instanceof Error ? approveError.message : "Failed to approve payment");
    }
  }

  function openRejectDialog(paymentID: string) {
    setRejectDialog({ paymentId: paymentID, reason: "" });
  }

  async function confirmReject() {
    if (!rejectDialog?.reason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setRejectingLoading(true);
    try {
      const updated = await rejectPayment(publicToken, rejectDialog.paymentId, rejectDialog.reason.trim());
      setLoan(updated);
      setRejectDialog(null);
      toast.success("Payment rejected.");
    } catch (rejectError) {
      toast.error(rejectError instanceof Error ? rejectError.message : "Failed to reject payment");
    } finally {
      setRejectingLoading(false);
    }
  }

  async function handleViewProof(paymentID: string) {
    try {
      const url = await getProofURLByPublic(publicToken, paymentID);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (proofError) {
      toast.error(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  const waiverOptions = useMemo(
    () => buildWaiverOptions(loan?.summary.remaining_balance ?? 0, loan?.loan.monthly_plan_amount ?? 0),
    [loan?.summary.remaining_balance, loan?.loan.monthly_plan_amount]
  );

  useEffect(() => {
    if (waiverOptions.length === 0) {
      setWaiverSelection("");
      setCustomWaiverAmount("");
      return;
    }
    setWaiverSelection((current) => {
      if (current === OTHER_WAIVER_VALUE) return current;
      if (current && waiverOptions.some((option) => option.toFixed(2) === current)) return current;
      return waiverOptions[0].toFixed(2);
    });
  }, [waiverOptions]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading">
          <Loader2 size={22} className="spin" />
          Loading loan details…
        </div>
      </main>
    );
  }

  if (loadError && !loan) {
    return (
      <main className="page-shell">
        <div className="error" style={{ marginTop: 0 }}>{loadError}</div>
      </main>
    );
  }

  if (!loan) {
    return (
      <main className="page-shell">
        <div className="error" style={{ marginTop: 0 }}>Loan not found.</div>
      </main>
    );
  }

  const currency = loan.loan.currency;
  const isCompleted = loan.loan.status === "completed";
  const remainingBalance = loan.summary.remaining_balance;
  const selectedWaiverAmount =
    waiverSelection === OTHER_WAIVER_VALUE ? Number(customWaiverAmount) : Number(waiverSelection);
  const waiverAmountIsValid =
    Number.isFinite(selectedWaiverAmount) && selectedWaiverAmount > 0 && selectedWaiverAmount <= remainingBalance;

  async function handleApplyWaiver() {
    if (!waiverAmountIsValid) {
      toast.error(`Waiver amount must be between 0 and ${formatCurrency(remainingBalance, currency)}.`);
      return;
    }
    setWaiverLoading(true);
    try {
      const updated = await createLoanWaiver(publicToken, { amount: selectedWaiverAmount });
      setLoan(updated);
      const nextOptions = buildWaiverOptions(updated.summary.remaining_balance, updated.loan.monthly_plan_amount);
      setWaiverSelection(nextOptions[0]?.toFixed(2) ?? "");
      setCustomWaiverAmount("");
      toast.success(`Waiver of ${formatCurrency(selectedWaiverAmount, currency)} applied.`);
    } catch (waiverError) {
      toast.error(waiverError instanceof Error ? waiverError.message : "Failed to apply waiver");
    } finally {
      setWaiverLoading(false);
    }
  }

  return (
    <>
      <main className="page-shell">
        <section className="hero compact">
          <p className="eyebrow">
            <Eye size={11} />
            Public Loan Review
          </p>
          <h1>Loan for {loan.loan.borrower_name}</h1>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="hero-meta-label">Balance</span>
              <span className="hero-meta-value">{formatCurrency(loan.summary.remaining_balance, currency)}</span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-label">Status</span>
              <span
                className={`hero-meta-value status-chip ${loan.loan.status}`}
                style={{ textTransform: "capitalize" }}
              >
                {loan.loan.status}
              </span>
            </div>
            <div className="hero-meta-item">
              <span className="hero-meta-label">Currency</span>
              <span className="hero-meta-value">{currency}</span>
            </div>
          </div>
        </section>

        <SummaryCards summary={loan.summary} currency={currency} />

        {!isCompleted && waiverOptions.length > 0 ? (
          <section className="panel">
            <h2>
              <Percent size={18} />
              Apply Loan Waiver
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "var(--ink-muted)" }}>
              Reduce the remaining balance by applying a partial or full waiver.
            </p>
            <div className="inline-actions waiver-actions">
              <select
                value={waiverSelection}
                onChange={(event) => setWaiverSelection(event.target.value)}
                aria-label="Waiver amount"
              >
                {waiverOptions.map((amount) => (
                  <option key={amount} value={amount.toFixed(2)}>
                    {buildWaiverOptionLabel(amount, remainingBalance, currency)}
                  </option>
                ))}
                <option value={OTHER_WAIVER_VALUE}>Other amount…</option>
              </select>
              {waiverSelection === OTHER_WAIVER_VALUE ? (
                <input
                  type="number"
                  min="0.01"
                  max={remainingBalance.toFixed(2)}
                  step="0.01"
                  inputMode="decimal"
                  placeholder={`Up to ${formatCurrency(remainingBalance, currency)}`}
                  aria-label="Other waiver amount"
                  value={customWaiverAmount}
                  onChange={(event) => setCustomWaiverAmount(event.target.value)}
                />
              ) : null}
              <button onClick={handleApplyWaiver} disabled={!waiverAmountIsValid || waiverLoading}>
                {waiverLoading ? <Loader2 size={15} className="spin" /> : <Percent size={15} />}
                {waiverLoading ? "Applying…" : "Apply Waiver"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="panel">
          <h2>
            <ShieldCheck size={18} />
            Payment Review
          </h2>
          <PaymentTable
            payments={loan.payments}
            currency={currency}
            onViewProof={handleViewProof}
            onApprove={isCompleted ? undefined : handleApprove}
            onReject={isCompleted ? undefined : openRejectDialog}
          />
        </section>

        <section className="panel">
          <h2>
            <History size={18} />
            Immutable Audit Log
          </h2>
          <AuditTimeline events={loan.audit_events} />
        </section>

        {isCompleted && loan.links.archive_url ? (
          <section className="panel">
            <h2>
              <Archive size={18} />
              Archived Read-Only Record
            </h2>
            <div className="result-link-box">
              <a href={loan.links.archive_url} target="_blank" rel="noreferrer">
                {loan.links.archive_url}
              </a>
              <a
                href={loan.links.archive_url}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--ink-muted)", display: "flex" }}
                data-tooltip="Open archive"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </section>
        ) : null}
      </main>

      {/* Rejection Dialog */}
      {rejectDialog ? (
        <div className="modal-overlay" onClick={() => !rejectingLoading && setRejectDialog(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
              Reject Payment
            </h3>
            <p>Provide a reason for rejecting this payment. The borrower will be notified.</p>
            <label>
              Rejection Reason
              <textarea
                rows={3}
                placeholder="e.g. Receipt is unclear, amount does not match…"
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog((prev) => prev ? { ...prev, reason: e.target.value } : null)}
                autoFocus
              />
            </label>
            <div className="modal-actions">
              <button
                className="neutral"
                onClick={() => setRejectDialog(null)}
                disabled={rejectingLoading}
              >
                Cancel
              </button>
              <button
                className="reject"
                onClick={confirmReject}
                disabled={rejectingLoading || !rejectDialog.reason.trim()}
              >
                {rejectingLoading ? <Loader2 size={15} className="spin" /> : <XCircle size={15} />}
                {rejectingLoading ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

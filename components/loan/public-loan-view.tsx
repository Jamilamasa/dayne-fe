"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approvePayment,
  getProofURLByPublic,
  getPublicLoan,
  rejectPayment
} from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { SummaryCards } from "@/components/ui/summary-cards";
import { PaymentTable } from "@/components/ui/payment-table";
import { AuditTimeline } from "@/components/ui/audit-timeline";

interface PublicLoanViewProps {
  publicToken: string;
}

export function PublicLoanView({ publicToken }: PublicLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicLoan(publicToken);
      setLoan(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load loan");
    } finally {
      setLoading(false);
    }
  }, [publicToken]);

  useEffect(() => {
    void loadLoan();
  }, [loadLoan]);

  async function handleApprove(paymentID: string) {
    setError(null);
    try {
      const updated = await approvePayment(publicToken, paymentID);
      setLoan(updated);
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Failed to approve payment");
    }
  }

  async function handleReject(paymentID: string) {
    const reason = window.prompt("Reason for rejecting this payment:");
    if (!reason) {
      return;
    }
    setError(null);
    try {
      const updated = await rejectPayment(publicToken, paymentID, reason);
      setLoan(updated);
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "Failed to reject payment");
    }
  }

  async function handleViewProof(paymentID: string) {
    try {
      const url = await getProofURLByPublic(publicToken, paymentID);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (proofError) {
      setError(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  if (loading) {
    return <p className="loading">Loading loan details...</p>;
  }

  if (error && !loan) {
    return <p className="error">{error}</p>;
  }

  if (!loan) {
    return <p className="error">Loan not found.</p>;
  }

  const currency = loan.loan.currency;
  const isCompleted = loan.loan.status === "completed";

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Public Loan Review</p>
        <h1>Loan for {loan.loan.borrower_name}</h1>
        <p>
          Current balance: <strong>{formatCurrency(loan.summary.remaining_balance, currency)}</strong>
        </p>
        <p>
          Status: <strong>{loan.loan.status}</strong>
        </p>
      </section>

      <SummaryCards summary={loan.summary} currency={currency} />

      <section className="panel">
        <h2>Payment Review Table</h2>
        <PaymentTable
          payments={loan.payments}
          currency={currency}
          onViewProof={handleViewProof}
          onApprove={isCompleted ? undefined : handleApprove}
          onReject={isCompleted ? undefined : handleReject}
        />
      </section>

      <section className="panel">
        <h2>Immutable Audit Log</h2>
        <AuditTimeline events={loan.audit_events} />
      </section>

      {isCompleted && loan.links.archive_url ? (
        <section className="panel">
          <h2>Archived Read-Only Record</h2>
          <a href={loan.links.archive_url} target="_blank" rel="noreferrer">
            {loan.links.archive_url}
          </a>
        </section>
      ) : null}

      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { getArchivedLoan, getProofURLByArchive } from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { SummaryCards } from "@/components/ui/summary-cards";
import { PaymentTable } from "@/components/ui/payment-table";
import { AuditTimeline } from "@/components/ui/audit-timeline";

interface ArchivedLoanViewProps {
  archivedToken: string;
}

export function ArchivedLoanView({ archivedToken }: ArchivedLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArchivedLoan(archivedToken);
      setLoan(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load archived loan");
    } finally {
      setLoading(false);
    }
  }, [archivedToken]);

  useEffect(() => {
    void loadLoan();
  }, [loadLoan]);

  async function handleViewProof(paymentID: string) {
    try {
      const url = await getProofURLByArchive(archivedToken, paymentID);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (proofError) {
      setError(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  if (loading) {
    return <p className="loading">Loading archived loan...</p>;
  }

  if (error && !loan) {
    return <p className="error">{error}</p>;
  }

  if (!loan) {
    return <p className="error">Archived loan not found.</p>;
  }

  const currency = loan.loan.currency;

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Archived Read-Only Loan</p>
        <h1>Completed Loan for {loan.loan.borrower_name}</h1>
        <p>
          Final balance: <strong>{formatCurrency(loan.summary.remaining_balance, currency)}</strong>
        </p>
      </section>

      <SummaryCards summary={loan.summary} currency={currency} />

      <section className="panel">
        <h2>Payments (Read-Only)</h2>
        <PaymentTable payments={loan.payments} currency={currency} onViewProof={handleViewProof} />
      </section>

      <section className="panel">
        <h2>Immutable Audit Log</h2>
        <AuditTimeline events={loan.audit_events} />
      </section>

      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}

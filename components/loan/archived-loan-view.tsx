"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getArchivedLoan, getProofURLByArchive } from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { SummaryCards } from "@/components/ui/summary-cards";
import { PaymentTable } from "@/components/ui/payment-table";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import { Loader2, Archive, Receipt, History, Lock } from "lucide-react";

interface ArchivedLoanViewProps {
  archivedToken: string;
}

export function ArchivedLoanView({ archivedToken }: ArchivedLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getArchivedLoan(archivedToken);
      setLoan(response);
    } catch (loadError) {
      setLoadError(loadError instanceof Error ? loadError.message : "Failed to load archived loan");
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
      toast.error(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <div className="loading">
          <Loader2 size={22} className="spin" />
          Loading archived loan…
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
        <div className="error" style={{ marginTop: 0 }}>Archived loan not found.</div>
      </main>
    );
  }

  const currency = loan.loan.currency;

  return (
    <main className="page-shell">
      <div className="archive-banner">
        <Lock size={15} />
        This is a completed, read-only archived loan record.
      </div>

      <section className="hero compact">
        <p className="eyebrow">
          <Archive size={11} />
          Archived Record
        </p>
        <h1>Completed Loan for {loan.loan.borrower_name}</h1>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Final Balance</span>
            <span className="hero-meta-value">{formatCurrency(loan.summary.remaining_balance, currency)}</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Status</span>
            <span className="hero-meta-value status-chip completed">Completed</span>
          </div>
        </div>
      </section>

      <SummaryCards summary={loan.summary} currency={currency} />

      <section className="panel">
        <h2>
          <Receipt size={18} />
          Payments (Read-Only)
        </h2>
        <PaymentTable payments={loan.payments} currency={currency} onViewProof={handleViewProof} />
      </section>

      <section className="panel">
        <h2>
          <History size={18} />
          Immutable Audit Log
        </h2>
        <AuditTimeline events={loan.audit_events} />
      </section>
    </main>
  );
}

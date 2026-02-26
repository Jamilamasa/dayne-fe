"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createPayment,
  getManageLoan,
  getProofURLByManage,
  presignProofUpload,
  uploadFileToPresignedURL
} from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { SummaryCards } from "@/components/ui/summary-cards";
import { PaymentTable } from "@/components/ui/payment-table";
import { AuditTimeline } from "@/components/ui/audit-timeline";

interface ManageLoanViewProps {
  manageToken: string;
}

export function ManageLoanView({ manageToken }: ManageLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getManageLoan(manageToken);
      setLoan(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load loan details");
    } finally {
      setLoading(false);
    }
  }, [manageToken]);

  useEffect(() => {
    void loadLoan();
  }, [loadLoan]);

  const currency = useMemo(() => loan?.loan.currency ?? "USD", [loan?.loan.currency]);
  const isCompleted = loan?.loan.status === "completed";

  async function handleViewProof(paymentID: string) {
    try {
      const url = await getProofURLByManage(manageToken, paymentID);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (proofError) {
      setError(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loan) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let proofObjectKey: string | undefined;
      let proofFilename: string | undefined;

      if (file) {
        const presign = await presignProofUpload(manageToken, {
          filename: file.name,
          content_type: file.type,
          size: file.size
        });
        await uploadFileToPresignedURL(presign.upload_url, file);
        proofObjectKey = presign.object_key;
        proofFilename = file.name;
      }

      const updated = await createPayment(manageToken, {
        amount: Number(amount),
        paid_at: paidAt,
        note: note || undefined,
        proof_object_key: proofObjectKey,
        proof_filename: proofFilename
      });
      setLoan(updated);
      setAmount("");
      setNote("");
      setFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
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

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Borrower Dashboard</p>
        <h1>{loan.loan.borrower_name}&apos;s Debt Tracker</h1>
        <p>
          Remaining: <strong>{formatCurrency(loan.summary.remaining_balance, currency)}</strong>
        </p>
        <p>
          Status: <strong>{loan.loan.status}</strong>
        </p>
      </section>

      <SummaryCards summary={loan.summary} currency={currency} />

      <section className="panel">
        <h2>Record New Payment</h2>
        {isCompleted ? (
          <p className="success-note">
            This loan is completed and now read-only.
            {loan.links.archive_url ? (
              <>
                {" "}
                View archived record:{" "}
                <a href={loan.links.archive_url} target="_blank" rel="noreferrer">
                  {loan.links.archive_url}
                </a>
              </>
            ) : null}
          </p>
        ) : (
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>
            <label>
              Payment Date
              <input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} required />
            </label>
            <label className="full-width">
              Notes
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
            </label>
            <label className="full-width">
              Proof of Payment (pdf/jpg/png/webp)
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Record Payment"}
            </button>
          </form>
        )}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Payment History</h2>
        <PaymentTable payments={loan.payments} currency={currency} onViewProof={handleViewProof} />
      </section>

      <section className="panel">
        <h2>Immutable Audit Log</h2>
        <AuditTimeline events={loan.audit_events} />
      </section>
    </main>
  );
}

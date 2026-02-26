"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Loader2,
  LayoutDashboard,
  Receipt,
  History,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Calendar,
  FileUp,
  Send,
  Copy
} from "lucide-react";

interface ManageLoanViewProps {
  manageToken: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button className="copy-btn" onClick={handleCopy} type="button" data-tooltip={copied ? "Copied!" : "Copy link"}>
      <Copy size={12} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function ManageLoanView({ manageToken }: ManageLoanViewProps) {
  const [loan, setLoan] = useState<LoanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getManageLoan(manageToken);
      setLoan(response);
    } catch (loadError) {
      setLoadError(loadError instanceof Error ? loadError.message : "Failed to load loan details");
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
    // Open the window synchronously (within the user gesture) before any await.
    // iOS Safari blocks window.open() called after an async/await boundary.
    const proofWindow = window.open("", "_blank");
    try {
      const url = await getProofURLByManage(manageToken, paymentID);
      if (proofWindow) {
        proofWindow.location.href = url;
      } else {
        toast.error("Popup was blocked — please allow popups for this site to view proof.");
      }
    } catch (proofError) {
      proofWindow?.close();
      toast.error(proofError instanceof Error ? proofError.message : "Failed to open proof file");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loan) return;

    setSubmitting(true);

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
      toast.success("Payment recorded successfully!");
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  }

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
        <div className="error" style={{ marginTop: 0 }}>
          {loadError}
        </div>
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

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">
          <LayoutDashboard size={11} />
          Borrower Dashboard
        </p>
        <h1>{loan.loan.borrower_name}&apos;s Debt Tracker</h1>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Remaining</span>
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

      <section className="panel">
        <h2>
          <Receipt size={18} />
          Record New Payment
        </h2>
        {isCompleted ? (
          <div className="success-note">
            <CheckCircle2 size={16} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>
              This loan is fully repaid and now read-only.
              {loan.links.archive_url ? (
                <>
                  {" "}
                  View the archived record:
                  <div className="result-link-box" style={{ marginTop: 10, background: "var(--success-bg)" }}>
                    <a href={loan.links.archive_url} target="_blank" rel="noreferrer">
                      {loan.links.archive_url}
                    </a>
                    <CopyButton value={loan.links.archive_url} />
                    <a href={loan.links.archive_url} target="_blank" rel="noreferrer" style={{ color: "var(--ink-muted)", display: "flex" }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </>
              ) : null}
            </span>
          </div>
        ) : (
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              <span className="label-row">
                <DollarSign size={12} />
                Amount
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label>
              <span className="label-row">
                <Calendar size={12} />
                Payment Date
              </span>
              <input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} required />
            </label>

            <label className="full-width">
              Notes (optional)
              <textarea
                placeholder="Add any notes about this payment…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
              />
            </label>

            <label className="full-width">
              <span className="label-row">
                <FileUp size={12} />
                Proof of Payment (pdf / jpg / png / webp)
              </span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="full-width">
              <button type="submit" disabled={submitting} style={{ width: "100%" }}>
                {submitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {submitting ? "Submitting Payment…" : "Record Payment"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="panel">
        <h2>
          <Receipt size={18} />
          Payment History
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

"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentData } from "@/types/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileText, Loader2, CheckCircle2, XCircle, ReceiptText } from "lucide-react";

interface PaymentTableProps {
  payments: PaymentData[];
  currency: string;
  onViewProof?: (paymentID: string) => void | Promise<void>;
  onApprove?: (paymentID: string) => void | Promise<void>;
  onReject?: (paymentID: string) => void | Promise<void>;
}

export function PaymentTable({ payments, currency, onViewProof, onApprove, onReject }: PaymentTableProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await onApprove?.(id);
    } finally {
      setApprovingId(null);
    }
  }

  if (payments.length === 0) {
    return (
      <div className="empty-state">
        <ReceiptText size={28} />
        <span>No payments recorded yet.</span>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Proof</th>
            <th>Notes</th>
            {(onApprove || onReject) && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td style={{ whiteSpace: "nowrap" }}>{formatDate(payment.paid_at)}</td>
              <td style={{ fontWeight: 700 }}>{formatCurrency(payment.amount, currency)}</td>
              <td>
                <StatusBadge status={payment.status} />
                {payment.rejection_reason ? (
                  <p className="rejection-note">
                    <XCircle size={11} style={{ marginTop: 1, flexShrink: 0 }} />
                    {payment.rejection_reason}
                  </p>
                ) : null}
              </td>
              <td>
                {payment.proof_object_key ? (
                  <button
                    className="ghost"
                    onClick={() => onViewProof?.(payment.id)}
                    data-tooltip="View uploaded receipt"
                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  >
                    <FileText size={13} />
                    View
                  </button>
                ) : (
                  <span className="muted" style={{ fontSize: "0.82rem" }}>No proof</span>
                )}
              </td>
              <td style={{ maxWidth: 200 }}>
                {payment.note ? (
                  <span style={{ fontSize: "0.85rem" }}>{payment.note}</span>
                ) : (
                  <span className="muted" style={{ fontSize: "0.82rem" }}>—</span>
                )}
              </td>
              {(onApprove || onReject) && (
                <td>
                  {payment.status === "pending" && onApprove && onReject ? (
                    <div className="inline-actions">
                      <button
                        className="approve"
                        onClick={() => handleApprove(payment.id)}
                        disabled={approvingId === payment.id}
                        data-tooltip="Mark as approved"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        {approvingId === payment.id ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Approve
                      </button>
                      <button
                        className="reject"
                        onClick={() => onReject(payment.id)}
                        disabled={approvingId === payment.id}
                        data-tooltip="Reject this payment"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.82rem" }}>—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

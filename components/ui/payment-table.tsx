import { formatCurrency, formatDate } from "@/lib/format";
import { PaymentData } from "@/types/api";
import { StatusBadge } from "@/components/ui/status-badge";

interface PaymentTableProps {
  payments: PaymentData[];
  currency: string;
  onViewProof?: (paymentID: string) => void | Promise<void>;
  onApprove?: (paymentID: string) => void | Promise<void>;
  onReject?: (paymentID: string) => void | Promise<void>;
}

export function PaymentTable({
  payments,
  currency,
  onViewProof,
  onApprove,
  onReject
}: PaymentTableProps) {
  if (payments.length === 0) {
    return <p className="empty-state">No payments recorded yet.</p>;
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{formatDate(payment.paid_at)}</td>
              <td>{formatCurrency(payment.amount, currency)}</td>
              <td>
                <StatusBadge status={payment.status} />
              </td>
              <td>
                {payment.proof_object_key ? (
                  <button className="ghost" onClick={() => onViewProof?.(payment.id)}>
                    View
                  </button>
                ) : (
                  <span className="muted">No proof</span>
                )}
              </td>
              <td>
                {payment.note ? payment.note : <span className="muted">-</span>}
                {payment.rejection_reason ? (
                  <p className="rejection-note">Rejected: {payment.rejection_reason}</p>
                ) : null}
              </td>
              <td>
                {payment.status === "pending" && onApprove && onReject ? (
                  <div className="inline-actions">
                    <button className="approve" onClick={() => onApprove(payment.id)}>
                      Approve
                    </button>
                    <button className="reject" onClick={() => onReject(payment.id)}>
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="muted">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

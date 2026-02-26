import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { PaymentStatus } from "@/types/api";

interface StatusBadgeProps {
  status: PaymentStatus;
}

const icons: Record<PaymentStatus, React.ReactNode> = {
  pending: <Clock size={11} />,
  approved: <CheckCircle2 size={11} />,
  rejected: <XCircle size={11} />
};

const labels: Record<PaymentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge-${status}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

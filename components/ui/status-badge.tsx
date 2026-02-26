import { PaymentStatus } from "@/types/api";

interface StatusBadgeProps {
  status: PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status[0].toUpperCase() + status.slice(1);
  return <span className={`badge badge-${status}`}>{label}</span>;
}

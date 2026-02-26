export type PaymentStatus = "pending" | "approved" | "rejected";
export type LoanStatus = "active" | "completed";

export interface LoanData {
  id: string;
  borrower_name: string;
  borrower_email: string;
  lender_name: string;
  lender_email: string;
  total_amount: number;
  monthly_plan_amount: number;
  currency: string;
  start_date: string;
  reminder_day_of_month: number;
  status: LoanStatus;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentData {
  id: string;
  amount: number;
  paid_at: string;
  proof_object_key?: string;
  proof_filename?: string;
  note?: string;
  status: PaymentStatus;
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanSummary {
  total_amount: number;
  total_paid_submitted: number;
  total_paid_approved: number;
  total_waived: number;
  remaining_balance: number;
  pending_payment_count: number;
  progress_percent: number;
  estimated_completion_date: string;
  next_reminder_date: string;
}

export interface LoanLinks {
  public_url: string;
  manage_url?: string;
  archive_url?: string;
}

export interface AuditEventData {
  id: string;
  actor_type: "borrower" | "lender" | "system";
  actor_display: string;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface WaiverData {
  id: string;
  amount: number;
  note?: string;
  actor_type: "lender" | "system";
  created_at: string;
}

export interface LoanDetails {
  loan: LoanData;
  payments: PaymentData[];
  waivers: WaiverData[];
  summary: LoanSummary;
  links: LoanLinks;
  audit_events: AuditEventData[];
}

export interface PresignProofResponse {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

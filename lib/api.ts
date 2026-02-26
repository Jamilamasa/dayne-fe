import { LoanDetails, PresignProofResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

interface ApiErrorResponse {
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorResponse & T;
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

export interface CreateLoanPayload {
  borrower_name: string;
  borrower_email: string;
  lender_name: string;
  lender_email: string;
  total_amount: number;
  monthly_plan_amount: number;
  currency: string;
  start_date?: string;
  reminder_day_of_month?: number;
}

export interface CreatePaymentPayload {
  amount: number;
  paid_at: string;
  note?: string;
  proof_object_key?: string;
  proof_filename?: string;
}

export interface PresignProofPayload {
  filename: string;
  content_type: string;
  size: number;
}

export async function createLoan(payload: CreateLoanPayload): Promise<LoanDetails> {
  return request<LoanDetails>("/v1/loans", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getManageLoan(manageToken: string): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/manage/${manageToken}`);
}

export async function createPayment(manageToken: string, payload: CreatePaymentPayload): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/manage/${manageToken}/payments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function presignProofUpload(
  manageToken: string,
  payload: PresignProofPayload
): Promise<PresignProofResponse> {
  return request<PresignProofResponse>(`/v1/loans/manage/${manageToken}/uploads/proof/presign`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getProofURLByManage(manageToken: string, paymentID: string): Promise<string> {
  const response = await request<{ url: string }>(`/v1/loans/manage/${manageToken}/payments/${paymentID}/proof-url`);
  return response.url;
}

export async function getPublicLoan(publicToken: string): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/public/${publicToken}`);
}

export async function getArchivedLoan(archivedToken: string): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/archive/${archivedToken}`);
}

export async function approvePayment(publicToken: string, paymentID: string): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/public/${publicToken}/payments/${paymentID}/approve`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export async function rejectPayment(publicToken: string, paymentID: string, reason: string): Promise<LoanDetails> {
  return request<LoanDetails>(`/v1/loans/public/${publicToken}/payments/${paymentID}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
}

export async function getProofURLByPublic(publicToken: string, paymentID: string): Promise<string> {
  const response = await request<{ url: string }>(`/v1/loans/public/${publicToken}/payments/${paymentID}/proof-url`);
  return response.url;
}

export async function getProofURLByArchive(archivedToken: string, paymentID: string): Promise<string> {
  const response = await request<{ url: string }>(
    `/v1/loans/archive/${archivedToken}/payments/${paymentID}/proof-url`
  );
  return response.url;
}

export async function uploadFileToPresignedURL(uploadURL: string, file: File): Promise<void> {
  const response = await fetch(uploadURL, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: file
  });

  if (!response.ok) {
    throw new Error("Proof file upload failed");
  }
}

"use client";

import { FormEvent, useState } from "react";
import { createLoan } from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { toInputDate } from "@/lib/format";
import { persistManageTokenFromURL } from "@/components/loan/open-repayment-form";

interface CreateLoanFormState {
  borrower_name: string;
  borrower_email: string;
  lender_name: string;
  lender_email: string;
  total_amount: string;
  monthly_plan_amount: string;
  currency: string;
  start_date: string;
  reminder_day_of_month: string;
}

const initialState: CreateLoanFormState = {
  borrower_name: "",
  borrower_email: "",
  lender_name: "",
  lender_email: "",
  total_amount: "",
  monthly_plan_amount: "",
  currency: "USD",
  start_date: toInputDate(new Date().toISOString()),
  reminder_day_of_month: "1"
};

export function CreateLoanForm() {
  const [form, setForm] = useState<CreateLoanFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanDetails | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await createLoan({
        borrower_name: form.borrower_name,
        borrower_email: form.borrower_email,
        lender_name: form.lender_name,
        lender_email: form.lender_email,
        total_amount: Number(form.total_amount),
        monthly_plan_amount: Number(form.monthly_plan_amount),
        currency: form.currency,
        start_date: form.start_date,
        reminder_day_of_month: Number(form.reminder_day_of_month)
      });
      setResult(response);
      persistManageTokenFromURL(response.links.manage_url);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create loan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Create Loan Tracker</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Your Name
          <input
            value={form.borrower_name}
            onChange={(event) => setForm((previous) => ({ ...previous, borrower_name: event.target.value }))}
            required
          />
        </label>
        <label>
          Your Email
          <input
            type="email"
            value={form.borrower_email}
            onChange={(event) => setForm((previous) => ({ ...previous, borrower_email: event.target.value }))}
            required
          />
        </label>
        <label>
          Lender&apos;s Name
          <input
            value={form.lender_name}
            onChange={(event) => setForm((previous) => ({ ...previous, lender_name: event.target.value }))}
            required
          />
        </label>
        <label>
          Lender&apos;s Email
          <input
            type="email"
            value={form.lender_email}
            onChange={(event) => setForm((previous) => ({ ...previous, lender_email: event.target.value }))}
            required
          />
        </label>
        <label>
          Total Loan Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.total_amount}
            onChange={(event) => setForm((previous) => ({ ...previous, total_amount: event.target.value }))}
            required
          />
        </label>
        <label>
          Monthly Plan Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.monthly_plan_amount}
            onChange={(event) => setForm((previous) => ({ ...previous, monthly_plan_amount: event.target.value }))}
            required
          />
        </label>
        <label>
          Currency
          <input
            maxLength={3}
            value={form.currency}
            onChange={(event) => setForm((previous) => ({ ...previous, currency: event.target.value.toUpperCase() }))}
            required
          />
        </label>
        <label>
          Start Date
          <input
            type="date"
            value={form.start_date}
            onChange={(event) => setForm((previous) => ({ ...previous, start_date: event.target.value }))}
            required
          />
        </label>
        <label>
          Reminder Day (1-28)
          <input
            type="number"
            min="1"
            max="28"
            value={form.reminder_day_of_month}
            onChange={(event) => setForm((previous) => ({ ...previous, reminder_day_of_month: event.target.value }))}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Tracker"}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {result ? (
        <div className="result">
          <h3>Tracker Created</h3>
          <p>Share this public link with your lender:</p>
          <a href={result.links.public_url} target="_blank" rel="noreferrer">
            {result.links.public_url}
          </a>
          <p>Use this private manage link to record your payments:</p>
          {result.links.manage_url ? (
            <a href={result.links.manage_url} target="_blank" rel="noreferrer">
              {result.links.manage_url}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createLoan } from "@/lib/api";
import { LoanDetails } from "@/types/api";
import { toInputDate } from "@/lib/format";
import { persistManageTokenFromURL } from "@/components/loan/open-repayment-form";
import {
  User,
  Mail,
  DollarSign,
  Calendar,
  Bell,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  PlusCircle
} from "lucide-react";

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
  currency: "NGN",
  start_date: toInputDate(new Date().toISOString()),
  reminder_day_of_month: "1"
};

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

export function CreateLoanForm() {
  const [form, setForm] = useState<CreateLoanFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoanDetails | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      toast.success("Loan tracker created successfully!");
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to create loan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>
        <PlusCircle size={18} />
        Create Loan Tracker
      </h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          <span className="label-row">
            <User size={12} />
            Your Name
          </span>
          <input
            placeholder="e.g. Alex Johnson"
            value={form.borrower_name}
            onChange={(event) => setForm((previous) => ({ ...previous, borrower_name: event.target.value }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <Mail size={12} />
            Your Email
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.borrower_email}
            onChange={(event) => setForm((previous) => ({ ...previous, borrower_email: event.target.value }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <User size={12} />
            Lender&apos;s Name
          </span>
          <input
            placeholder="e.g. Sam Rivera"
            value={form.lender_name}
            onChange={(event) => setForm((previous) => ({ ...previous, lender_name: event.target.value }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <Mail size={12} />
            Lender&apos;s Email
          </span>
          <input
            type="email"
            placeholder="lender@example.com"
            value={form.lender_email}
            onChange={(event) => setForm((previous) => ({ ...previous, lender_email: event.target.value }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <DollarSign size={12} />
            Total Loan Amount
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.total_amount}
            onChange={(event) => setForm((previous) => ({ ...previous, total_amount: event.target.value }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <DollarSign size={12} />
            Monthly Plan Amount
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.monthly_plan_amount}
            onChange={(event) => setForm((previous) => ({ ...previous, monthly_plan_amount: event.target.value }))}
            required
          />
        </label>

        <label>
          Currency
          <input
            maxLength={3}
            placeholder="USD"
            value={form.currency}
            onChange={(event) => setForm((previous) => ({ ...previous, currency: event.target.value.toUpperCase() }))}
            required
          />
        </label>

        <label>
          <span className="label-row">
            <Calendar size={12} />
            Start Date
          </span>
          <input
            type="date"
            value={form.start_date}
            onChange={(event) => setForm((previous) => ({ ...previous, start_date: event.target.value }))}
            required
          />
        </label>

        <label className="full-width">
          <span className="label-row">
            <Bell size={12} />
            Reminder Day of Month (1–28)
          </span>
          <input
            type="number"
            min="1"
            max="28"
            value={form.reminder_day_of_month}
            onChange={(event) => setForm((previous) => ({ ...previous, reminder_day_of_month: event.target.value }))}
            required
          />
        </label>

        <div className="full-width">
          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? <Loader2 size={16} className="spin" /> : <PlusCircle size={16} />}
            {loading ? "Creating Tracker..." : "Create Tracker"}
          </button>
        </div>
      </form>

      {result ? (
        <div className="result">
          <h3>
            <CheckCircle2 size={18} />
            Tracker Created
          </h3>
          <p>Share this public link with your lender so they can review payments:</p>
          <div className="result-link-box">
            <a href={result.links.public_url} target="_blank" rel="noreferrer">
              {result.links.public_url}
            </a>
            <CopyButton value={result.links.public_url} />
            <a
              href={result.links.public_url}
              target="_blank"
              rel="noreferrer"
              data-tooltip="Open in new tab"
              style={{ color: "var(--ink-muted)", display: "flex" }}
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {result.links.manage_url ? (
            <>
              <p style={{ marginTop: 12 }}>Your private manage link to record payments:</p>
              <div className="result-link-box">
                <a href={result.links.manage_url} target="_blank" rel="noreferrer">
                  {result.links.manage_url}
                </a>
                <CopyButton value={result.links.manage_url} />
                <a
                  href={result.links.manage_url}
                  target="_blank"
                  rel="noreferrer"
                  data-tooltip="Open dashboard"
                  style={{ color: "var(--ink-muted)", display: "flex" }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

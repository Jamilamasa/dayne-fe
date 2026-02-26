import { CreateLoanForm } from "@/components/loan/create-loan-form";
import { OpenRepaymentForm } from "@/components/loan/open-repayment-form";
import { TrendingDown, ShieldCheck, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">
          <TrendingDown size={12} />
          Debt Management
        </p>
        <h1>Stay Clear on Every Repayment</h1>
        <p>
          Set your total loan, monthly plan, and lender contact once. Record each payment, upload proof, and keep both
          parties updated with approval tracking.
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <span className="hero-meta-label">Transparent</span>
            <span className="hero-meta-value">Payment Proofs</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Real-time</span>
            <span className="hero-meta-value">Balance Tracking</span>
          </div>
          <div className="hero-meta-item">
            <span className="hero-meta-label">Immutable</span>
            <span className="hero-meta-value">Audit Log</span>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <CreateLoanForm />
        <OpenRepaymentForm />
      </div>

      <section className="panel" style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 200 }}>
            <div className="summary-card-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                Lender Approval
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                Each payment goes through a lender review before being marked approved.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 200 }}>
            <div className="summary-card-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
              <Bell size={16} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                Monthly Reminders
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-muted)" }}>
                Automated reminders sent on your chosen day each month to stay on track.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

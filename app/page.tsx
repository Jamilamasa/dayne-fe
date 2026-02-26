import { CreateLoanForm } from "@/components/loan/create-loan-form";
import { OpenRepaymentForm } from "@/components/loan/open-repayment-form";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Debt Management App</p>
        <h1>Stay Clear on Every Repayment</h1>
        <p>
          Set your total loan, monthly plan, and lender contact once. Record each payment, upload proof, and keep both of
          you updated with automatic emails and approval tracking.
        </p>
      </section>

      <CreateLoanForm />
      <OpenRepaymentForm />
    </main>
  );
}

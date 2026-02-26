import { PublicLoanView } from "@/components/loan/public-loan-view";

interface LoanPageProps {
  params: {
    publicToken: string;
  };
}

export default function PublicLoanPage({ params }: LoanPageProps) {
  return <PublicLoanView publicToken={params.publicToken} />;
}

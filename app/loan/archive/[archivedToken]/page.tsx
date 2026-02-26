import { ArchivedLoanView } from "@/components/loan/archived-loan-view";

interface ArchivedLoanPageProps {
  params: {
    archivedToken: string;
  };
}

export default function ArchivedLoanPage({ params }: ArchivedLoanPageProps) {
  return <ArchivedLoanView archivedToken={params.archivedToken} />;
}

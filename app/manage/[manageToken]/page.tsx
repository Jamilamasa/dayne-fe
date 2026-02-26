import { ManageLoanView } from "@/components/loan/manage-loan-view";

interface ManagePageProps {
  params: {
    manageToken: string;
  };
}

export default function ManageLoanPage({ params }: ManagePageProps) {
  return <ManageLoanView manageToken={params.manageToken} />;
}

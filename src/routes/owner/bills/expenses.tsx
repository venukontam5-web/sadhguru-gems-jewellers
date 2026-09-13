import { createFileRoute } from "@tanstack/react-router";
import { BillsKindPage } from "@/components/bills-kind-page";

export const Route = createFileRoute("/owner/bills/expenses")({
  component: () => <BillsKindPage kind="expense" />,
});

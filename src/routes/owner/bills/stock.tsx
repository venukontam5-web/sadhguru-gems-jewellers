import { createFileRoute } from "@tanstack/react-router";
import { BillsKindPage } from "@/components/bills-kind-page";

export const Route = createFileRoute("/owner/bills/stock")({
  component: () => <BillsKindPage kind="stock" />,
});

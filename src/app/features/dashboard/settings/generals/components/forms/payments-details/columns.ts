import { ColumnDef, flexRenderComponent } from "@tanstack/angular-table";
import { PaymentDetails } from "../../../../../../../lib/types";
import { PaymentDetailsActionDropdown } from "./action-dropdown";

export const paymentsDetailsColumns: ColumnDef<PaymentDetails>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "owner_name",
    header: "Propriétaire",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "iban",
    header: "IBAN",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "bic",
    header: "BIC",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "bank_name",
    header: "Nom de la banque",
    cell: (info) => info.getValue(),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (info) =>
      flexRenderComponent(PaymentDetailsActionDropdown, { inputs: { selectedPaymentDetailsId: info.row.original.id } }),
  },
];

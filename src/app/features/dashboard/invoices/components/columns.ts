import { ColumnDef, flexRenderComponent } from "@tanstack/angular-table";
import { Invoice, InvoiceStatus } from "../../../../lib/types";
import { InvoiceActionDropdown } from "./action-dropdown";
import { InvoicePaymentSelector } from "./payment_status-selector";
import { InvoiceStatusBadge } from "./status-badge";

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "reference",
    header: "Référence",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "company.name",
    header: "Emetteur",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "client.name",
    header: "Nom du client",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "issue_date",
    header: "Date d'émission",
    cell: (info) => new Date(info.getValue<Date>()).toLocaleDateString(),
  },
  {
    accessorKey: "due_date",
    header: "Date d'échéance",
    cell: (info) => new Date(info.getValue<Date>()).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: (info) => flexRenderComponent(InvoiceStatusBadge, { inputs: { value: info.getValue() as any } }),
  },
  {
    accessorKey: "payment_status",
    header: "Statut de paiement",
    cell: (info) =>
      flexRenderComponent(InvoicePaymentSelector, {
        inputs: {
          invoiceId: info.row.original.id,
          value: info.row.original.payment_status,
        },
      }),
  },
  {
    accessorKey: "total_ht",
    header: "Total HT",
    cell: (info) => `${info.row.original.total_ht} €`,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (info) =>
      flexRenderComponent(InvoiceActionDropdown, {
        inputs: {
          selectedInvoiceId: info.row.original.id,
          invoiceReference: info.row.original.reference,
          isPublished: info.row.original.status === InvoiceStatus.PUBLISHED,
        },
      }),
  },
];

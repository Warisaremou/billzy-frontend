import { ColumnDef, flexRenderComponent } from "@tanstack/angular-table";
import { Company } from "../../../../lib/types";
import { CompanyActionDropdown } from "./action-dropdown";
import { LogoPreview } from "./logo-preview";

export const companiesColumns: ColumnDef<Company>[] = [
  {
    id: "select",
    // header: () => flexRenderComponent(TableHeadSelection),
    // cell: () => flexRenderComponent(TableRowSelection),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "logo_url",
    header: "",
    cell: (info) => flexRenderComponent(LogoPreview, { inputs: { logoUrl: info.getValue() as any } }),
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "siret",
    header: "SIRET",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "tva_number",
    header: "TVA",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "address_street",
    header: "Adresse",
    cell: (info) => {
      const street = info.getValue();
      const zipcode = info.row.original.address_zipcode;
      const city = info.row.original.address_city;
      return `<div class="max-w-[200px]! truncate">${street}, ${zipcode} ${city}</div>`;
    },
  },
  {
    accessorKey: "address_country",
    header: "Pays",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: (info) => info.getValue(),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (info) => flexRenderComponent(CompanyActionDropdown, { inputs: { selectedCompanyId: info.row.original.id } }),
  },
];

import { ColumnDef, flexRenderComponent } from "@tanstack/angular-table";
import { Company, User } from "../../../../lib/types";
import { UserActionDropdown } from "./action-dropdown";
import { UserRoleBadge } from "./role-badge";
import { UserStatusBadge } from "./user-status-badge";

export const usersColumns: ColumnDef<User>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "first_name",
    header: "Prénom",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "last_name",
    header: "Nom",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: (info) => flexRenderComponent(UserRoleBadge, { inputs: { value: info.row.original.role } }),
  },
  {
    accessorKey: "is_active",
    header: "Actif",
    cell: (info) => flexRenderComponent(UserStatusBadge, { inputs: { value: info.row.original.is_active } }),
  },
  {
    accessorKey: "__companies__",
    header: "Entreprise",
    cell: (info) => {
      const companies = info.getValue() as Company[];
      return companies[0]?.name || "-";
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: (info) => flexRenderComponent(UserActionDropdown, { inputs: { selectedUserId: info.row.original.id } }),
  },
];

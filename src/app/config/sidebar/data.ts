import { Role } from "../../lib/types";
import { routes } from "../routes";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: routes.dashboard.overview,
      icon: "lucideLayoutDashboard",
      isActive: true,
    },
    {
      title: "Entreprises",
      url: routes.dashboard.companies,
      icon: "lucideHotel",
      roles: [Role.SUPER_ADMIN],
    },
    {
      title: "Factures",
      icon: "lucideReceiptText",
      url: routes.dashboard.invoices.index,
      items: [
        {
          title: "Listes des factures",
          url: routes.dashboard.invoices.index,
        },
        {
          title: "Créer une facture",
          url: routes.dashboard.invoices.create,
        },
      ],
    },
    {
      title: "Clients",
      url: routes.dashboard.customers,
      icon: "lucideBubbles",
      isActive: true,
    },
    {
      title: "Utilisateurs",
      url: routes.dashboard.users,
      icon: "lucideUsers",
      isActive: true,
      roles: [Role.SUPER_ADMIN],
    },
    {
      title: "Paramètres",
      icon: "lucideSettings",
      url: routes.dashboard.settings.general,
      roles: [Role.ADMIN, Role.USER],
      items: [
        {
          title: "Général",
          url: routes.dashboard.settings.general,
        },
        // {
        //   title: "Équipe",
        //   url: routes.dashboard.settings.members,
        // },
      ],
    },
  ],
};

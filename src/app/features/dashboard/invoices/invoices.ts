import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { routes } from "../../../config/routes";
import { AuthService } from "../../../core/auth.service";
import { DataTable } from "../../../shared/components/ui/data-table/data-table";
import { invoicesKeys } from "../../../shared/query-keys/invoices";
import { invoiceColumns } from "./components/columns";
import { InvoiceService } from "./services/invoice.service";

@Component({
  selector: "app-invoices",
  imports: [HlmBadgeImports, HlmSpinnerImports, HlmButtonImports, RouterLink, NgIcon, HlmIconImports, DataTable],
  providers: [provideIcons({ lucidePlusCircle })],
  templateUrl: "./invoices.html",
})
export class InvoicesPage {
  private readonly invoiceService = inject(InvoiceService);
  private readonly authService = inject(AuthService);

  readonly routes = routes;
  readonly columns = invoiceColumns;
  readonly currentUser = this.authService.currentUser;

  query = injectQuery(() => ({
    queryKey: this.authService.isSuperAdmin() ? invoicesKeys.all : invoicesKeys.userCompanies,
    queryFn: () =>
      this.authService.isSuperAdmin()
        ? this.invoiceService.getInvoices$()
        : this.invoiceService.getUserCompanyInvoices$(),
  }));
}

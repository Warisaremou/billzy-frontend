import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { AuthService } from "../../../core/auth.service";
import { DataTable } from "../../../shared/components/ui/data-table/data-table";
import { customersKeys } from "../../../shared/query-keys/customers";
import { customersColumns } from "./components/columns";
import { CustomersSheet } from "./components/customers-sheet";
import { CustomersService } from "./services/customers.service";

@Component({
  selector: "app-customers",
  imports: [CustomersSheet, HlmSpinnerImports, HlmButtonImports, NgIcon, HlmIconImports, DataTable],
  providers: [provideIcons({ lucidePlusCircle })],
  templateUrl: "./customers.html",
})
export class CustomersPage {
  private readonly authService = inject(AuthService);
  private readonly customersService = inject(CustomersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columns = customersColumns;

  query = injectQuery(() => ({
    queryKey: this.authService.isSuperAdmin() ? customersKeys.all : customersKeys.companyClients,
    queryFn: () =>
      this.authService.isSuperAdmin()
        ? this.customersService.getAllCustomers$()
        : this.customersService.getCompanyCustomers$(),
  }));

  openCreateSheet() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: "create" },
      queryParamsHandling: "merge",
    });
  }
}

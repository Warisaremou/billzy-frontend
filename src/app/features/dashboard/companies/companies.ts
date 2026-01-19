import { Component, inject } from "@angular/core";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { CompaniesService } from "./services/companies.service";

import { ActivatedRoute, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { DataTable } from "../../../shared/components/ui/data-table/data-table";
import { companiesKeys } from "../../../shared/query-keys/companies";
import { companiesColumns } from "./components/columns";
import { CompanySheet } from "./components/company-sheet";

@Component({
  selector: "app-companies",
  imports: [CompanySheet, HlmSpinnerImports, HlmButtonImports, NgIcon, HlmIconImports, DataTable],
  providers: [provideIcons({ lucidePlusCircle })],
  templateUrl: "./companies.html",
})
export class CompaniesPage {
  private readonly companiesService = inject(CompaniesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columns = companiesColumns;

  query = injectQuery(() => ({
    queryKey: companiesKeys.all,
    queryFn: () => this.companiesService.getCompanies$(),
  }));

  openCreateSheet() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: "create" },
      queryParamsHandling: "merge",
    });
  }
}

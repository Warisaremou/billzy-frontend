import { Component, inject } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { DataTable } from "../../../shared/components/ui/data-table/data-table";
import { usersKeys } from "../../../shared/query-keys/users";
import { usersColumns } from "./components/columns";
import { UserSheet } from "./components/user-sheet";
import { UsersService } from "./services/users.service";

@Component({
  selector: "app-users",
  imports: [UserSheet, HlmSpinnerImports, HlmButtonImports, NgIcon, HlmIconImports, DataTable],
  providers: [provideIcons({ lucidePlusCircle })],
  templateUrl: "./users.html",
})
export class UsersPage {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly columns = usersColumns;

  query = injectQuery(() => ({
    queryKey: usersKeys.all,
    queryFn: () => this.usersService.getUsers$(),
  }));

  openCreateSheet() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: "create" },
      queryParamsHandling: "merge",
    });
  }
}

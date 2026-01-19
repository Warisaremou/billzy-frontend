import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucideCommand } from "@ng-icons/lucide";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { data } from "../../../../config/sidebar/data";
import { NavMain } from "../../../../config/sidebar/nav-main";
import { NavUser } from "../../../../config/sidebar/nav-user";
import { AuthService } from "../../../../core/auth.service";
import { LogoPreview } from "../../../../features/dashboard/companies/components/logo-preview";
import { CompaniesService } from "../../../../features/dashboard/companies/services/companies.service";
import { Company } from "../../../../lib/types";
import { handleRequestError } from "../../../helpers";
import { companiesKeys } from "../../../query-keys/companies";
import { AppLogo } from "../../logo/logo";

@Component({
  selector: "app-sidebar",
  imports: [RouterLink, HlmSidebarImports, NavMain, NavUser, LogoPreview, AppLogo],
  templateUrl: "./sidebar.html",
  providers: [provideIcons({ lucideCommand })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
  userCompanies = signal<Company[]>([]);

  private readonly companiesService = inject(CompaniesService);
  private readonly authService = inject(AuthService);
  public readonly currentUser = this.authService.currentUser;

  isSuperAdmnin = computed(() => this.authService.isSuperAdmin());

  companyQuery = injectQuery(() => ({
    queryKey: companiesKeys.userCompanies,
    queryFn: () => this.companiesService.getUserCompanies$(),
    enabled: !this.isSuperAdmnin(),
  }));

  constructor() {
    effect(() => {
      if (!this.isSuperAdmnin()) {
        const data = this.companyQuery.data();
        const error = this.companyQuery.error();

        if (error) {
          handleRequestError(error);
          return;
        }

        if (data) {
          this.userCompanies.set(data);
        }
      }
    });
  }

  public readonly navMenu = computed(() => {
    return data.navMain.filter((item) => {
      // @ts-ignore
      if (!item.roles) return true;
      // @ts-ignore
      return item.roles.includes(this.currentUser()?.role);
    });
  });
}

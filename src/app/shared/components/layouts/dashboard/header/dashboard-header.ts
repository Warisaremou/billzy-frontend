import { ChangeDetectionStrategy, Component } from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import { lucideSearch } from "@ng-icons/lucide";
import { HlmBreadCrumbImports } from "@spartan-ng/helm/breadcrumb";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { routes } from "../../../../../config/routes";

@Component({
  selector: "app-dashboard-header",
  imports: [HlmSidebarImports, HlmSeparatorImports, HlmBreadCrumbImports],
  providers: [provideIcons({ lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard-header.html",
})
export class DashboardHeader {
  readonly routes = routes;
}

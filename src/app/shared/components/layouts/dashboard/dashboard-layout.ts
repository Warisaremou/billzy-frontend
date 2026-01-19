import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { AppSidebar } from "../sidebar/sidebar";
import { DashboardHeader } from "./header/dashboard-header";

@Component({
  selector: "app-dashboard-layout",
  imports: [RouterOutlet, HlmSidebarImports, DashboardHeader, AppSidebar],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
  templateUrl: "./dashboard-layout.html",
})
export class DashboardLayout {}

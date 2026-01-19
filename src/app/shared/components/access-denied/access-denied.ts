import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMoveRight } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { routes } from "../../../config/routes";

@Component({
  selector: "app-access-denied",
  imports: [RouterLink, HlmButtonImports, NgIcon, HlmIconImports],
  providers: [provideIcons({ lucideMoveRight })],
  templateUrl: "./access-denied.html",
})
export class AccessDenied {
  routes = routes;
}

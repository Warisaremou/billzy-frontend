import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideMoveRight } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { routes } from "../../config/routes";
import { AppLogo } from "../../shared/components/logo/logo";

@Component({
  selector: "app-landing",
  imports: [AppLogo, RouterLink, HlmButtonImports, NgIcon, HlmIconImports],
  providers: [provideIcons({ lucideMoveRight })],
  templateUrl: "./landing.html",
})
export class LandingPage {
  readonly routes = routes;
}

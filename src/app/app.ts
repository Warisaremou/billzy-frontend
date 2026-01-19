import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucideMoveRight } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { NgxSonnerToaster } from "ngx-sonner";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, HlmButtonImports, HlmIconImports, NgxSonnerToaster],
  providers: [provideIcons({ lucideMoveRight })],
  templateUrl: "./app.html",
})
export class App {}

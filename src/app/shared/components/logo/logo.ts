import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-logo",
  imports: [RouterLink],
  template: `
    <a [routerLink]="routerLink">
      <img [src]="'assets/' + variant + '.svg'" [alt]="alt" [width]="width" [height]="height" />
    </a>
  `,
})
export class AppLogo {
  @Input() variant: "logo-1" | "logo-2" = "logo-1";
  @Input() width = this.variant === "logo-1" ? 86 : 36;
  @Input() height = 28;
  @Input() alt = "Billzy Logo";
  @Input() routerLink = "/";
}

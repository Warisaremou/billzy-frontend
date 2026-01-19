import { Component, input } from "@angular/core";

@Component({
  selector: "company-logo-preview",
  standalone: true,
  template: `
    @if (logoUrl()) {
      <div class="size-8 overflow-hidden">
        <img [src]="logoUrl()" class="size-full object-cover" alt="company-logo" />
      </div>
    } @else {
      <label for="company-logo" class="block h-full">
        <div
          class="size-8 bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]"
        ></div>
      </label>
    }
  `,
})
export class LogoPreview {
  readonly logoUrl = input.required<string | null>();
}

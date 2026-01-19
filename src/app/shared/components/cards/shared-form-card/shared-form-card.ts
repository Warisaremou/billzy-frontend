import { Component, input } from "@angular/core";

@Component({
  selector: "shared-form-card",
  imports: [],
  templateUrl: "./shared-form-card.html",
})
export class SharedFormCard {
  title = input.required<string>();
  description = input<string>();
}

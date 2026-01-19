import { Component } from "@angular/core";

@Component({
  selector: "app-input-error",
  template: `<p class="text-xs text-destructive"><ng-content /></p>`,
})
export class InputError {}

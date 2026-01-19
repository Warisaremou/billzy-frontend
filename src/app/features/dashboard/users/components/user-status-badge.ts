import { Component, computed, input } from "@angular/core";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";

@Component({
  selector: "user-status-badge",
  standalone: true,
  imports: [HlmBadgeImports],
  template: `
    <span [variant]="variant()" hlmBadge>
      {{ status() ? "Actif" : "Inactif" }}
    </span>
  `,
})
export class UserStatusBadge {
  readonly value = input.required<boolean>();

  readonly status = computed(() => this.value());

  readonly variant = computed(() => {
    switch (this.status()) {
      case true:
        return "active";
      case false:
        return "inactive";
      default:
        return "outline";
    }
  });
}

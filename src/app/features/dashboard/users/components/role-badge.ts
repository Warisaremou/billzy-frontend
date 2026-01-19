import { Component, computed, input } from "@angular/core";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { Role } from "../../../../lib/types";

@Component({
  selector: "user-role-badge",
  standalone: true,
  imports: [HlmBadgeImports],
  template: `
    <span variant="outline" hlmBadge class="capitalize">
      {{ role() }}
    </span>
  `,
})
export class UserRoleBadge {
  readonly value = input.required<Role>();

  readonly role = computed(() => this.value());
}

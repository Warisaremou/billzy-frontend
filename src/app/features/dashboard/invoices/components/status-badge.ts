import { Component, computed, input } from "@angular/core";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { InvoiceStatus } from "../../../../lib/types";

@Component({
  selector: "app-invoice-status-badge",
  standalone: true,
  imports: [HlmBadgeImports],
  template: `
    <span [variant]="variant()" hlmBadge class="capitalize">
      {{ status() }}
    </span>
  `,
})
export class InvoiceStatusBadge {
  readonly value = input.required<InvoiceStatus>();

  readonly status = computed(() => this.value());

  readonly variant = computed(() => {
    switch (this.status()) {
      case InvoiceStatus.PUBLISHED:
        return "default";
      case InvoiceStatus.DRAFT:
        return "outline";
      default:
        return "outline";
    }
  });
}

import { Component, effect, inject, input, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { paymentDetailsKeys } from "../../../../../../../shared/query-keys/payment-details";
import { paymentsDetailsColumns } from "./columns";
import { PaymentDetailsForm } from "./payment-details-form";

import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { DataTable } from "../../../../../../../shared/components/ui/data-table/data-table";
import { CompaniesService } from "../../../../../companies/services/companies.service";
import { PaymentDetailsService } from "./services/payment-details.service";

@Component({
  selector: "payment-details",
  imports: [PaymentDetailsForm, HlmSpinnerImports, HlmButtonImports, NgIcon, HlmIconImports, DataTable, RouterLink],
  providers: [provideIcons({ lucidePlus })],
  template: `<div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <h6>Détails de paiement</h6>
      <button [routerLink]="[]" [queryParams]="{ action: 'create' }" hlmBtn variant="outline" size="sm">
        <ng-icon hlm name="lucidePlus" size="sm" />
        Ajouter
      </button>
    </div>

    <payment-details-form
      [companyId]="companyId()"
      [state]="dialogState()"
      [paymentDetails]="selectedPaymentDetails()"
      (closed)="onClose()"
    />

    @if (query.isPending()) {
      <div class="flex p-5 flex-col items-center justify-center gap-2">
        <hlm-spinner class="text-xl" />
        <p class="text-muted-foreground">Chargement des détails de paiement...</p>
      </div>
    } @else if (query.isError()) {
      <div class="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p class="text-sm text-destructive">{{ query.error().message }}</p>
      </div>
    } @else if (query.isSuccess()) {
      <data-table
        [columns]="columns"
        [data]="query.data()!"
        searchColumn="owner_name"
        searchPlaceholder="Rechercher par nom de propriétaire..."
      >
        <div class="flex flex-col gap-2 items-center justify-center">
          Aucun détail de paiement trouvé
          <button [routerLink]="[]" [queryParams]="{ action: 'create' }" hlmBtn variant="outline" size="sm">
            <ng-icon hlm name="lucidePlus" size="sm" />
            Ajouter
          </button>
        </div>
      </data-table>
    }
  </div>`,
})
export class PaymentDetails {
  private readonly companiesService = inject(CompaniesService);
  private readonly paymentDetailsService = inject(PaymentDetailsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  companyId = input<string | null>(null);

  readonly columns = paymentsDetailsColumns;

  query = injectQuery(() => ({
    queryKey: paymentDetailsKeys.all,
    queryFn: () => {
      const id = this.companyId();
      if (!id) return Promise.resolve([]);
      return this.paymentDetailsService.getPaymentDetailsByCompany$(id);
    },
    enabled: !!this.companyId(),
  }));

  dialogState = signal<"open" | "closed">("closed");
  selectedPaymentDetails = signal<any>(null);

  constructor() {
    effect(() => {
      if (this.companyId()) {
        this.query.refetch();
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params["action"] === "create") {
        this.selectedPaymentDetails.set(null);
        this.dialogState.set("open");
      } else if (params["action"] === "edit" && params["id"]) {
        const details = this.query.data()?.find((d) => d.id === params["id"]);
        if (details) {
          this.selectedPaymentDetails.set(details);
          this.dialogState.set("open");
        }
      } else {
        this.dialogState.set("closed");
      }
    });
  }

  onClose() {
    this.router.navigate([], {
      queryParams: { action: null, id: null },
      queryParamsHandling: "merge",
    });
  }
}

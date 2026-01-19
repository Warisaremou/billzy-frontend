import { Component, computed, effect, inject, input } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HlmBadgeImports } from "@spartan-ng/helm/badge";
import { QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { InvoicePaymentStatus, PaymentStatus } from "../../../../lib/types";
import { FormSelectInput } from "../../../../shared/components/form-select-input";
import { handleRequestError } from "../../../../shared/helpers";
import { invoicesKeys } from "../../../../shared/query-keys/invoices";
import { InvoiceService } from "../services/invoice.service";

@Component({
  selector: "invoice-payment-selector",
  standalone: true,
  imports: [HlmBadgeImports, FormSelectInput, ReactiveFormsModule],
  template: `
    <form [formGroup]="paymentStatusForm" class="max-w-[185px]">
      <form-select-input
        formControlName="paymentStatus"
        (valueChanged)="updatePaymentStatus()"
        [dataList]="paymentStatuses"
        labelKey="name"
        valueKey="id"
        placeholder="Statut de paiement"
      />
    </form>
  `,
})
export class InvoicePaymentSelector {
  readonly invoiceService = inject(InvoiceService);
  readonly invoiceId = input.required<string>();
  readonly value = input.required<InvoicePaymentStatus>();
  private queryClient = inject(QueryClient);

  paymentStatusForm = new FormGroup({
    paymentStatus: new FormControl("", [Validators.required]),
  });

  defaultValue = computed(() => this.value());

  constructor() {
    effect(() => {
      this.paymentStatusForm.setValue({ paymentStatus: this.defaultValue() });
    });
  }

  updatePaymentStatus() {
    if (!this.paymentStatusForm.value.paymentStatus || this.paymentStatusForm.value.paymentStatus === this.value())
      return;

    this.invoiceService
      .updateInvoicePaymentStatus$(this.invoiceId(), this.paymentStatusForm.value.paymentStatus)
      .subscribe({
        next: async () => {
          await this.queryClient.invalidateQueries({ queryKey: invoicesKeys.add });
          toast.success("Statut de paiement mis à jour avec succès");
        },
        error: (error: any) => handleRequestError(error),
      });
  }

  paymentStatuses: PaymentStatus[] = [
    { id: InvoicePaymentStatus.PAID, name: "Payée" },
    { id: InvoicePaymentStatus.UNPAID, name: "Impayée" },
    { id: InvoicePaymentStatus.PARTIALLY_PAID, name: "Partiellement payée" },
  ];
}

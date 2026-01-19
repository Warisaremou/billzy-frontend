import { Component, computed, effect, inject, input, output } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { BrnDialogImports } from "@spartan-ng/brain/dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { PaymentDetails, PaymentDetailsPayload } from "../../../../../../../lib/types";
import { InputError } from "../../../../../../../shared/components/input-error";
import { handleRequestError } from "../../../../../../../shared/helpers";
import { paymentDetailsKeys } from "../../../../../../../shared/query-keys/payment-details";
import { PaymentDetailsService } from "./services/payment-details.service";

@Component({
  selector: "payment-details-form",
  imports: [
    BrnDialogImports,
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    InputError,
    ReactiveFormsModule,
    HlmSpinner,
  ],
  template: `
    <hlm-dialog [state]="state()" (closed)="onClose()">
      <hlm-dialog-content class="md:min-w-[480px]" *brnDialogContent="let ctx">
        <form [formGroup]="paymentDetailsForm" (ngSubmit)="handleSubmit()" class="space-y-5">
          <hlm-dialog-header>
            <h3 hlmDialogTitle>
              @if (this.isEditMode()) {
                Modifier un détail de paiement
              } @else {
                Ajouter un détail de paiement
              }
            </h3>
            <p hlmDialogDescription>
              @if (this.isEditMode()) {
                Modifier un détail de paiement
              } @else {
                Ajouter un détail de paiement
              }
            </p>
          </hlm-dialog-header>
          <div class="grid flex-1 w-full gap-3 px-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
            @for (field of fields; track field.name) {
              <div>
                <label hlmLabel [for]="field.name" class="required-field">{{ field.label }}</label>
                <input [id]="field.name" [placeholder]="field.placeholder" hlmInput [formControlName]="field.name" />
                @if (paymentDetailsForm.get(field.name)?.touched && paymentDetailsForm.get(field.name)?.errors) {
                  <app-input-error>
                    {{ getErrorMessage(field) }}
                  </app-input-error>
                }
              </div>
            }
          </div>
          <hlm-dialog-footer>
            <button hlmBtn type="button" variant="outline" brnDialogClose>Cancel</button>
            <button hlmBtn type="submit" [disabled]="isPending()">
              @if (isPending()) {
                <hlm-spinner />
              }
              {{ isEditMode() ? "Modifier" : "Ajouter" }}
            </button>
          </hlm-dialog-footer>
        </form>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class PaymentDetailsForm {
  private readonly paymentDetailsService = inject(PaymentDetailsService);
  private queryClient = inject(QueryClient);

  state = input<"open" | "closed">("closed");
  paymentDetails = input<PaymentDetails | null>(null);
  companyId = input<string | null>(null);
  closed = output<void>();

  isEditMode = computed(() => !!this.paymentDetails());

  constructor() {
    effect(() => {
      if (this.state() === "open") {
        if (this.paymentDetails()) {
          this.paymentDetailsForm.patchValue(this.paymentDetails()!);
        } else {
          this.paymentDetailsForm.reset();
        }
      }
    });
  }

  paymentDetailsForm = new FormGroup({
    owner_name: new FormControl("", [Validators.required, Validators.minLength(2)]),
    bank_name: new FormControl("", [Validators.required, Validators.minLength(2)]),
    iban: new FormControl("", [Validators.required, Validators.pattern("^[A-Z]{2}[0-9]{24}$")]),
    bic: new FormControl("", [Validators.required, Validators.minLength(6)]),
  });

  createMutation = injectMutation(() => ({
    mutationKey: paymentDetailsKeys.add,
    mutationFn: (payload: PaymentDetailsPayload) => {
      const companyId = this.companyId();
      if (!companyId) throw new Error("User has no company");
      return this.paymentDetailsService.addPaymentDetails$({ ...payload, company_id: companyId });
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: paymentDetailsKeys.all });
      toast.success("Détails de paiement ajouté avec succès");
      this.onClose();
    },
    onError: (error: any) => {
      console.log(error);
    },
  }));

  updateMutation = injectMutation(() => ({
    mutationKey: paymentDetailsKeys.update(this.paymentDetails()?.id ?? ""),
    mutationFn: (payload: PaymentDetailsPayload) =>
      this.paymentDetailsService.editPaymentDetails$(this.paymentDetails()?.id ?? "", payload),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: paymentDetailsKeys.all });
      toast.success("Détails de paiement modifié avec succès");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
  }));

  handleSubmit() {
    if (this.paymentDetailsForm.valid) {
      if (this.isEditMode()) {
        this.updateMutation.mutate(this.paymentDetailsForm.value as PaymentDetailsPayload);
      } else {
        this.createMutation.mutate(this.paymentDetailsForm.value as PaymentDetailsPayload);
      }
    } else {
      this.paymentDetailsForm.markAllAsTouched();
    }
  }

  onClose() {
    this.closed.emit();
  }

  getErrorMessage(field: any): string {
    const control = this.paymentDetailsForm.get(field.name);
    if (control?.hasError("required")) return field.requiredError;
    if (control?.hasError("pattern") || control?.hasError("minlength") || control?.hasError("maxlength")) {
      return field.invalidError || "Champ invalide";
    }
    return "";
  }

  isPending() {
    return this.createMutation.isPending() || this.updateMutation.isPending();
  }

  fields = [
    {
      name: "owner_name",
      label: "Nom du propriétaire",
      placeholder: "Acme Corp",
      requiredError: "Nom de l'entreprise requis",
    },
    {
      name: "bank_name",
      label: "Nom du banque",
      placeholder: "Banque",
      requiredError: "Nom du banque requis",
      invalidError: "Nom du banque invalide",
    },
    {
      name: "iban",
      label: "IBAN",
      placeholder: "FR00123456789012345678901234",
      requiredError: "IBAN requis",
      invalidError: "IBAN invalide",
    },
    {
      name: "bic",
      label: "BIC",
      placeholder: "REVOFRPP",
      requiredError: "BIC requis",
    },
  ];
}

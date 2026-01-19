import { Component, effect, inject, input, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { HlmTextareaImports } from "@spartan-ng/helm/textarea";
import { injectMutation, injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { lastValueFrom } from "rxjs";
import { TermsAndConditionsPayload } from "../../../../../lib/types";
import { InputError } from "../../../../../shared/components/input-error";
import { handleRequestError } from "../../../../../shared/helpers";
import { termsConditionsKeys } from "../../../../../shared/query-keys/terms-conditions";
import { TermsConditionsService } from "./services/terms-conditions.service";

@Component({
  selector: "terms-conditions",
  imports: [HlmSpinner, InputError, ReactiveFormsModule, HlmLabelImports, HlmTextareaImports, HlmButtonImports],
  template: `<div class="flex flex-col gap-3">
    <h6>Conditions d'utilisation</h6>
    <form [formGroup]="termsConditionsForm" (ngSubmit)="handleSubmit()" class="space-y-4">
      <div class="grid gap-2">
        <textarea
          id="terms-conditions"
          hlmTextarea
          formControlName="content"
          placeholder="Terms et conditions"
          class="min-h-[150px]"
          [readonly]="!isEditMode()"
        ></textarea>
        @if (termsConditionsForm.get("content")?.touched && termsConditionsForm.get("content")?.errors) {
          <app-input-error>
            @if (termsConditionsForm.get("content")?.errors?.["required"]) {
              Contenu requis
            }
            @if (termsConditionsForm.get("content")?.errors?.["email"]) {
              Adresse email invalide
            }
          </app-input-error>
        }
      </div>
      <button hlmBtn class="w-fit" type="submit" [disabled]="this.updateTermsConditionsMutation.isPending()" size="sm">
        @if (this.updateTermsConditionsMutation.isPending()) {
          <hlm-spinner />
        }
        @if (this.isEditMode()) {
          Enregistrer
        } @else {
          Modifier
        }
      </button>
    </form>
  </div>`,
})
export class TermsConditions {
  companyId = input<string | null>(null);

  private readonly termsConditionsService = inject(TermsConditionsService);
  queryClient = inject(QueryClient);

  isEditMode = signal(false);

  constructor() {
    effect(() => {
      if (this.companyId()) {
        this.termsConditionsForm.patchValue({
          company_id: this.companyId(),
        });
      }
    });

    effect(() => {
      const data = this.termsConditionsQuery.data();
      const error = this.termsConditionsQuery.error();

      if (error) {
        handleRequestError(error);
        return;
      }

      if (data) {
        this.termsConditionsForm.patchValue({
          content: data[0].content,
        });
      }
    });
  }

  termsConditionsQuery = injectQuery(() => ({
    queryKey: [termsConditionsKeys.all, this.companyId()],
    queryFn: () => lastValueFrom(this.termsConditionsService.getTermsConditionsByCompany$(this.companyId() as string)),
    enabled: !!this.companyId(),
  }));

  termsConditionsForm = new FormGroup({
    content: new FormControl("", [Validators.required]),
    company_id: new FormControl("", [Validators.required]),
  });

  updateTermsConditionsMutation = injectMutation(() => ({
    mutationKey: termsConditionsKeys.edit,
    mutationFn: () => {
      const payload = {
        ...this.termsConditionsForm.value,
        company_id: this.companyId(),
      } as TermsAndConditionsPayload;
      return this.termsConditionsService.editTermsConditions$(payload);
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({
        queryKey: [termsConditionsKeys.all, this.companyId()],
      });
      toast.success("Termes et conditions modifiés avec succès");
      this.isEditMode.set(false);
    },
    onError: (error: any) => handleRequestError(error),
  }));

  handleSubmit() {
    if (this.isEditMode()) {
      this.updateTermsConditionsMutation.mutate();
    } else {
      this.isEditMode.set(true);
    }
  }
}

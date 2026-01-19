import { Component, effect, inject, input, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { injectMutation, injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { lastValueFrom } from "rxjs";
import { CompanyPayload } from "../../../../../lib/types";
import { InputError } from "../../../../../shared/components/input-error";
import { handleRequestError } from "../../../../../shared/helpers";
import { companiesKeys } from "../../../../../shared/query-keys/companies";
import { CompaniesService } from "../../../companies/services/companies.service";

@Component({
  selector: "company-profile",
  imports: [ReactiveFormsModule, HlmInputImports, HlmLabelImports, HlmButtonImports, HlmSpinner, InputError],
  template: `
    <div class="flex flex-col gap-3">
      <h6>Profil de l'entreprise</h6>

      @if (companyQuery.isLoading()) {
        <div class="flex justify-center p-4">
          <hlm-spinner />
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="grid gap-2">
            <label hlmLabel>Nom de l'entreprise</label>
            <input
              hlmInput
              formControlName="name"
              class="w-full"
              placeholder="Nom de l'entreprise"
              [readonly]="!isEditMode()"
            />
            @if (form.get("name")?.touched && form.get("name")?.errors) {
              <app-input-error>Nom requis</app-input-error>
            }
          </div>

          <div class="grid gap-2">
            <label hlmLabel>SIRET</label>
            <input
              hlmInput
              formControlName="siret"
              class="w-full"
              placeholder="Numero SIRET"
              [readonly]="!isEditMode()"
            />
            @if (form.get("siret")?.touched && form.get("siret")?.errors) {
              <app-input-error>SIRET requis (14 chiffres)</app-input-error>
            }
          </div>

          <div class="grid gap-2">
            <label hlmLabel>TVA Intracom.</label>
            <input
              hlmInput
              formControlName="tva_number"
              class="w-full"
              placeholder="Numéro de TVA"
              [readonly]="!isEditMode()"
            />
            @if (form.get("tva_number")?.touched && form.get("tva_number")?.errors) {
              <app-input-error>Numéro de TVA requis</app-input-error>
            }
          </div>

          <div class="grid gap-2">
            <label hlmLabel>Téléphone</label>
            <input
              hlmInput
              formControlName="phone"
              class="w-full"
              placeholder="Numéro de téléphone"
              [readonly]="!isEditMode()"
            />
          </div>
        </div>

        <div class="space-y-4 pt-2">
          <h6 class="text-sm font-medium text-muted-foreground">Adresse</h6>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid gap-2">
              <label hlmLabel>Rue</label>
              <input
                hlmInput
                formControlName="address_street"
                class="w-full"
                placeholder="Numéro et nom de rue"
                [readonly]="!isEditMode()"
              />
              @if (form.get("address_street")?.touched && form.get("address_street")?.errors) {
                <app-input-error>Adresse requise</app-input-error>
              }
            </div>

            <div class="grid gap-2">
              <label hlmLabel>Code postal</label>
              <input
                hlmInput
                formControlName="address_zipcode"
                class="w-full"
                placeholder="Code postal"
                [readonly]="!isEditMode()"
              />
              @if (form.get("address_zipcode")?.touched && form.get("address_zipcode")?.errors) {
                <app-input-error>Code postal requis</app-input-error>
              }
            </div>

            <div class="grid gap-2">
              <label hlmLabel>Ville</label>
              <input
                hlmInput
                formControlName="address_city"
                class="w-full"
                placeholder="Ville"
                [readonly]="!isEditMode()"
              />
              @if (form.get("address_city")?.touched && form.get("address_city")?.errors) {
                <app-input-error>Ville requise</app-input-error>
              }
            </div>

            <div class="grid gap-2">
              <label hlmLabel>Pays</label>
              <input
                hlmInput
                formControlName="address_country"
                class="w-full"
                placeholder="Pays"
                [readonly]="!isEditMode()"
              />
              @if (form.get("address_country")?.touched && form.get("address_country")?.errors) {
                <app-input-error>Pays requis</app-input-error>
              }
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button hlmBtn type="submit" [disabled]="editCompanyMutation.isPending()" size="sm">
            @if (editCompanyMutation.isPending()) {
              <hlm-spinner />
            }
            @if (isEditMode()) {
              Enregistrer
            } @else {
              Modifier
            }
          </button>
          @if (isEditMode()) {
            <button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="editCompanyMutation.isPending()"
              size="sm"
              (click)="isEditMode.set(false)"
            >
              Annuler
            </button>
          }
        </div>
      </form>
    </div>
  `,
})
export class CompanyProfile {
  private readonly companiesService = inject(CompaniesService);
  private readonly queryClient = inject(QueryClient);

  companyId = input<string | null>(null);
  isEditMode = signal(false);

  form = new FormGroup({
    name: new FormControl("", [Validators.required]),
    siret: new FormControl("", [Validators.required, Validators.minLength(14), Validators.maxLength(14)]),
    tva_number: new FormControl("", [Validators.required]),
    phone: new FormControl("", [Validators.required]),
    address_street: new FormControl("", [Validators.required]),
    address_zipcode: new FormControl("", [Validators.required]),
    address_city: new FormControl("", [Validators.required]),
    address_country: new FormControl("", [Validators.required]),
  });

  companyQuery = injectQuery(() => ({
    queryKey: ["company", this.companyId()],
    queryFn: () => lastValueFrom(this.companiesService.getCompanyById$(this.companyId()!)),
    enabled: !!this.companyId(),
  }));

  editCompanyMutation = injectMutation(() => ({
    mutationFn: (payload: CompanyPayload) => this.companiesService.editCompany$(this.companyId()!, payload),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: companiesKeys.userCompanies });
      this.queryClient.invalidateQueries({ queryKey: ["company", this.companyId()] });
      toast.success("Profil de l'entreprise mis à jour avec succès");
      this.isEditMode.set(false);
    },
    onError: (error: any) => handleRequestError(error),
  }));

  constructor() {
    effect(() => {
      const company = this.companyQuery.data();
      if (company) {
        this.form.patchValue({
          name: company.name,
          siret: company.siret,
          tva_number: company.tva_number,
          phone: company.phone,
          address_street: company.address_street,
          address_zipcode: company.address_zipcode,
          address_city: company.address_city,
          address_country: company.address_country,
        });
      }
    });
  }

  handleSubmit() {
    if (this.isEditMode()) {
      if (this.form.valid && this.companyId()) {
        this.editCompanyMutation.mutate(this.form.value as CompanyPayload);
      } else {
        this.form.markAllAsTouched();
      }
    } else {
      this.isEditMode.set(true);
    }
  }
}

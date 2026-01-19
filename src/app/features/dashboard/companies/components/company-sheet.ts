import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { BrnSheetImports } from "@spartan-ng/brain/sheet";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSheetImports } from "@spartan-ng/helm/sheet";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { CompanyPayload } from "../../../../lib/types";
import { InputError } from "../../../../shared/components/input-error";
import { handleRequestError } from "../../../../shared/helpers";
import { companiesKeys } from "../../../../shared/query-keys/companies";
import { CompaniesService } from "../services/companies.service";

@Component({
  selector: "company-sheet",
  imports: [
    InputError,
    ReactiveFormsModule,
    BrnSheetImports,
    HlmIconImports,
    HlmSheetImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSpinnerImports,
  ],
  providers: [provideIcons({ lucidePlusCircle })],
  template: `
    <hlm-sheet side="right" (closed)="onClose()" [state]="state()">
      <hlm-sheet-content *brnSheetContent="let ctx" class="w-[400px] sm:w-[470px] sm:max-w-none">
        <form [formGroup]="companyForm" (ngSubmit)="handleSubmit()" class="flex flex-col h-full">
          <hlm-sheet-header>
            <h4 hlmSheetTitle>
              {{ isEditMode() ? "Modifier l'entreprise" : "Ajouter une entreprise" }}
            </h4>
          </hlm-sheet-header>

          <div class="grid flex-1 auto-rows-min gap-3 px-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
            @for (field of fields; track field.name) {
              <div>
                <label hlmLabel [for]="field.name" class="required-field">{{ field.label }}</label>
                <input [id]="field.name" [placeholder]="field.placeholder" hlmInput [formControlName]="field.name" />
                @if (companyForm.get(field.name)?.touched && companyForm.get(field.name)?.errors) {
                  <app-input-error>
                    {{ getErrorMessage(field) }}
                  </app-input-error>
                }
              </div>
            }
          </div>

          <hlm-sheet-footer class="flex-row justify-end gap-2">
            <button brnSheetClose hlmBtn variant="outline" type="button">Annuler</button>
            <button hlmBtn type="submit" [disabled]="companyForm.invalid || isPending()">
              @if (isPending()) {
                <hlm-spinner />
              }
              {{ isEditMode() ? "Modifier" : "Ajouter" }}
            </button>
          </hlm-sheet-footer>
        </form>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class CompanySheet {
  private companiesService = inject(CompaniesService);
  private queryClient = inject(QueryClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  state = signal<"open" | "closed">("closed");
  isEditMode = signal(false);
  companyId = signal<string | null>(null);

  companyForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    siret: new FormControl("", [Validators.required, Validators.pattern("^[0-9]{14}$")]),
    tva_number: new FormControl("", [Validators.required, Validators.pattern("^[A-Z]{2}[0-9]{11}$")]),
    phone: new FormControl("", [Validators.required]),
    address_street: new FormControl("", [Validators.required]),
    address_zipcode: new FormControl("", [Validators.required, Validators.pattern("^[0-9]{5}$")]),
    address_city: new FormControl("", [Validators.required]),
    address_country: new FormControl("", [Validators.required]),
  });

  fields = [
    {
      name: "name",
      label: "Nom de l'entreprise",
      placeholder: "Acme Corp",
      requiredError: "Nom de l'entreprise requis",
    },
    {
      name: "siret",
      label: "Numéro de SIRET",
      placeholder: "12345678901234",
      requiredError: "Numéro de SIRET requis",
      invalidError: "Numéro de SIRET invalide",
    },
    {
      name: "tva_number",
      label: "Numéro de TVA",
      placeholder: "FR08123456789",
      requiredError: "Numéro de TVA requis",
      invalidError: "Numéro de TVA invalide",
    },
    {
      name: "phone",
      label: "Numéro de téléphone",
      placeholder: "0612345678",
      requiredError: "Numéro de téléphone requis",
    },
    {
      name: "address_street",
      label: "Adresse",
      placeholder: "123 rue de la paix",
      requiredError: "Adresse requise",
    },
    {
      name: "address_zipcode",
      label: "Code postal",
      placeholder: "12345",
      requiredError: "Code postal requis",
      invalidError: "Code postal invalide",
    },
    {
      name: "address_city",
      label: "Ville",
      placeholder: "Paris",
      requiredError: "Ville requise",
    },
    {
      name: "address_country",
      label: "Pays",
      placeholder: "France",
      requiredError: "Pays requis",
    },
  ];

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params["action"] === "create") {
        this.isEditMode.set(false);
        this.companyId.set(null);
        this.companyForm.reset();
        this.state.set("open");
      } else if (params["action"] === "edit" && params["companyId"]) {
        this.isEditMode.set(true);
        this.companyId.set(params["companyId"]);
        this.loadCompany(params["companyId"]);
        this.state.set("open");
      } else {
        this.state.set("closed");
      }
    });
  }

  getErrorMessage(field: any): string {
    const control = this.companyForm.get(field.name);
    if (control?.hasError("required")) return field.requiredError;
    if (control?.hasError("pattern") || control?.hasError("minlength") || control?.hasError("maxlength")) {
      return field.invalidError || "Champ invalide";
    }
    return "";
  }

  async loadCompany(id: string) {
    this.companiesService.getCompanyById$(id).subscribe({
      next: (company) => {
        this.companyForm.patchValue(company);
      },
      error: (error) => {
        console.error(error);
        toast.error("Impossible de charger les informations de l'entreprise");
      },
    });
  }

  onClose() {
    this.router.navigate([], {
      queryParams: { action: null, companyId: null },
      queryParamsHandling: "merge",
    });
  }

  createMutation = injectMutation(() => ({
    mutationKey: companiesKeys.add,
    mutationFn: (company: CompanyPayload) => this.companiesService.addCompany$(company),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: companiesKeys.all });
      toast.success("Société ajoutée avec succès.");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
  }));

  updateMutation = injectMutation(() => ({
    mutationKey: companiesKeys.update(this.companyId() ?? ""),
    mutationFn: (payload: { id: string; company: CompanyPayload }) =>
      this.companiesService.editCompany$(payload.id, payload.company),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: companiesKeys.all });
      toast.success("Société modifiée avec succès.");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
  }));

  handleSubmit() {
    if (this.companyForm.valid) {
      if (this.isEditMode()) {
        this.updateMutation.mutate({ id: this.companyId()!, company: this.companyForm.value as CompanyPayload });
      } else {
        this.createMutation.mutate(this.companyForm.value as CompanyPayload);
      }
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  isPending() {
    return this.createMutation.isPending() || this.updateMutation.isPending();
  }
}

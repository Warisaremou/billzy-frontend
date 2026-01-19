import { Component, effect, inject, signal } from "@angular/core";
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
import { injectMutation, injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { AuthService } from "../../../../core/auth.service";
import { Company, CustomerPayload } from "../../../../lib/types";
import { FormSelectInput } from "../../../../shared/components/form-select-input";
import { InputError } from "../../../../shared/components/input-error";
import { handleRequestError } from "../../../../shared/helpers";
import { companiesKeys } from "../../../../shared/query-keys/companies";
import { customersKeys } from "../../../../shared/query-keys/customers";
import { CompaniesService } from "../../companies/services/companies.service";
import { CustomersService } from "../services/customers.service";

@Component({
  selector: "customers-sheet",
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
    FormSelectInput,
  ],
  providers: [provideIcons({ lucidePlusCircle })],
  template: `
    <hlm-sheet side="right" (closed)="onClose()" [state]="state()">
      <hlm-sheet-content *brnSheetContent="let ctx" class="w-[400px] sm:w-[470px] sm:max-w-none">
        <form [formGroup]="customerForm" (ngSubmit)="handleSubmit()" class="flex flex-col h-full">
          <hlm-sheet-header>
            <h4 hlmSheetTitle>
              {{ isEditMode() ? "Modifier le client" : "Ajouter un client" }}
            </h4>
          </hlm-sheet-header>

          <div class="grid flex-1 auto-rows-min gap-3 px-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
            @for (field of fields; track field.name) {
              <div>
                <label hlmLabel [for]="field.name" class="required-field">{{ field.label }}</label>
                <input [id]="field.name" [placeholder]="field.placeholder" hlmInput [formControlName]="field.name" />
                @if (customerForm.get(field.name)?.touched && customerForm.get(field.name)?.errors) {
                  <app-input-error>
                    {{ getErrorMessage(field) }}
                  </app-input-error>
                }
              </div>
            }

            <!-- Company -->
            @if (isSuperAdmin()) {
              <div>
                <label hlmLabel for="company_id" class="required-field">Associé à une entreprise</label>
                <form-select-input
                  [dataList]="companies()"
                  formControlName="company_id"
                  labelKey="name"
                  valueKey="id"
                  placeholder="Sélectionner une entreprise"
                />
                @if (customerForm.get("company_id")?.touched && customerForm.get("company_id")?.errors) {
                  <app-input-error>
                    @if (customerForm.get("company_id")?.errors?.["required"]) {
                      Veuillez sélectionner une entreprise
                    }
                  </app-input-error>
                }
              </div>
            }
          </div>

          <hlm-sheet-footer class="flex-row justify-end gap-2">
            <button brnSheetClose hlmBtn variant="outline" type="button">Annuler</button>
            <button hlmBtn type="submit" [disabled]="customerForm.invalid || isPending()">
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
export class CustomersSheet {
  private readonly companiesService = inject(CompaniesService);
  private customersService = inject(CustomersService);
  private authService = inject(AuthService);
  private queryClient = inject(QueryClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  companies = signal<Company[]>([]);
  isSuperAdmin = signal(false);
  state = signal<"open" | "closed">("closed");
  isEditMode = signal(false);
  customerId = signal<string | null>(null);

  customerForm = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    siret: new FormControl("", [Validators.required, Validators.pattern("^[0-9]{14}$")]),
    tva_number: new FormControl("", [Validators.required, Validators.pattern("^[A-Z]{2}[0-9]{11}$")]),
    phone: new FormControl("", [Validators.required]),
    address_street: new FormControl("", [Validators.required]),
    address_zipcode: new FormControl("", [Validators.required, Validators.pattern("^[0-9]{5}$")]),
    address_city: new FormControl("", [Validators.required]),
    address_country: new FormControl("", [Validators.required]),
    company_id: new FormControl("", [Validators.required]),
  });

  fields = [
    {
      name: "name",
      label: "Nom du client",
      placeholder: "Acme Corp",
      requiredError: "Nom du client requis",
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
    this.isSuperAdmin.set(this.authService.isSuperAdmin());

    this.route.queryParams.subscribe((params) => {
      if (params["action"] === "create") {
        this.isEditMode.set(false);
        this.customerId.set(null);
        this.customerForm.reset();
        this.state.set("open");
      } else if (params["action"] === "edit" && params["customerId"]) {
        this.isEditMode.set(true);
        this.customerId.set(params["customerId"]);
        this.loadCustomer(params["customerId"]);
        this.state.set("open");
      } else {
        this.state.set("closed");
      }
    });

    effect(() => {
      const data = this.companiesQuery.data();
      if (this.companiesQuery.isError()) {
        handleRequestError(this.companiesQuery.error()!);
        return;
      }

      if (data) {
        this.companies.set(data);
        if (!this.isSuperAdmin() && data.length > 0) {
          console.log(data[0].id);
          this.customerForm.patchValue({ company_id: data[0].id });
        }
      }
    });
  }

  getErrorMessage(field: any): string {
    const control = this.customerForm.get(field.name);
    if (control?.hasError("required")) return field.requiredError;
    if (control?.hasError("pattern") || control?.hasError("minlength") || control?.hasError("maxlength")) {
      return field.invalidError || "Champ invalide";
    }
    return "";
  }

  companiesQuery = injectQuery(() => ({
    queryKey: this.authService.isSuperAdmin() ? companiesKeys.all : companiesKeys.userCompanies,
    queryFn: () =>
      this.authService.isSuperAdmin()
        ? this.companiesService.getCompanies$()
        : this.companiesService.getUserCompanies$(),
  }));

  async loadCustomer(id: string) {
    this.customersService.getCustomerById$(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
      },
      error: (error) => {
        console.error(error);
        toast.error("Impossible de charger les informations du client");
      },
    });
  }

  onClose() {
    this.router.navigate([], {
      queryParams: { action: null, customerId: null },
      queryParamsHandling: "merge",
    });
  }

  createMutation = injectMutation(() => ({
    mutationKey: customersKeys.add,
    mutationFn: (customer: CustomerPayload) =>
      this.customersService.addCustomer$(this.customerForm.value.company_id!, customer),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: customersKeys.all });
      toast.success("Client ajouté avec succès.");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
  }));

  updateMutation = injectMutation(() => ({
    mutationKey: customersKeys.update(this.customerId() ?? ""),
    mutationFn: (payload: { id: string; customer: CustomerPayload }) =>
      this.customersService.editCustomer$(payload.id, payload.customer),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: customersKeys.all });
      toast.success("Client modifié avec succès.");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
  }));

  handleSubmit() {
    if (this.customerForm.valid) {
      if (this.isEditMode()) {
        this.updateMutation.mutate({ id: this.customerId()!, customer: this.customerForm.value as CustomerPayload });
      } else {
        this.createMutation.mutate(this.customerForm.value as CustomerPayload);
      }
    } else {
      this.customerForm.markAllAsTouched();
    }
  }

  isPending() {
    return this.createMutation.isPending() || this.updateMutation.isPending();
  }
}

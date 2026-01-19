import { Component, effect, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucidePlusCircle } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { BrnSheetImports } from "@spartan-ng/brain/sheet";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSheetImports } from "@spartan-ng/helm/sheet";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectMutation, injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { Company, RoleInterface, UserPayload } from "../../../../lib/types";
import { FormSelectInput } from "../../../../shared/components/form-select-input";
import { InputError } from "../../../../shared/components/input-error";
import { handleRequestError } from "../../../../shared/helpers";
import { companiesKeys } from "../../../../shared/query-keys/companies";
import { usersKeys } from "../../../../shared/query-keys/users";
import { CompaniesService } from "../../companies/services/companies.service";
import { UsersService } from "../services/users.service";

@Component({
  selector: "user-sheet",
  imports: [
    FormSelectInput,
    InputError,
    ReactiveFormsModule,
    BrnSheetImports,
    HlmIconImports,
    HlmSheetImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSpinnerImports,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [provideIcons({ lucidePlusCircle })],
  template: `
    <hlm-sheet side="right" (closed)="onClose()" [state]="state()">
      <hlm-sheet-content *brnSheetContent="let ctx" class="w-[400px] sm:w-[470px] sm:max-w-none">
        <form [formGroup]="userForm" (ngSubmit)="handleSubmit()" class="flex flex-col h-full">
          <hlm-sheet-header>
            <h4 hlmSheetTitle>
              {{ isEditMode() ? "Modifier l'utilisateur" : "Ajouter un utilisateur" }}
            </h4>
          </hlm-sheet-header>

          <div class="grid flex-1 auto-rows-min gap-3 px-4 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
            <!-- Email -->
            <div>
              <label hlmLabel for="email" class="required-field">Email</label>
              <input id="email" placeholder="Email" hlmInput formControlName="email" />
              @if (userForm.get("email")?.touched && userForm.get("email")?.errors) {
                <app-input-error>
                  @if (userForm.get("email")?.errors?.["required"]) {
                    Adresse email requis
                  }
                  @if (userForm.get("email")?.errors?.["email"]) {
                    Adresse email invalide
                  }
                </app-input-error>
              }
            </div>
            <!-- First name -->
            <div>
              <label hlmLabel for="first_name" class="required-field">Prénom</label>
              <input id="first_name" placeholder="Prénom" hlmInput formControlName="first_name" />
              @if (userForm.get("first_name")?.touched && userForm.get("first_name")?.errors) {
                <app-input-error>
                  @if (userForm.get("first_name")?.errors?.["required"]) {
                    Prénom de l'utilisateur requis
                  }
                  @if (userForm.get("first_name")?.errors?.["minlength"]) {
                    Le prénom de l'utilisateur doit contenir au moins
                    {{ userForm.get("first_name")?.errors?.["minlength"]?.requiredLength }}
                    caractères
                  }
                </app-input-error>
              }
            </div>
            <!-- Last name -->
            <div>
              <label hlmLabel for="last_name" class="required-field">Nom</label>
              <input id="last_name" placeholder="Nom" hlmInput formControlName="last_name" />
              @if (userForm.get("last_name")?.touched && userForm.get("last_name")?.errors) {
                <app-input-error>
                  @if (userForm.get("last_name")?.errors?.["required"]) {
                    Nom de l'utilisateur requis
                  }
                  @if (userForm.get("last_name")?.errors?.["minlength"]) {
                    Le nom de l'utilisateur doit contenir au moins
                    {{ userForm.get("last_name")?.errors?.["minlength"]?.requiredLength }}
                    caractères
                  }
                </app-input-error>
              }
            </div>
            <!-- Role -->
            <div>
              <label hlmLabel for="role" class="required-field">Rôle</label>
              <form-select-input
                [dataList]="roles"
                formControlName="role"
                labelKey="name"
                valueKey="id"
                placeholder="Sélectionner un rôle"
              />
              @if (userForm.get("role")?.touched && userForm.get("role")?.errors) {
                <app-input-error>
                  @if (userForm.get("role")?.errors?.["required"]) {
                    Rôle de l'utilisateur requis
                  }
                </app-input-error>
              }
            </div>
            <!-- Company -->
            <div>
              <label hlmLabel for="company_id" class="required-field">Associé à une entreprise</label>
              <form-select-input
                [dataList]="companies()"
                formControlName="company_id"
                labelKey="name"
                valueKey="id"
                placeholder="Sélectionner une entreprise"
              />
              @if (userForm.get("company_id")?.touched && userForm.get("company_id")?.errors) {
                <app-input-error>
                  @if (userForm.get("company_id")?.errors?.["required"]) {
                    Veuillez sélectionner une entreprise
                  }
                </app-input-error>
              }
            </div>
          </div>

          <hlm-sheet-footer class="flex-row justify-end gap-2">
            <button brnSheetClose hlmBtn variant="outline" type="button">Annuler</button>
            <button hlmBtn type="submit" [disabled]="isPending()">
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
export class UserSheet {
  private usersService = inject(UsersService);
  private queryClient = inject(QueryClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly companiesService = inject(CompaniesService);

  companies = signal<Company[]>([]);
  state = signal<"open" | "closed">("closed");
  isEditMode = signal(false);
  userId = signal<string | null>(null);

  userForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    first_name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    last_name: new FormControl("", [Validators.required, Validators.minLength(3)]),
    role: new FormControl("", [Validators.required]),
    company_id: new FormControl("", [Validators.required]),
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params["action"] === "create") {
        this.isEditMode.set(false);
        this.userId.set(null);
        this.userForm.reset();
        this.state.set("open");
      } else if (params["action"] === "edit" && params["userId"]) {
        this.isEditMode.set(true);
        this.userId.set(params["userId"]);
        this.loadUser(params["userId"]);
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

      if (data) this.companies.set(data);
    });
  }

  companiesQuery = injectQuery(() => ({
    queryKey: companiesKeys.all,
    queryFn: () => this.companiesService.getCompanies$(),
  }));

  async loadUser(id: string) {
    this.usersService.getUserById$(id).subscribe({
      next: (user) => {
        this.userForm.patchValue(user);
      },
      error: (error) => {
        handleRequestError(error);
      },
    });
  }

  onClose() {
    this.router.navigate([], {
      queryParams: { action: null, userId: null },
      queryParamsHandling: "merge",
    });
  }

  createMutation = injectMutation(() => ({
    mutationKey: this.userForm.value.role === "admin" ? usersKeys.addAdmin : usersKeys.addEmployee,
    mutationFn: (user: UserPayload) =>
      this.userForm.value.role === "admin"
        ? this.usersService.addCompanyAdminUser$(user)
        : this.usersService.addUserToCompany$(user),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: usersKeys.all });
      toast.success("Utilisateur ajouté avec succès.");
      this.onClose();
    },
    onError: (error: any) => handleRequestError(error),
    onSettled: () => {
      this.userForm.reset();
      this.queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  }));

  // updateMutation = injectMutation(() => ({
  //   mutationKey: companiesKeys.update(this.companyId() ?? ""),
  //   mutationFn: (payload: { id: string; company: CompanyPayload }) =>
  //     this.companiesService.editCompany$(payload.id, payload.company),
  //   onSuccess: async () => {
  //     await this.queryClient.invalidateQueries({ queryKey: companiesKeys.all });
  //     toast.success("Société modifiée avec succès.");
  //     this.onClose();
  //   },
  //   onError: (error: any) => handleRequestError(error),
  // }));

  handleSubmit() {
    if (this.userForm.valid) {
      if (this.isEditMode()) {
        // this.updateMutation.mutate({ id: this.companyId()!, company: this.companyForm.value as CompanyPayload });
      } else {
        this.createMutation.mutate(this.userForm.value as UserPayload);
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  isPending() {
    return this.createMutation.isPending();
  }

  roles: RoleInterface[] = [
    { id: "admin", name: "Admin" },
    { id: "user", name: "Employé" },
  ];
}

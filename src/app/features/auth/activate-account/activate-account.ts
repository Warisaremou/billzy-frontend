import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { toast } from "ngx-sonner";
import { routes } from "../../../config/routes";
import { AuthService } from "../../../core/auth.service";
import { SharedFormCard } from "../../../shared/components/cards/shared-form-card/shared-form-card";
import { InputError } from "../../../shared/components/input-error";

@Component({
  selector: "app-activate-account",
  imports: [
    HlmLabelImports,
    ReactiveFormsModule,
    HlmInputImports,
    HlmButtonImports,
    SharedFormCard,
    InputError,
    HlmSpinner,
  ],
  templateUrl: "./activate-account.html",
})
export class ActivateAccountPage {
  isLoading = signal(false);

  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  router = inject(Router);

  activateAccountForm = new FormGroup({
    token: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)]),
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const token = params["token"] || "";
      if (!token) {
        this.router.navigate([routes.auth.login]);
      }
      this.activateAccountForm.get("token")?.setValue(token);
    });
  }

  handleSubmit() {
    if (this.activateAccountForm.invalid) {
      this.activateAccountForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .activateAccount$({
        token: this.activateAccountForm.value.token!,
        password: this.activateAccountForm.value.password!,
      })
      .subscribe({
        next: () => {
          toast.success("Compte activé avec succès!");
          this.router.navigate([routes.auth.login]);
        },
        error: () => {
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }
}

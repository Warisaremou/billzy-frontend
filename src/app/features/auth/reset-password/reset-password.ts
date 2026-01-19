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
  selector: "app-reset-password",
  imports: [
    HlmLabelImports,
    ReactiveFormsModule,
    HlmInputImports,
    HlmButtonImports,
    SharedFormCard,
    InputError,
    HlmSpinner,
  ],
  templateUrl: "./reset-password.html",
})
export class ResetPasswordPage {
  isLoading = signal(false);

  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  router = inject(Router);

  resetPasswordForm = new FormGroup({
    hash: new FormControl("", [Validators.required]),
    newPassword: new FormControl("", [Validators.required, Validators.minLength(6)]),
  });

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const hash = params["token"] || "";
      if (!hash) {
        this.router.navigate([routes.auth.login]);
      }
      this.resetPasswordForm.get("hash")?.setValue(hash);
    });
  }

  handleSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService
      .resetPassword$({
        hash: this.resetPasswordForm.value.hash!,
        newPassword: this.resetPasswordForm.value.newPassword!,
      })
      .subscribe({
        next: () => {
          toast.success("Mot de passe réinitialisé avec succès");
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

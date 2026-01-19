import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { toast } from "ngx-sonner";
import { AuthService } from "../../../core/auth.service";
import { SharedFormCard } from "../../../shared/components/cards/shared-form-card/shared-form-card";
import { InputError } from "../../../shared/components/input-error";

@Component({
  selector: "app-forgot-password",
  imports: [
    RouterLink,
    HlmLabelImports,
    ReactiveFormsModule,
    HlmInputImports,
    HlmButtonImports,
    SharedFormCard,
    InputError,
    HlmSpinner,
  ],
  templateUrl: "./forgot-password.html",
})
export class ForgotPasswordPage {
  isLoading = signal(false);
  authService = inject(AuthService);

  reqestPasswordResetForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
  });

  handleSubmit() {
    if (this.reqestPasswordResetForm.invalid) {
      this.reqestPasswordResetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.requestPasswordReset$(this.reqestPasswordResetForm.value.email!).subscribe({
      next: () => {
        toast.success(
          "Un email de réinitialisation de mot de passe vous a été envoyé à " +
            this.reqestPasswordResetForm.value.email,
        );
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

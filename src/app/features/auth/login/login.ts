import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { toast } from "ngx-sonner";
import { routes } from "../../../config/routes";
import { AuthService } from "../../../core/auth.service";
import { SharedFormCard } from "../../../shared/components/cards/shared-form-card/shared-form-card";
import { InputError } from "../../../shared/components/input-error";

@Component({
  selector: "app-login",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmSpinnerImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    SharedFormCard,
    InputError,
  ],
  templateUrl: "./login.html",
})
export class LoginPage {
  isLoading = signal(false);
  router = inject(Router);
  authService = inject(AuthService);

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)]),
  });

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;
    this.authService.login$({ email: email!, password: password! }).subscribe({
      next: () => {
        toast.success("An OTP has been sent to your email for confirmation.");
        this.authService.userEmail.set(email!);
        this.router.navigate([routes.auth.loginConfirm]);
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

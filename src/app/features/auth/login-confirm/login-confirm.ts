import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCircleAlert, lucideMoveLeft } from "@ng-icons/lucide";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmIcon } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { toast } from "ngx-sonner";
import { routes } from "../../../config/routes";
import { AuthService } from "../../../core/auth.service";
import { SharedFormCard } from "../../../shared/components/cards/shared-form-card/shared-form-card";
import { InputError } from "../../../shared/components/input-error";

@Component({
  selector: "app-login-confirm",
  imports: [
    ReactiveFormsModule,
    HlmAlertImports,
    HlmSpinnerImports,
    NgIcon,
    HlmIcon,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    SharedFormCard,
    RouterLink,
    InputError,
  ],
  providers: [provideIcons({ lucideCircleAlert, lucideMoveLeft })],
  templateUrl: "./login-confirm.html",
})
export class LoginConfirmPage {
  isLoading = signal(false);
  router = inject(Router);
  authService = inject(AuthService);

  loginConfirmForm = new FormGroup({
    otp: new FormControl("", [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  handleSubmit() {
    if (this.loginConfirmForm.invalid) {
      this.loginConfirmForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const payload = {
      email: this.authService.userEmail()!,
      otp: this.loginConfirmForm.value.otp!,
    };

    this.authService.confirmLogin$(payload).subscribe({
      next: () => {
        toast.success("Login successful!");
        this.router.navigate([routes.dashboard.overview]);
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

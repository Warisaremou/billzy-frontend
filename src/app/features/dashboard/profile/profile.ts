import { Component, computed, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { injectMutation } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { AuthService } from "../../../core/auth.service";
import { UpdateUserPayload } from "../../../lib/types";
import { InputError } from "../../../shared/components/input-error";
import { handleRequestError } from "../../../shared/helpers";
import { usersKeys } from "../../../shared/query-keys/users";
import { ProfileService } from "./services/profile.service";

@Component({
  selector: "app-profile",
  standalone: true,
  templateUrl: "./profile.html",
  imports: [HlmSpinner, InputError, ReactiveFormsModule, HlmLabelImports, HlmInputImports, HlmButtonImports],
})
export class ProfilePage {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  isEditMode = signal(false);
  public readonly user = computed(() => this.authService.currentUser());

  profileForm = new FormGroup({
    email: new FormControl(this.user()?.email, [Validators.required, Validators.email]),
    first_name: new FormControl(this.user()?.first_name, [Validators.required, Validators.minLength(2)]),
    last_name: new FormControl(this.user()?.last_name, [Validators.required, Validators.minLength(2)]),
  });

  updateProfileMutation = injectMutation(() => ({
    mutationKey: usersKeys.updateProfile,
    mutationFn: () => this.profileService.updateProfile$(this.profileForm.value as UpdateUserPayload),
    onSuccess: () => {
      this.authService.me$().subscribe();
      toast.success("Profile updated successfully");
      this.isEditMode.set(false);
    },
    onError: (error: any) => handleRequestError(error),
  }));

  handleSubmit() {
    if (this.isEditMode()) {
      this.updateProfileMutation.mutate();
    } else {
      this.isEditMode.set(true);
    }
  }
}

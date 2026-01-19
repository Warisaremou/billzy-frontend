import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/auth.service";

@Component({
  selector: "app-overview",
  imports: [],
  template: `<div class="flex flex-col gap-3">
    <h4>Bienvenue {{ currentUser()?.first_name }} {{ currentUser()?.last_name }}</h4>
  </div>`,
})
export class OverviewPage {
  private readonly authService = inject(AuthService);
  public readonly currentUser = this.authService.currentUser;
}

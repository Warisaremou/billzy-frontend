import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBell, lucideChevronsUpDown, lucideCircleUser, lucideLogOut } from "@ng-icons/lucide";
import { HlmAvatarImports } from "@spartan-ng/helm/avatar";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmSidebarImports, HlmSidebarService } from "@spartan-ng/helm/sidebar";
import { AuthService } from "../../core/auth.service";
import { User } from "../../lib/types";

@Component({
  selector: "spartan-nav-user",
  imports: [HlmSidebarImports, HlmAvatarImports, NgIcon, HlmDropdownMenuImports, RouterLink],
  providers: [
    provideIcons({
      lucideChevronsUpDown,
      lucideCircleUser,
      lucideBell,
      lucideLogOut,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let u = user();
    <ul hlmSidebarMenu>
      <li hlmSidebarMenuItem>
        <button hlmSidebarMenuButton size="lg" [hlmDropdownMenuTrigger]="menu" [side]="_menuSide()" align="end">
          <hlm-avatar class="rounded-none">
            <!-- TODO: Create custom pipe for initials -->
            <span class="rounded-none bg-primary text-white" hlmAvatarFallback> JD </span>
          </hlm-avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{{ u.first_name }} {{ u.last_name }}</span>
            <span class="truncate text-xs">{{ u.email }}</span>
          </div>
          <ng-icon name="lucideChevronsUpDown" class="ml-auto text-base" />
        </button>
      </li>
    </ul>

    <ng-template #menu>
      <hlm-dropdown-menu class="min-w-56 rounded-none">
        <hlm-dropdown-menu-label>
          <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <hlm-avatar class="rounded-none">
              <span class="rounded-none bg-primary text-white" hlmAvatarFallback>JD</span>
            </hlm-avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ u.first_name }} {{ u.last_name }}</span>
              <span class="truncate text-xs">{{ u.email }}</span>
            </div>
          </div>
        </hlm-dropdown-menu-label>
        <hlm-dropdown-menu-separator />
        <hlm-dropdown-menu-group>
          <button hlmDropdownMenuItem routerLink="/dashboard/profile">
            <ng-icon name="lucideCircleUser" />
            Mon Profile
          </button>
        </hlm-dropdown-menu-group>
        <hlm-dropdown-menu-separator />
        <button hlmDropdownMenuItem (click)="handleLogout()">
          <ng-icon name="lucideLogOut" />
          Se déconnecter
        </button>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class NavUser {
  private readonly authService = inject(AuthService);
  private readonly _sidebarService = inject(HlmSidebarService);
  protected readonly _menuSide = computed(() => (this._sidebarService.isMobile() ? "top" : "right"));

  public readonly user = input.required<User>();

  handleLogout(): void {
    this.authService.logout$().subscribe();
  }
}

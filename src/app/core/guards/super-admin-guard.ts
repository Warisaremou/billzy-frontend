import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { routes } from "../../config/routes";
import { Role } from "../../lib/types";
import { AuthService } from "../auth.service";

export const superAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const idSuperAdmin = authService.currentUser()?.role === Role.SUPER_ADMIN;

  if (idSuperAdmin) {
    return true;
  }

  return router.parseUrl(routes.accessDenied);
};

import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { routes } from "../../config/routes";
import { AuthService } from "../auth.service";

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  return authService.me$().pipe(
    map(() => true),
    catchError(() => {
      router.navigate([routes.auth.login]);
      return of(false);
    }),
  );
};

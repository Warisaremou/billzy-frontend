import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../auth.service";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  const newReq = req.clone({
    withCredentials: true,
  });

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes("/auth/login") && !req.url.includes("/auth/refresh")) {
        return authService.refreshToken$().pipe(
          switchMap(() => next(newReq)),
          catchError((refreshError) => throwError(() => refreshError)),
        );
      }
      return throwError(() => error);
    }),
  );
}

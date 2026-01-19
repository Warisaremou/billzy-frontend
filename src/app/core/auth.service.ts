import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { toast } from "ngx-sonner";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { routes } from "../config/routes";
import {
  ActivateAccountPayload,
  LoginConfirmPayload,
  LoginPayload,
  ResetPasswordPayload,
  Role,
  User,
} from "../lib/types";

@Injectable({ providedIn: "root" })
export class AuthService {
  private BASE_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private router = inject(Router);

  userEmail = signal<string | null>(null);
  currentUser = signal<User | null>(null);
  isSuperAdmin = computed(() => this.currentUser()?.role === Role.SUPER_ADMIN);

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.me$().subscribe({
      next: () => {},
      error: () => {
        this.currentUser.set(null);
      },
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  login$(payload: LoginPayload) {
    return this.http.post(`${this.BASE_URL}/auth/login`, payload).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error?.message || "Login failed. Please try again.";

          toast.error(errorMessage);
          return throwError(() => new Error(errorMessage));
        }
        toast.error("An unexpected error occurred");
        return throwError(() => new Error("An unexpected error occurred"));
      }),
    );
  }

  confirmLogin$(payload: LoginConfirmPayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/login/confirm`, payload).pipe(
      tap(() => {
        this.userEmail.set(null);
      }),
      switchMap(() => this.me$()),
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error?.message || "Login confirmation failed. Please try again.";

          toast.error(errorMessage);
          return throwError(() => new Error(errorMessage));
        }
        toast.error("An unexpected error occurred");
        return throwError(() => new Error("An unexpected error occurred"));
      }),
    );
  }

  activateAccount$(payload: ActivateAccountPayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/activate-account`, payload).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error?.message || "An error occurred while activating the account";

          toast.error(errorMessage);
          return throwError(() => new Error(errorMessage));
        }
        toast.error("An unexpected error occurred");
        return throwError(() => new Error("An unexpected error occurred"));
      }),
    );
  }

  resendOtp$(email: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/resend-otp`, { email });
  }

  requestPasswordReset$(email: string) {
    return this.http.post(`${this.BASE_URL}/auth/forgot-password`, { email }).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error?.message || "An error occurred while sending the reset password email";

          toast.error(errorMessage);
          return throwError(() => new Error(errorMessage));
        }
        toast.error("An unexpected error occurred");
        return throwError(() => new Error("An unexpected error occurred"));
      }),
    );
  }

  resetPassword$(payload: ResetPasswordPayload): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/reset-password`, payload).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error?.message || "An error occurred while resetting the password";

          toast.error(errorMessage);
          return throwError(() => new Error(errorMessage));
        }
        toast.error("An unexpected error occurred");
        return throwError(() => new Error("An unexpected error occurred"));
      }),
    );
  }

  refreshToken$(): Observable<any> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http.post(`${this.BASE_URL}/auth/refresh`, {}).pipe(
      tap((response: any) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response);
      }),
      catchError((error: any) => {
        this.isRefreshing = false;
        this.currentUser.set(null);
        this.router.navigate([routes.auth.login]);
        return throwError(() => error);
      }),
    );
  }

  me$(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.currentUser.set(null);
        }
        return throwError(() => error);
      }),
    );
  }

  logout$(): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate([routes.auth.login]);
        toast.success("Logged out successfully");
      }),
      catchError((error: any) => {
        this.currentUser.set(null);
        this.router.navigate([routes.auth.login]);
        toast.error("Logout failed. Please try again.");
        return throwError(() => error);
      }),
    );
  }
}

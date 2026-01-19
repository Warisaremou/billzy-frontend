import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth-guard";
import { superAdminGuard } from "./core/guards/super-admin-guard";
import { LandingPage } from "./features/landing/landing";
import { NotFound } from "./shared/components/not-found/not-found";

export const routes: Routes = [
  {
    path: "",
    title: "Billzy",
    component: LandingPage,
  },
  {
    path: "auth",
    loadComponent: () => import("./shared/components/layouts/auth/auth-layout").then((m) => m.AuthLayout),
    children: [
      {
        path: "login",
        title: "Connexion - Billzy",
        loadComponent: () => import("./features/auth/login/login").then((m) => m.LoginPage),
      },
      {
        path: "login-confirm",
        title: "Confirmation de connexion - Billzy",
        loadComponent: () => import("./features/auth/login-confirm/login-confirm").then((m) => m.LoginConfirmPage),
      },
      {
        path: "activate-account",
        title: "Activation de compte - Billzy",
        loadComponent: () =>
          import("./features/auth/activate-account/activate-account").then((m) => m.ActivateAccountPage),
      },
      {
        path: "forgot-password",
        title: "Mot de passe oublié - Billzy",
        loadComponent: () =>
          import("./features/auth/forgot-password/forgot-password").then((m) => m.ForgotPasswordPage),
      },
      {
        path: "reset-password",
        title: "Réinitialisation de mot de passe - Billzy",
        loadComponent: () => import("./features/auth/reset-password/reset-password").then((m) => m.ResetPasswordPage),
      },
    ],
  },
  {
    path: "dashboard",
    title: "Dashboard - Billzy",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./shared/components/layouts/dashboard/dashboard-layout").then((m) => m.DashboardLayout),
    children: [
      {
        path: "",
        redirectTo: "/dashboard/overview",
        pathMatch: "full",
      },
      {
        path: "overview",
        title: "Aperçu - Billzy",
        loadComponent: () => import("./features/dashboard/overview/overview").then((m) => m.OverviewPage),
      },
      {
        path: "companies",
        title: "Entreprises - Billzy",
        canActivate: [superAdminGuard],
        loadComponent: () => import("./features/dashboard/companies/companies").then((m) => m.CompaniesPage),
      },
      {
        path: "invoices",
        title: "Factures - Billzy",
        loadComponent: () => import("./features/dashboard/invoices/invoices").then((m) => m.InvoicesPage),
      },
      {
        path: "invoices/create",
        title: "Créer une facture - Billzy",
        loadComponent: () =>
          import("./features/dashboard/invoices/create/create-invoice").then((m) => m.CreateInvoicePage),
      },
      {
        path: "invoices/:id/edit",
        title: "Modifier une facture - Billzy",
        loadComponent: () => import("./features/dashboard/invoices/edit/edit-invoice").then((m) => m.EditInvoicePage),
      },
      {
        path: "customers",
        title: "Clients - Billzy",
        loadComponent: () => import("./features/dashboard/customers/customers").then((m) => m.CustomersPage),
      },
      {
        path: "users",
        title: "Utilisateurs - Billzy",
        canActivate: [superAdminGuard],
        loadComponent: () => import("./features/dashboard/users/users").then((m) => m.UsersPage),
      },
      {
        path: "profile",
        title: "Profile - Billzy",
        loadComponent: () => import("./features/dashboard/profile/profile").then((m) => m.ProfilePage),
      },
      {
        path: "settings",
        title: "Paramètres Généraux - Billzy",
        loadComponent: () =>
          import("./features/dashboard/settings/generals/generals").then((m) => m.GeneralSettingsPage),
      },
      {
        path: "settings/members",
        title: "Paramètres Equipe - Billzy",
        loadComponent: () => import("./features/dashboard/settings/members/members").then((m) => m.MembersSettingsPage),
      },
    ],
  },
  {
    path: "access-denied",
    title: "Accès refusé - Billzy",
    loadComponent: () => import("./shared/components/access-denied/access-denied").then((m) => m.AccessDenied),
  },
  {
    path: "**",
    title: "Page Introuvable - Billzy",
    component: NotFound,
  },
];

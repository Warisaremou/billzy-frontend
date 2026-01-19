export const routes = {
  landing: {
    index: "/",
  } as const,

  auth: {
    login: "/auth/login",
    loginConfirm: "/auth/login-confirm",
    activateAccount: "/auth/activate-account",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    refresh: "/auth/refresh",
  } as const,

  dashboard: {
    overview: "/dashboard/overview",
    companies: "/dashboard/companies",
    invoices: {
      index: "/dashboard/invoices",
      create: "/dashboard/invoices/create",
      edit: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/edit`,
      invoiceItems: (invoiceId: string) => `/dashboard/invoices/${invoiceId}/items`,
    },
    customers: "/dashboard/customers",
    users: "/dashboard/users",
    settings: {
      general: "/dashboard/settings",
      members: "/dashboard/settings/members",
    },
  } as const,

  accessDenied: "/access-denied",
};

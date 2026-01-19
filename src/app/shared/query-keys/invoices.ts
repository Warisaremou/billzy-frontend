export const invoicesKeys = {
  all: ["invoices"] as const,
  userCompanies: ["user-company-invoices"] as const,
  byId: (id: string) => [...invoicesKeys.all, id] as const,
  add: ["add-invoice"] as const,
  update: (id: string) => [...invoicesKeys.all, id, "update"] as const,
  delete: (id: string) => [...invoicesKeys.all, id, "delete"] as const,
};

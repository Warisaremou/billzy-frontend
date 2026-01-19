export const companiesKeys = {
  all: ["companies"] as const,
  userCompanies: ["user-companies"] as const,
  byId: (id: string) => [...companiesKeys.all, id] as const,
  add: ["add-company"] as const,
  update: (id: string) => [...companiesKeys.all, id, "update"] as const,
  delete: (id: string) => [...companiesKeys.all, id, "delete"] as const,
};

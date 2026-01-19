export const customersKeys = {
  all: ["clients"] as const,
  companyClients: ["company-clients"] as const,
  byId: (id: string) => [...customersKeys.all, id] as const,
  add: ["add-client"] as const,
  update: (id: string) => [...customersKeys.all, id, "update"] as const,
  delete: (id: string) => [...customersKeys.all, id, "delete"] as const,
};

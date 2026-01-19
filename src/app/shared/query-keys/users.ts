export const usersKeys = {
  all: ["users"] as const,
  byId: (id: string) => [...usersKeys.all, id] as const,
  addAdmin: ["add-admin"] as const,
  addEmployee: ["add-employee"] as const,
  edit: (id: string) => [...usersKeys.all, id, "edit"] as const,
  updateProfile: ["update-profile"] as const,
  delete: (id: string) => [...usersKeys.all, id, "delete"] as const,
};

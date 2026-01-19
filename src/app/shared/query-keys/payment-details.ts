export const paymentDetailsKeys = {
  all: ["payment-details"] as const,
  companyPaymentDetails: ["company-payment-details"] as const,
  byId: (id: string) => [...paymentDetailsKeys.companyPaymentDetails, id] as const,
  add: ["add-payment-details"] as const,
  update: (id: string) => [...paymentDetailsKeys.companyPaymentDetails, id, "update"] as const,
  delete: (id: string) => [...paymentDetailsKeys.companyPaymentDetails, id, "delete"] as const,
};

export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

export interface RoleInterface {
  id: string;
  name: string;
}

export enum InvoiceStatus {
  DRAFT = "brouillon",
  PUBLISHED = "publié",
}

export enum InvoicePaymentStatus {
  PAID = "payée",
  UNPAID = "impayée",
  PARTIALLY_PAID = "partiellement payée",
}

export interface PaymentStatus {
  id: (typeof InvoicePaymentStatus)[keyof typeof InvoicePaymentStatus];
  name: string;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginConfirmPayload = {
  email: string;
  otp: string;
};

export type ActivateAccountPayload = {
  token: string;
  password: string;
};

export type ResetPasswordPayload = {
  hash: string;
  newPassword: string;
};

export interface EntityDates {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User extends EntityDates {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_active: boolean;
  __companies__: Company[];
}

export type UserPayload = {
  email: string;
  first_name: string;
  last_name: string;
  company_id: string;
};

interface Base extends EntityDates {
  id: string;
  name: string;
  siret: string;
  tva_number: string;
  phone: string;
  address_street: string;
  address_zipcode: string;
  address_city: string;
  address_country: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface Customer extends Base {
  companies: Company[];
  invoices: Invoice[];
}

export interface Company extends Base {
  users: User[];
  clients: Customer[];
  invoices: Invoice[];
}

export interface Invoice extends EntityDates {
  id: string;
  reference: string;
  subject: string;
  issue_date: Date;
  due_date: Date;
  status: InvoiceStatus;
  payment_status: InvoicePaymentStatus;
  company: Company;
  client: Customer;
  __items__: InvoiceItem[];
  total_ht: number;
  total_vat: number;
  total_ttc: number;
}

export interface InvoiceItem extends EntityDates {
  label: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export interface PaymentDetails extends EntityDates {
  id: string;
  owner_name: string;
  iban: string;
  bic: string;
  bank_name: string;
  company: Company;
}

export interface TermsAndConditions extends EntityDates {
  id: string;
  content: string;
  company: Company;
}

export interface PaymentDetailsPayload {
  owner_name: string;
  iban: string;
  bic: string;
  bank_name: string;
  company_id: string;
}

export interface TermsAndConditionsPayload {
  content: string;
  company_id: string;
}

export interface CompanyPayload {
  name: string;
  siret: string;
  tva_number: string;
  phone: string;
  address_street: string;
  address_zipcode: string;
  address_city: string;
  address_country: string;
}

export interface CustomerPayload extends CompanyPayload {}

export interface InvoicePayload {
  company_id: string;
  due_date: string;
  client_id: string;
  items: string[];
}

export type EditInvoicePayload = Pick<InvoicePayload, "due_date" | "client_id">;

export interface UpdateUserPayload {
  first_name: string;
  last_name: string;
}

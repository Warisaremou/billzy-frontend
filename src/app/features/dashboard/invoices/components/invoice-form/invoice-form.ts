import { DatePipe } from "@angular/common";
import { Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideSave, lucideSend, lucideWallet, lucideX } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDatePickerImports, provideHlmDatePickerConfig } from "@spartan-ng/helm/date-picker";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { HlmTextareaImports } from "@spartan-ng/helm/textarea";
import { injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { DateTime } from "luxon";
import { toast } from "ngx-sonner";
import { lastValueFrom, startWith } from "rxjs";
import { routes } from "../../../../../config/routes";
import { AuthService } from "../../../../../core/auth.service";
import { Company, Customer, Invoice, InvoiceStatus } from "../../../../../lib/types";
import { SelectInput } from "../../../../../shared/components/select-input";
import { handleRequestError } from "../../../../../shared/helpers";
import { AmountPipe } from "../../../../../shared/pipes/amount.pipe";
import { companiesKeys } from "../../../../../shared/query-keys/companies";
import { customersKeys } from "../../../../../shared/query-keys/customers";
import { invoicesKeys } from "../../../../../shared/query-keys/invoices";
import { paymentDetailsKeys } from "../../../../../shared/query-keys/payment-details";
import { termsConditionsKeys } from "../../../../../shared/query-keys/terms-conditions";
import { CompaniesService } from "../../../companies/services/companies.service";
import { CustomersService } from "../../../customers/services/customers.service";
import { PaymentDetailsService } from "../../../settings/generals/components/forms/payments-details/services/payment-details.service";
import { TermsConditionsService } from "../../../settings/generals/terms-conditions/services/terms-conditions.service";
import { InvoiceContextService } from "../../services/invoice-context.service";
import { InvoiceService } from "../../services/invoice.service";
@Component({
  selector: "invoice-form",
  imports: [
    SelectInput,
    HlmDatePickerImports,
    HlmTextareaImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSeparatorImports,
    HlmButtonImports,
    NgIcon,
    HlmIconImports,
    ReactiveFormsModule,
    DatePipe,
    AmountPipe,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({ lucideSave, lucideSend, lucidePlus, lucideX, lucideWallet }),
    provideHlmDatePickerConfig({
      formatDate: (date: Date) => DateTime.fromJSDate(date).toFormat("dd/MM/yyyy"),
      transformDate: (date: Date) => DateTime.fromJSDate(date).toJSDate(),
    }),
  ],
  templateUrl: `./invoice-form.html`,
})
export class InvoiceForm {
  isEdit = input<boolean>(false);
  invoice = input<Invoice | null>(null);
  initialCompany = input<Company | null>(null);
  initialClient = input<Customer | null>(null);

  private readonly invoiceContextService = inject(InvoiceContextService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly companiesService = inject(CompaniesService);
  private readonly customersService = inject(CustomersService);
  private readonly paymentDetailsService = inject(PaymentDetailsService);
  private readonly termsConditionsService = inject(TermsConditionsService);
  private readonly authService = inject(AuthService);
  queryClient = inject(QueryClient);

  isSuperAdmin = computed(() => this.authService.isSuperAdmin());

  totalHt = signal<number>(0);
  tva = signal<number>(0);
  totalTTC = signal<number>(0);
  invoiceItemIds = signal<string[]>([]);
  isPending = signal(false);
  selectedCompany = signal<Company | null>(null);
  selectedClient = signal<Customer | null>(null);
  isPublishing = signal(false);
  isPublished = signal(false);

  constructor() {
    effect(() => {
      if (!this.isEdit()) {
        this.invoiceContextService.initItems([]);
        this.invoiceContextService.addItem();
      }
      const company = this.initialCompany();
      const client = this.initialClient();

      if (this.invoice()) {
        this.isPublished.set(this.invoice()?.status === InvoiceStatus.PUBLISHED);
      }

      if (company) {
        this.selectedCompany.set(company);
      }
      if (client) {
        this.selectedClient.set(client);
      }
    });
  }

  selectedCompanyId = computed(() => this.selectedCompany()?.id ?? null);
  companyDetails = computed(() => this.formatDetails(this.selectedCompany()));
  clientDetails = computed(() => this.formatDetails(this.selectedClient()));

  invoiceForm = this.invoiceContextService.invoiceForm;
  items = this.invoiceContextService.items;
  addItem = this.invoiceContextService.addItem;

  readonly routes = routes;

  companiesQuery = injectQuery(() => ({
    queryKey: this.isSuperAdmin() ? companiesKeys.all : companiesKeys.userCompanies,
    queryFn: () =>
      this.isSuperAdmin() ? this.companiesService.getCompanies$() : this.companiesService.getUserCompanies$(),
  }));

  customersQuery = injectQuery(() => ({
    queryKey: [customersKeys.all, this.selectedCompanyId()],
    queryFn: () => this.customersService.getCustomersByCompany$(this.selectedCompanyId() as string),
    enabled: this.selectedCompanyId() !== null,
  }));

  paymentDetailsQuery = injectQuery(() => ({
    queryKey: [paymentDetailsKeys.all, this.selectedCompanyId()],
    queryFn: () => this.paymentDetailsService.getPaymentDetailsByCompany$(this.selectedCompanyId() as string),
    enabled: !!this.selectedCompanyId(),
  }));

  termsConditionsQuery = injectQuery(() => ({
    queryKey: [termsConditionsKeys.all, this.selectedCompanyId()],
    queryFn: () =>
      lastValueFrom(this.termsConditionsService.getTermsConditionsByCompany$(this.selectedCompanyId() as string)),
    enabled: !!this.selectedCompanyId(),
  }));

  onCompanySelect(company: Company | null) {
    this.selectedCompany.set(company);
    this.selectedClient.set(null);
    this.invoiceForm.patchValue({
      company_id: company?.id ?? null,
      client_id: null,
    });
  }

  onClientSelect(client: Customer | null) {
    this.selectedClient.set(client);
    this.invoiceForm.patchValue({
      client_id: client?.id ?? null,
    });
  }

  private formatDetails(entity: Company | Customer | null): string {
    if (!entity) return "";
    return [
      entity.name,
      entity.address_street,
      `${entity.address_zipcode} ${entity.address_city} ${entity.address_country}`,
      entity.phone ? `Tél: ${entity.phone}` : "",
      entity.tva_number ? `TVA: ${entity.tva_number}` : "",
      entity.siret ? `SIRET: ${entity.siret}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  save = output<any>();

  async handleSubmit() {
    const rawValue = this.invoiceForm.getRawValue();
    const payload = {
      ...rawValue,
      due_date: rawValue.due_date ? DateTime.fromJSDate(rawValue.due_date).toFormat("yyyy-MM-dd") : null,
    };

    if (!payload.client_id || !payload.company_id) {
      toast.error("Veuillez selectionner un client et une entreprise");
      return;
    }
    if (!payload.due_date) {
      toast.error("Veuillez selectionner une date d'expiration");
      return;
    }

    this.save.emit(payload);
  }

  removeItemFromInvoice(item_id: string | null | undefined, index: number) {
    if (this.isEdit() && item_id) {
      const invoice = this.invoice();
      if (!invoice) return;

      this.invoiceService.removeItemFromInvoice$(invoice.id, item_id).subscribe({
        next: () => {
          this.queryClient.invalidateQueries({ queryKey: invoicesKeys.byId(invoice.id) });
          this.queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
        error: (err) => {
          handleRequestError(err);
        },
      });
    } else {
      this.invoiceContextService.removeItem(index);
    }
  }

  publishInvoice() {
    const invoice = this.invoice();
    if (!invoice) return;

    this.isPublishing.set(true);
    this.invoiceService.publishInvoice$(invoice.id).subscribe({
      next: () => {
        toast.success("Facture publiée");
        this.queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      },
      error: (err) => {
        this.isPublishing.set(false);
        handleRequestError(err);
      },
      complete: () => {
        this.isPublishing.set(false);
      },
    });
  }

  ngOnInit() {
    this.invoiceForm.patchValue({
      due_date: new Date(),
    });

    this.items.valueChanges.pipe(startWith(this.items.value)).subscribe((items) => {
      let totalHt = 0;
      let tva = 0;

      items.forEach((item: any) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unit_price || 0;
        const vatRate = item.vat_rate || 0;

        const lineTotalHt = quantity * unitPrice;
        const lineTva = (lineTotalHt * vatRate) / 100;

        totalHt += lineTotalHt;
        tva += lineTva;
      });

      this.totalHt.set(parseFloat(totalHt.toFixed(2)));
      this.tva.set(parseFloat(tva.toFixed(2)));
      this.totalTTC.set(parseFloat((totalHt + tva).toFixed(2)));
    });
  }
}

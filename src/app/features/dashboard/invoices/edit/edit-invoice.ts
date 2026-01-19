import { Component, effect, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucidePlus, lucideSave, lucideSend, lucideWallet, lucideX } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDatePickerImports, provideHlmDatePickerConfig } from "@spartan-ng/helm/date-picker";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmLabelImports } from "@spartan-ng/helm/label";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { HlmTextareaImports } from "@spartan-ng/helm/textarea";
import { injectMutation, injectQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { DateTime } from "luxon";
import { toast } from "ngx-sonner";
import { routes } from "../../../../config/routes";
import { Company, Customer, EditInvoicePayload, Invoice } from "../../../../lib/types";
import { handleRequestError } from "../../../../shared/helpers";
import { invoicesKeys } from "../../../../shared/query-keys/invoices";
import { InvoiceForm } from "../components/invoice-form/invoice-form";
import { InvoiceContextService } from "../services/invoice-context.service";
import { InvoiceItemsService } from "../services/invoice-items.service";
import { InvoiceService } from "../services/invoice.service";

@Component({
  selector: "app-create-invoice",
  imports: [
    InvoiceForm,
    HlmDatePickerImports,
    HlmTextareaImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSeparatorImports,
    HlmButtonImports,
    HlmIconImports,
    ReactiveFormsModule,
    HlmSpinnerImports,
  ],
  providers: [
    provideIcons({ lucideSave, lucideSend, lucidePlus, lucideX, lucideWallet }),
    provideHlmDatePickerConfig({
      formatDate: (date: Date) => DateTime.fromJSDate(date).toFormat("dd/MM/yyyy"),
      transformDate: (date: Date) => DateTime.fromJSDate(date).toJSDate(),
    }),
  ],
  template: `<invoice-form
    [isEdit]="true"
    [invoice]="invoice()"
    [initialCompany]="currentCompany()"
    [initialClient]="currentClient()"
    (save)="handleInvoiceUpdate($event)"
  />`,
})
export class EditInvoicePage {
  invoiceId = signal("");
  invoice = signal<Invoice | null>(null);
  currentCompany = signal<Company | null>(null);
  currentClient = signal<Customer | null>(null);

  private activatedRoute = inject(ActivatedRoute);
  private readonly invoiceContextService = inject(InvoiceContextService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly invoiceItemsService = inject(InvoiceItemsService);
  private queryClient = inject(QueryClient);
  private router = inject(Router);

  invoiceForm = this.invoiceContextService.invoiceForm;
  items = this.invoiceContextService.items;

  readonly routes = routes;

  invoiceData = injectQuery<Invoice>(() => ({
    queryKey: invoicesKeys.byId(this.invoiceId()),
    queryFn: () => this.invoiceService.getInvoiceById$(this.invoiceId()),
    enabled: this.invoiceId() !== "",
  }));

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.invoiceId.set(params["id"]);
    });

    if (this.invoiceData.isError()) {
      handleRequestError(this.invoiceData.error());
      return;
    }

    effect(() => {
      const data = this.invoiceData.data();

      if (!data) return;

      this.invoice.set(data);
      this.currentCompany.set(data.company);
      this.currentClient.set(data.client);
      this.invoiceForm.patchValue({
        company_id: data.company.id,
        client_id: data.client.id,
        due_date: data.due_date ? new Date(data.due_date) : null,
      });
      this.invoiceContextService.initItems(data.__items__);
      return;
    });
  }

  async handleInvoiceUpdate(payload: any) {
    if (this.items.length === 0) {
      toast.error("Veuillez ajouter des articles à la facture");
      return;
    }

    const { items, company_id, ...body } = payload;

    try {
      const newItems = items
        .filter((item: any) => !item.id)
        .map((item: any) => ({
          label: item.label,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
        }));

      if (newItems.length > 0) {
        this.invoiceItemsService.addInvoiceItems$(newItems).subscribe({
          next: (ids) => {
            this.invoiceService.addNewItemsToInvoice$(this.invoiceId(), ids).subscribe({
              next: () => {
                this.updateInvoiceMutation.mutate({
                  ...body,
                });
              },
              error: (err) => handleRequestError(err),
            });
          },
          error: (err) => handleRequestError(err),
        });
      }

      this.updateInvoiceMutation.mutate({
        ...body,
      });
    } catch (error) {
      handleRequestError(error);
    }
  }

  updateInvoiceMutation = injectMutation(() => ({
    mutationKey: invoicesKeys.update(this.invoiceId()),
    mutationFn: (payload: EditInvoicePayload) => this.invoiceService.updateInvoice$(this.invoiceId(), payload),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({
        queryKey: invoicesKeys.byId(this.invoiceId()),
      });
      await this.queryClient.invalidateQueries({
        queryKey: invoicesKeys.all,
      });
      await this.queryClient.invalidateQueries({
        queryKey: invoicesKeys.userCompanies,
      });
      toast.success("Facture mise à jour avec succès");
      this.invoiceForm.reset();
      this.items.clear();
      this.router.navigate([routes.dashboard.invoices.index]);
    },
    onError: (error: any) => {
      handleRequestError(error);
    },
  }));
}

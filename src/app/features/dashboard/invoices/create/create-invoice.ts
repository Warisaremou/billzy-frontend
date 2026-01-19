import { Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
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
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { DateTime } from "luxon";
import { toast } from "ngx-sonner";
import { routes } from "../../../../config/routes";
import { InvoicePayload } from "../../../../lib/types";
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
  template: `<invoice-form (save)="handleInvoiceCreation($event)" />`,
})
export class CreateInvoicePage {
  private readonly invoiceContextService = inject(InvoiceContextService);
  private readonly invoiceItemsService = inject(InvoiceItemsService);
  private readonly invoiceService = inject(InvoiceService);
  private queryClient = inject(QueryClient);
  private router = inject(Router);

  invoiceForm = this.invoiceContextService.invoiceForm;
  items = this.invoiceContextService.items;

  readonly routes = routes;

  handleInvoiceCreation(payload: any) {
    if (this.items.length === 0) {
      toast.error("Veuillez ajouter des articles à la facture");
      return;
    }

    this.invoiceItemsService.addInvoiceItems$(this.items.value).subscribe({
      next: (ids) => {
        this.createInvoiceMutation.mutate({
          ...payload,
          items: ids,
        });
      },
      error: (err) => handleRequestError(err),
    });
  }

  createInvoiceMutation = injectMutation(() => ({
    mutationKey: invoicesKeys.add,
    mutationFn: (payload: InvoicePayload) => this.invoiceService.addInvoice$(payload),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({
        queryKey: invoicesKeys.all,
      });
      await this.queryClient.invalidateQueries({
        queryKey: invoicesKeys.userCompanies,
      });
      toast.success("Facture ajoutée avec succès");
      this.invoiceForm.reset();
      this.items.clear();
      this.router.navigate([routes.dashboard.invoices.index]);
    },
    onError: (error: any) => {
      handleRequestError(error);
    },
  }));
}

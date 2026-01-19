import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideDownload,
  lucideEllipsis,
  lucideEye,
  lucidePencilLine,
  lucideSend,
  lucideTrash2,
} from "@ng-icons/lucide";
import { BrnAlertDialogImports } from "@spartan-ng/brain/alert-dialog";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { routes } from "../../../../config/routes";
import { invoicesKeys } from "../../../../shared/query-keys/invoices";
import { InvoiceService } from "../services/invoice.service";

@Component({
  selector: "invoice-action-dropdown",
  imports: [
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmDropdownMenuImports,
    HlmSpinnerImports,
    HlmButtonImports,
    NgIcon,
    RouterLink,
  ],
  providers: [provideIcons({ lucideEllipsis, lucideTrash2, lucidePencilLine, lucideEye, lucideDownload, lucideSend })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-alert-dialog>
      <button hlmBtn variant="ghost" class="size-8 p-0" [hlmDropdownMenuTrigger]="menu">
        <span class="sr-only">Open menu</span>
        <ng-icon name="lucideEllipsis" class="size-4" />
      </button>

      <ng-template #menu>
        <hlm-dropdown-menu class="w-52 items-end mr-4">
          <hlm-dropdown-menu-group class="*:w-full *:justify-start">
            <button hlmBtn variant="ghost" size="sm" (click)="downloadInvoice()">
              <ng-icon hlm name="lucideDownload" class="size-4" />
              Télécharger la facture
            </button>
            @if (!isPublished) {
              <button hlmBtn variant="ghost" size="sm" (click)="publishInvoice()">
                <ng-icon hlm name="lucideSend" class="size-4" />
                Publier la facture
              </button>
              <a hlmBtn variant="ghost" size="sm" routerLink="{{ routes.dashboard.invoices.edit(selectedInvoiceId!) }}">
                <ng-icon hlm name="lucidePencilLine" class="size-4" />
                Modifier
              </a>
              <button
                hlmAlertDialogTrigger
                hlmBtn
                variant="ghost"
                size="sm"
                class="text-destructive hover:text-destructive"
              >
                <ng-icon hlm name="lucideTrash2" class="size-4" />
                Supprimer
              </button>
            }
          </hlm-dropdown-menu-group>
        </hlm-dropdown-menu>
      </ng-template>

      <hlm-alert-dialog-content *brnAlertDialogContent="let ctx">
        <hlm-alert-dialog-header>
          <h3 hlmAlertDialogTitle>Vous êtes sûr de vouloir supprimer cette facture?</h3>
          <p hlmAlertDialogDescription>
            Cette action ne peut pas être annulée. Cette action supprimera définitivement la facture.
          </p>
        </hlm-alert-dialog-header>
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel (click)="ctx.close()">Annuler</button>
          <button hlmAlertDialogAction (click)="confirmDelete(ctx)">
            @if (mutation.isPending()) {
              <hlm-spinner />
            }
            Confirmer
          </button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
})
export class InvoiceActionDropdown {
  private invoiceService = inject(InvoiceService);
  queryClient = inject(QueryClient);
  readonly routes = routes;

  @Input() selectedInvoiceId: string | null = null;
  @Input() invoiceReference: string | null = null;
  @Input() isPublished: boolean = false;

  mutation = injectMutation(() => ({
    mutationFn: () => this.invoiceService.deleteInvoice$(this.selectedInvoiceId!),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      toast.success("Facture supprimée avec succès");
    },
    onError: (error: { error: { message: string[] | string } }) => {
      const errorMessage = Array.isArray(error.error.message) ? error.error.message.join("\n") : error.error.message;
      toast.error(errorMessage || "Une erreur est survenue lors de la suppression de la facture.");
    },
  }));

  confirmDelete(ctx: any) {
    this.mutation.mutate();
    ctx.close();
  }

  publishInvoice() {
    this.invoiceService.publishInvoice$(this.selectedInvoiceId!).subscribe({
      next: () => {
        toast.success("Facture publiée avec succès");
        this.queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
      },
      error: (error: { error: { message: string[] | string } }) => {
        const errorMessage = Array.isArray(error.error.message) ? error.error.message.join("\n") : error.error.message;
        toast.error(errorMessage || "Une erreur est survenue lors de la publication de la facture.");
      },
    });
  }

  downloadInvoice() {
    this.invoiceService.downloadInvoice$(this.selectedInvoiceId!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `facture_${this.invoiceReference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error: { error: { message: string[] | string } }) => {
        const errorMessage = Array.isArray(error.error.message) ? error.error.message.join("\n") : error.error.message;
        toast.error(
          errorMessage ||
            "Veuillez renseigner les termes et conditions ainsi que les coordonnées de paiement de l'entreprise.",
        );
      },
    });
  }
}

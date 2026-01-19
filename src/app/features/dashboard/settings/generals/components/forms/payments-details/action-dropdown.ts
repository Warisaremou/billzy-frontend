import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { Router } from "@angular/router";
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
import { paymentDetailsKeys } from "../../../../../../../shared/query-keys/payment-details";
import { PaymentDetailsService } from "./services/payment-details.service";

@Component({
  selector: "payment-details-action-dropdown",
  imports: [
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmDropdownMenuImports,
    HlmSpinnerImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEllipsis, lucideTrash2, lucidePencilLine, lucideEye, lucideDownload, lucideSend })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button hlmBtn variant="ghost" class="size-8 p-0" [hlmDropdownMenuTrigger]="menu">
      <span class="sr-only">Open menu</span>
      <ng-icon name="lucideEllipsis" class="size-4" />
    </button>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-32 items-end mr-4">
        <hlm-dropdown-menu-group class="*:w-full *:justify-start">
          <a hlmBtn variant="ghost" size="sm" (click)="openEditForm()">
            <ng-icon hlm name="lucidePencilLine" class="size-4" />
            Modifier
          </a>
          <button hlmBtn variant="ghost" size="sm" class="text-destructive hover:text-destructive" (click)="delete()">
            <ng-icon hlm name="lucideTrash2" class="size-4" />
            Supprimer
          </button>
        </hlm-dropdown-menu-group>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class PaymentDetailsActionDropdown {
  private paymentDetailsService = inject(PaymentDetailsService);
  queryClient = inject(QueryClient);
  private router = inject(Router);

  @Input() selectedPaymentDetailsId: string | null = null;

  mutation = injectMutation(() => ({
    mutationFn: () => this.paymentDetailsService.deletePaymentDetails$(this.selectedPaymentDetailsId!),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: paymentDetailsKeys.all });
      toast.success("Détail de paiement supprimé avec succès");
    },
    onError: (error: { error: { message: string[] | string } }) => {
      console.log(error);
      const errorMessage = Array.isArray(error.error.message) ? error.error.message.join("\n") : error.error.message;
      toast.error(errorMessage || "Une erreur est survenue lors de la suppression de la facture.");
    },
  }));

  delete() {
    this.mutation.mutate();
  }

  openEditForm() {
    this.router.navigate([], {
      queryParams: { action: "edit", id: this.selectedPaymentDetailsId },
      queryParamsHandling: "merge",
    });
  }
}

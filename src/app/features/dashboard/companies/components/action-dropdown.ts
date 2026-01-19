import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideEllipsis, lucidePencilLine, lucideTrash2 } from "@ng-icons/lucide";
import { BrnAlertDialogImports } from "@spartan-ng/brain/alert-dialog";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmSpinnerImports } from "@spartan-ng/helm/spinner";
import { injectMutation, QueryClient } from "@tanstack/angular-query-experimental";
import { toast } from "ngx-sonner";
import { companiesKeys } from "../../../../shared/query-keys/companies";
import { CompaniesService } from "../../companies/services/companies.service";

@Component({
  selector: "company-action-dropdown",
  imports: [
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmDropdownMenuImports,
    HlmSpinnerImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideEllipsis, lucideTrash2, lucidePencilLine })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-alert-dialog>
      <button hlmBtn variant="ghost" class="h-8 w-8 p-0" [hlmDropdownMenuTrigger]="menu">
        <span class="sr-only">Open menu</span>
        <ng-icon name="lucideEllipsis" class="h-4 w-4" />
      </button>

      <ng-template #menu>
        <hlm-dropdown-menu class="w-36 items-end mr-4">
          <hlm-dropdown-menu-group class="[&>button]:w-full [&>button]:justify-start">
            <button hlmBtn variant="ghost" size="sm" (click)="openEditSheet()">
              <ng-icon hlm name="lucidePencilLine" class="mr-2 h-4 w-4" />
              Modifier
            </button>
            <button
              hlmAlertDialogTrigger
              hlmBtn
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive"
            >
              <ng-icon hlm name="lucideTrash2" class="mr-2 h-4 w-4" />
              Supprimer
            </button>
          </hlm-dropdown-menu-group>
        </hlm-dropdown-menu>
      </ng-template>

      <hlm-alert-dialog-content *brnAlertDialogContent="let ctx">
        <hlm-alert-dialog-header>
          <h3 hlmAlertDialogTitle>Vous êtes sûr de vouloir supprimer l'entreprise?</h3>
          <p hlmAlertDialogDescription>
            Cette action ne peut pas être annulée. Cette action supprimera définitivement le compte de l'entreprise.
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
export class CompanyActionDropdown {
  private companiesService = inject(CompaniesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  queryClient = inject(QueryClient);

  @Input() selectedCompanyId: string | null = null;

  mutation = injectMutation(() => ({
    mutationFn: () => this.companiesService.deleteCompany$(this.selectedCompanyId!),
    onSuccess: async () => {
      await this.queryClient.invalidateQueries({ queryKey: companiesKeys.all });
      toast.success("Entreprise supprimée avec succès");
    },
    onError: (error: { error: { message: string[] | string } }) => {
      const errorMessage = Array.isArray(error.error.message) ? error.error.message.join("\n") : error.error.message;
      toast.error(errorMessage || "Une erreur est survenue lors de la suppression de l'entreprise.");
    },
  }));

  confirmDelete(ctx: any) {
    this.mutation.mutate();
    ctx.close();
  }

  openEditSheet() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: "edit", companyId: this.selectedCompanyId },
      queryParamsHandling: "merge",
    });
  }
}

import { Component, computed, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIcon } from "@ng-icons/core";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { Table } from "@tanstack/angular-table";

@Component({
  selector: "data-table-header",
  imports: [
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    NgIcon,
    HlmIconImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTableImports,
  ],
  template: `
    <div class="flex flex-col justify-between gap-4 sm:flex-row py-4 sm:items-center">
      <input hlmInput class="w-full md:w-80" [placeholder]="searchPlaceholder()" (input)="filterChanged()($event)" />

      <!-- <button hlmBtn variant="outline" align="end" [hlmDropdownMenuTrigger]="menu">
        Filtrer par status
        <ng-icon hlm name="lucideChevronDown" class="ml-2" size="sm" />
      </button>
      <ng-template #menu>
        <hlm-dropdown-menu class="w-32">
          @for (column of _hidableColumns(); track column.id) {
            <button
              hlmDropdownMenuCheckbox
              class="capitalize"
              [checked]="column.getIsVisible()"
              (triggered)="column.toggleVisibility()"
            >
              <hlm-dropdown-menu-checkbox-indicator />
              {{ column.columnDef.id }}
            </button>
          }
        </hlm-dropdown-menu>
      </ng-template> -->
    </div>
  `,
})
export class DataTableHeader<T> {
  readonly table = input.required<Table<T>>();
  readonly filterChanged = input.required<(event: Event) => void>();
  readonly searchPlaceholder = input<string>("Rechercher par ...");

  protected readonly _hidableColumns = computed(() =>
    this.table()
      .getAllColumns()
      .filter((column) => column.getCanHide()),
  );
}

import { Component, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmTableImports } from "@spartan-ng/helm/table";
import { Table } from "@tanstack/angular-table";

@Component({
  selector: "data-table-pagination",
  imports: [
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTableImports,
  ],
  template: `<div class="flex flex-col justify-between py-4 sm:flex-row sm:items-center">
    @if (table().getRowCount() > 0) {
      <div class="text-muted-foreground text-sm">
        {{ table().getSelectedRowModel().rows.length }} sur {{ table().getRowCount() }} ligne(s) sélectionnée(s)
      </div>
      <div class="mt-2 flex space-x-2 sm:mt-0">
        <button
          size="sm"
          variant="outline"
          hlmBtn
          [disabled]="!table().getCanPreviousPage()"
          (click)="table().previousPage()"
        >
          Précédent
        </button>
        <button size="sm" variant="outline" hlmBtn [disabled]="!table().getCanNextPage()" (click)="table().nextPage()">
          Suivant
        </button>
      </div>
    } @else {
      <div class="flex h-full w-full items-center justify-center">
        <div class="text-muted-foreground text-sm">Aucune donnée</div>
      </div>
    }
  </div>`,
})
export class DataTablePagination<T> {
  readonly table = input.required<Table<T>>();
}

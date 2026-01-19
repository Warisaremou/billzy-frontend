import { Component, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import { lucideChevronDown } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmDropdownMenuImports } from "@spartan-ng/helm/dropdown-menu";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmInputImports } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmTableImports } from "@spartan-ng/helm/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  createAngularTable,
  FlexRenderDirective,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/angular-table";
import { DataTableHeader } from "./data-table-header";
import { DataTablePagination } from "./data-table-pagination";

@Component({
  selector: "data-table",
  imports: [
    FlexRenderDirective,
    FormsModule,
    HlmDropdownMenuImports,
    HlmButtonImports,
    HlmIconImports,
    HlmInputImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmTableImports,
    DataTableHeader,
    DataTablePagination,
  ],
  providers: [provideIcons({ lucideChevronDown })],
  host: {
    class: "w-full",
  },
  templateUrl: "./data-table.html",
})
export class DataTable<TData, Tvalue> {
  readonly columns = input<ColumnDef<TData, Tvalue>[]>([]);
  readonly data = input<TData[]>([]);

  readonly searchColumn = input<string>();
  readonly searchPlaceholder = input<string>("Rechercher ...");

  protected _filterChanged = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    const searchColumn = this.searchColumn();

    if (searchColumn) {
      this.table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  private readonly _columnFilters = signal<ColumnFiltersState>([]);
  private readonly _sorting = signal<SortingState>([]);
  private readonly _rowSelection = signal<RowSelectionState>({});
  private readonly _columnVisibility = signal<VisibilityState>({});

  protected readonly table = createAngularTable<TData>(() => ({
    data: this.data(),
    columns: this.columns(),
    onSortingChange: (updater) => {
      updater instanceof Function ? this._sorting.update(updater) : this._sorting.set(updater);
    },
    onColumnFiltersChange: (updater) => {
      updater instanceof Function ? this._columnFilters.update(updater) : this._columnFilters.set(updater);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      updater instanceof Function ? this._columnVisibility.update(updater) : this._columnVisibility.set(updater);
    },
    onRowSelectionChange: (updater) => {
      updater instanceof Function ? this._rowSelection.update(updater) : this._rowSelection.set(updater);
    },
    state: {
      sorting: this._sorting(),
      columnFilters: this._columnFilters(),
      columnVisibility: this._columnVisibility(),
      rowSelection: this._rowSelection(),
    },
  }));
  protected readonly _hidableColumns = this.table.getAllColumns().filter((column) => column.getCanHide());
}

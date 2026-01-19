import { Component, computed, EventEmitter, input, Output, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideChevronsUpDown, lucideSearch } from "@ng-icons/lucide";
import { BrnCommandImports } from "@spartan-ng/brain/command";
import { BrnPopoverImports } from "@spartan-ng/brain/popover";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmCommandImports } from "@spartan-ng/helm/command";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmPopoverImports } from "@spartan-ng/helm/popover";
import { hlm } from "@spartan-ng/helm/utils";
import { type ClassValue } from "clsx";

@Component({
  selector: "select-input",
  imports: [
    BrnCommandImports,
    HlmCommandImports,
    NgIcon,
    HlmIconImports,
    HlmButtonImports,
    BrnPopoverImports,
    HlmPopoverImports,
  ],
  providers: [provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck })],
  template: `
    <hlm-popover [state]="state()" (stateChanged)="stateChanged($event)" sideOffset="5">
      <button
        type="button"
        [class]="_computedClass()"
        id="select-input-trigger"
        hlmPopoverTrigger
        (click)="state.set('open')"
        hlmBtn
        variant="outline"
      >
        {{ selectedLabel() }}
        @if (chevron()) {
          <ng-icon hlm size="sm" name="lucideChevronsUpDown" class="opacity-50" />
        }
      </button>
      <hlm-command *brnPopoverContent="let ctx" hlmPopoverContent class="w-[250px] p-0">
        <hlm-command-search>
          <ng-icon hlm name="lucideSearch" />
          <input [placeholder]="searchPlaceholder()" hlm-command-search-input />
        </hlm-command-search>
        <div *brnCommandEmpty hlmCommandEmpty>Aucun résultat trouvé.</div>
        <hlm-command-list>
          <hlm-command-group>
            @for (item of items(); track item.value) {
              <button type="button" hlm-command-item [value]="item.value" (selected)="commandSelected(item.original)">
                <span class="truncate">{{ item.label }}</span>
                <ng-icon
                  hlm
                  class="ml-auto"
                  [class.opacity-0]="currentValue() !== item.value"
                  name="lucideCheck"
                  hlmCommandIcon
                />
              </button>
            }
          </hlm-command-group>
        </hlm-command-list>
      </hlm-command>
    </hlm-popover>
  `,
})
export class SelectInput<T> {
  readonly dataList = input.required<T[]>();
  readonly placeholder = input<string>("Select item...");
  readonly searchPlaceholder = input<string>("Search...");
  readonly labelKey = input<string>("label");
  readonly valueKey = input<string>("value");
  readonly userClass = input<ClassValue>("", { alias: "class" });
  readonly chevron = input<boolean>(false);

  readonly _computedClass = computed(() => hlm("w-[250px] justify-between", this.userClass()));

  public readonly currentData = signal<T | undefined>(undefined);
  public readonly state = signal<"closed" | "open">("closed");

  readonly items = computed(() => {
    const data = this.dataList();
    const lKey = this.labelKey();
    const vKey = this.valueKey();

    return data.map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          label: String((item as any)[lKey]),
          value: (item as any)[vKey],
          original: item,
        };
      }
      return {
        label: String(item),
        value: item,
        original: item,
      };
    });
  });

  readonly selectedLabel = computed(() => {
    const current = this.currentData();
    if (!current) return this.placeholder();

    if (typeof current === "object" && current !== null) {
      return String((current as any)[this.labelKey()]);
    }
    return String(current);
  });

  readonly currentValue = computed(() => {
    const current = this.currentData();
    if (!current) return undefined;

    if (typeof current === "object" && current !== null) {
      return (current as any)[this.valueKey()];
    }
    return current;
  });

  @Output() valueChanged = new EventEmitter<T>();

  stateChanged(state: "open" | "closed") {
    this.state.set(state);
  }

  commandSelected(data: T) {
    this.state.set("closed");
    if (this.currentValue() === (typeof data === "object" && data !== null ? (data as any)[this.valueKey()] : data)) {
      this.currentData.set(undefined);
      this.valueChanged.emit(undefined);
    } else {
      this.currentData.set(data);
      this.valueChanged.emit(data);
    }
  }
}

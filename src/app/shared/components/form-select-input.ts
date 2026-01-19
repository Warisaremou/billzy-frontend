import { Component, computed, EventEmitter, forwardRef, input, Output, signal } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideChevronsUpDown, lucideSearch } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmIconImports } from "@spartan-ng/helm/icon";
import { HlmSelectImports } from "@spartan-ng/helm/select";

@Component({
  selector: "form-select-input",
  imports: [BrnSelectImports, HlmSelectImports, HlmIconImports, FormsModule],
  providers: [
    provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectInput),
      multi: true,
    },
  ],
  template: `
    <brn-select
      class="inline-block w-full"
      [placeholder]="placeholder()"
      [ngModel]="currentValue()"
      (ngModelChange)="commandSelected($event)"
      [ngModelOptions]="{ standalone: true }"
    >
      <hlm-select-trigger class="w-full">
        <hlm-select-value />
      </hlm-select-trigger>
      <hlm-select-content>
        @for (item of items(); track item.value) {
          <hlm-option [value]="item.value">
            {{ item.label }}
          </hlm-option>
        }
      </hlm-select-content>
    </brn-select>
  `,
})
export class FormSelectInput<T> implements ControlValueAccessor {
  readonly dataList = input.required<T[]>();
  readonly placeholder = input<string>("Select item...");
  readonly labelKey = input<string>("label");
  readonly valueKey = input<string>("value");

  public readonly currentData = signal<T | undefined>(undefined);

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

  readonly currentValue = computed(() => {
    const current = this.currentData();
    if (!current) return undefined;

    if (typeof current === "object" && current !== null) {
      return (current as any)[this.valueKey()];
    }
    return current;
  });

  @Output() valueChanged = new EventEmitter<T>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value === undefined || value === null) {
      this.currentData.set(undefined);
      return;
    }

    const vKey = this.valueKey();
    const found = this.dataList().find((item: any) => {
      if (typeof item === "object" && item !== null) {
        return item[vKey] === value;
      }
      return item === value;
    });

    this.currentData.set(found);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  commandSelected(value: any) {
    const foundItem = this.items().find((i) => i.value === value);
    const original = foundItem?.original;

    if (this.currentValue() === value) {
      this.currentData.set(undefined);
      this.onChange(null);
      this.valueChanged.emit(undefined);
    } else {
      this.currentData.set(original);
      this.onChange(value);
      this.valueChanged.emit(original as T);
    }
    this.onTouched();
  }
}

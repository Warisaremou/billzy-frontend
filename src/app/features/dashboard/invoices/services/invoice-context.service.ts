import { inject, Injectable } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { InvoiceItem } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class InvoiceContextService {
  private formBuilder = inject(FormBuilder);

  invoiceForm = this.formBuilder.group({
    id: [""],
    company_id: ["", [Validators.required, Validators.minLength(3)]],
    client_id: ["", [Validators.required, Validators.minLength(3)]],
    due_date: [null as Date | null, [Validators.required]],
    items: this.formBuilder.array([this.createItemForm()]),
  });

  private createItemForm() {
    const itemForm = this.formBuilder.group({
      label: ["", [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      vat_rate: [20, [Validators.required, Validators.min(0)]],
      unit_total_ht: [{ value: 0, disabled: false }],
    });

    this.setupItemCalculation(itemForm);
    return itemForm;
  }

  private setupItemCalculation(itemForm: any) {
    const quantity = itemForm.get("quantity");
    const unitPrice = itemForm.get("unit_price");
    const totalHt = itemForm.get("unit_total_ht");

    const calculateTotalHT = () => {
      const qty = quantity?.value || 0;
      const price = unitPrice?.value || 0;
      const total = qty * price;
      totalHt?.setValue(total, { emitEvent: false });
    };

    calculateTotalHT();

    quantity?.valueChanges.subscribe(() => calculateTotalHT());
    unitPrice?.valueChanges.subscribe(() => calculateTotalHT());
  }

  get items() {
    return this.invoiceForm.get("items") as FormArray;
  }

  addItem = () => {
    this.items.push(this.createItemForm());
  };

  initItems = (items: InvoiceItem[]) => {
    this.items.clear();
    items.forEach((item) => this.items.push(this.formBuilder.group(item)));
  };

  removeItem = (index: number) => {
    this.items.removeAt(index);
  };
}

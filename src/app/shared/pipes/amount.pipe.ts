import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "amount",
  standalone: true,
})
export class AmountPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return "";
    }

    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(numValue);
  }
}

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { InvoiceItem } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class InvoiceItemsService {
  private readonly BASE_URL = environment.apiUrl;
  private readonly http = inject(HttpClient);

  // The return type is an array of created invoice item IDs
  addInvoiceItems$(payload: InvoiceItem[]): Observable<string[]> {
    return this.http.post<string[]>(`${this.BASE_URL}/invoice-items`, payload);
  }
}

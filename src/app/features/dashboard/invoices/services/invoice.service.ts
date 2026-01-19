import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { EditInvoicePayload, Invoice, InvoicePayload } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class InvoiceService {
  private readonly BASE_URL = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getInvoices$(): Promise<Invoice[]> {
    return lastValueFrom(this.http.get<Invoice[]>(`${this.BASE_URL}/invoices`));
  }

  getUserCompanyInvoices$(): Promise<Invoice[]> {
    return lastValueFrom(this.http.get<Invoice[]>(`${this.BASE_URL}/invoices/company/invoices`));
  }

  getInvoiceById$(id: string): Promise<Invoice> {
    return lastValueFrom(this.http.get<Invoice>(`${this.BASE_URL}/invoices/${id}`));
  }

  addInvoice$(payload: InvoicePayload): Promise<Invoice> {
    const { company_id, ...body } = payload;
    return lastValueFrom(this.http.post<Invoice>(`${this.BASE_URL}/invoices/company/${company_id}`, body));
  }

  publishInvoice$(id: string): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/invoices/${id}/publish`, {});
  }

  downloadInvoice$(id: string): Observable<Blob> {
    return this.http.post(
      `${this.BASE_URL}/invoices/${id}/download`,
      {},
      {
        responseType: "blob",
      },
    );
  }

  updateInvoicePaymentStatus$(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.BASE_URL}/invoices/${id}/payment-status`, { paymentStatus: status });
  }

  updateInvoice$(id: string, payload: EditInvoicePayload): Promise<Invoice> {
    return lastValueFrom(this.http.patch<Invoice>(`${this.BASE_URL}/invoices/${id}`, payload));
  }

  addNewItemsToInvoice$(id: string, itemIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/invoices/${id}/items`, { itemIds });
  }

  removeItemFromInvoice$(id: string, item_id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/invoices/${id}/items/${item_id}`);
  }

  deleteInvoice$(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.BASE_URL}/invoices/${id}`));
  }
}

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../../../../../environments/environment";
import { PaymentDetails, PaymentDetailsPayload } from "../../../../../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class PaymentDetailsService {
  private readonly BASE_URL = `${environment.apiUrl}/payment-details`;
  private readonly http = inject(HttpClient);

  getAllPaymentDetails$(): Promise<PaymentDetails[]> {
    return lastValueFrom(this.http.get<PaymentDetails[]>(`${this.BASE_URL}`));
  }

  getPaymentDetailsByCompany$(companyId: string): Promise<PaymentDetails[]> {
    return lastValueFrom(this.http.get<PaymentDetails[]>(`${this.BASE_URL}/company/${companyId}`));
  }

  getPaymentDetailsById$(paymentDetailsId: string): Observable<PaymentDetails> {
    return this.http.get<PaymentDetails>(`${this.BASE_URL}/${paymentDetailsId}`);
  }

  addPaymentDetails$(payload: PaymentDetailsPayload): Promise<PaymentDetails> {
    return lastValueFrom(this.http.post<PaymentDetails>(`${this.BASE_URL}`, payload));
  }

  editPaymentDetails$(paymentDetailsId: string, payload: PaymentDetailsPayload): Promise<PaymentDetails> {
    return lastValueFrom(this.http.patch<PaymentDetails>(`${this.BASE_URL}/${paymentDetailsId}`, payload));
  }

  deletePaymentDetails$(paymentDetailsId: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.BASE_URL}/${paymentDetailsId}`));
  }
}

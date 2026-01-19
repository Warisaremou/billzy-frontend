import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { Customer, CustomerPayload } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class CustomersService {
  private readonly BASE_URL = `${environment.apiUrl}/clients`;
  private readonly http = inject(HttpClient);

  getAllCustomers$(): Promise<Customer[]> {
    return lastValueFrom(this.http.get<Customer[]>(`${this.BASE_URL}`));
  }

  getCustomersByCompany$(companyId: string): Promise<Customer[]> {
    return lastValueFrom(this.http.get<Customer[]>(`${this.BASE_URL}/${companyId}/clients`));
  }

  getCompanyCustomers$(): Promise<Customer[]> {
    return lastValueFrom(this.http.get<Customer[]>(`${this.BASE_URL}/company/company-clients`));
  }

  getCustomerById$(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.BASE_URL}/${customerId}`);
  }

  addCustomer$(companyId: string, payload: CustomerPayload): Promise<Customer> {
    return lastValueFrom(this.http.post<Customer>(`${this.BASE_URL}/${companyId}`, payload));
  }

  editCustomer$(customerId: string, payload: CustomerPayload): Promise<Customer> {
    return lastValueFrom(this.http.patch<Customer>(`${this.BASE_URL}/${customerId}`, payload));
  }

  deleteCustomer$(customerId: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.BASE_URL}/${customerId}`));
  }
}

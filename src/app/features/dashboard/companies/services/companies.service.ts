import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { Company, CompanyPayload } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class CompaniesService {
  private readonly BASE_URL = environment.apiUrl;
  private readonly http = inject(HttpClient);

  getCompanies$(): Promise<Company[]> {
    return lastValueFrom(this.http.get<Company[]>(`${this.BASE_URL}/companies`));
  }

  // For role `admin` and `user`
  getUserCompanies$(): Promise<Company[]> {
    return lastValueFrom(this.http.get<Company[]>(`${this.BASE_URL}/companies/user/companies`));
  }

  getCompanyById$(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.BASE_URL}/companies/${id}`);
  }

  addCompany$(payload: CompanyPayload): Promise<Company> {
    return lastValueFrom(this.http.post<Company>(`${this.BASE_URL}/companies`, payload));
  }
  editCompany$(id: string, payload: CompanyPayload): Promise<Company> {
    return lastValueFrom(this.http.patch<Company>(`${this.BASE_URL}/companies/${id}`, payload));
  }

  deleteCompany$(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.BASE_URL}/companies/${id}`));
  }
}

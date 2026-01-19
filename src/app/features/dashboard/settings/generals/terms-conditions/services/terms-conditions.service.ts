import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../../../environments/environment";
import { TermsAndConditions, TermsAndConditionsPayload } from "../../../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class TermsConditionsService {
  private readonly BASE_URL = `${environment.apiUrl}/terms-conditions`;
  private readonly http = inject(HttpClient);

  getTermsConditionsByCompany$(companyId: string): Observable<TermsAndConditions[]> {
    return this.http.get<TermsAndConditions[]>(`${this.BASE_URL}/company/${companyId}`);
  }

  editTermsConditions$(payload: TermsAndConditionsPayload): Promise<void> {
    const { company_id, ...rest } = payload;
    return lastValueFrom(this.http.patch<void>(`${this.BASE_URL}/company/${company_id}`, rest));
  }
}

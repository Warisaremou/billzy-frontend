import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom, Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { User, UserPayload } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  private readonly BASE_URL = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  getUsers$(): Promise<User[]> {
    return lastValueFrom(this.http.get<User[]>(`${this.BASE_URL}`));
  }

  getUserById$(id: string): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/${id}`);
  }

  addCompanyAdminUser$(payload: UserPayload): Promise<User> {
    const { company_id, ...rest } = payload;
    return lastValueFrom(this.http.post<User>(`${this.BASE_URL}/admin/${company_id}`, rest));
  }

  editUser$(id: string, payload: UserPayload): Promise<User> {
    return lastValueFrom(this.http.patch<User>(`${this.BASE_URL}/${id}`, payload));
  }

  addUserToCompany$(payload: UserPayload): Promise<User> {
    const { company_id, ...rest } = payload;
    return lastValueFrom(this.http.post<User>(`${this.BASE_URL}/${company_id}`, rest));
  }

  deleteUser$(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.BASE_URL}/${id}`));
  }
}

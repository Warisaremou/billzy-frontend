import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { UpdateUserPayload } from "../../../../lib/types";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly BASE_URL = environment.apiUrl;
  private readonly http = inject(HttpClient);

  updateProfile$(userPayload: UpdateUserPayload): Promise<void> {
    return lastValueFrom(this.http.patch<void>(`${this.BASE_URL}/auth/me`, userPayload));
  }
}

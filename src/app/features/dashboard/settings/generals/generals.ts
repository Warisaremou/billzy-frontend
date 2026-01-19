import { Component, effect, inject, signal } from "@angular/core";
import { HlmSeparator } from "@spartan-ng/helm/separator";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { handleRequestError } from "../../../../shared/helpers";
import { companiesKeys } from "../../../../shared/query-keys/companies";
import { CompaniesService } from "../../companies/services/companies.service";
import { CompanyProfile } from "./company-profile/company-profile";
import { PaymentDetails } from "./components/forms/payments-details/payment-details";
import { TermsConditions } from "./terms-conditions/terms-conditions";

@Component({
  selector: "app-general-settings-page",
  templateUrl: "./generals.html",
  imports: [TermsConditions, CompanyProfile, PaymentDetails, HlmSeparator],
})
export class GeneralSettingsPage {
  private readonly companiesService = inject(CompaniesService);

  companyId = signal<string | null>(null);

  companyQuery = injectQuery(() => ({
    queryKey: companiesKeys.userCompanies,
    queryFn: () => this.companiesService.getUserCompanies$(),
  }));

  constructor() {
    effect(() => {
      const data = this.companyQuery.data();
      const error = this.companyQuery.error();

      if (error) {
        handleRequestError(error);
        return;
      }

      if (data) {
        this.companyId.set(data[0].id);
      }
    });
  }
}

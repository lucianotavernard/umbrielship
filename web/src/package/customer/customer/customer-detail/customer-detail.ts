import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { GetCustomerResponse } from '../customer.service';
import { GetVesselsResponse, Vessel } from '../../vessel/vessel.service';

@Component({
  selector: 'customer-detail',
  imports: [RouterLink, Button],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {
  private readonly router = inject(Router);

  id = input.required<string>();

  private readonly customerResource = httpResource<GetCustomerResponse>(
    () => `/api/customers/${this.id()}`,
  );
  private readonly vesselsResource = httpResource<GetVesselsResponse>(
    () => `/api/vessels?customerId=${this.id()}&page=1`,
  );

  customer = computed(() => resourceValue(this.customerResource)?.customer ?? null);
  vessels = computed(() => resourceValue(this.vesselsResource)?.vessels ?? []);
  loading = computed(() => this.customerResource.isLoading());

  goBack() {
    void this.router.navigateByUrl('/customers');
  }

  vesselLink(vessel: Vessel) {
    return ['/vessels', vessel.id];
  }
}

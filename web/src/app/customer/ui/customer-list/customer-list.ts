import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideTrash2 } from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { CustomerDto } from '@/customer/data-access/dto/customer.dto';

@Component({
  selector: 'customer-list-ui',
  templateUrl: './customer-list.html',
  imports: [RouterLink, NgIcon, Button, Skeleton],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideTrash2 })],
})
export class CustomerListUi {
  loading = input(true);
  customers = input<CustomerDto[]>([]);

  deleted = output<CustomerDto>();

  deleteCustomer(customer: CustomerDto) {
    this.deleted.emit(customer);
  }
}

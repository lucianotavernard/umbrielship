import { Component, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucidePencil, lucideMail } from '@ng-icons/lucide';

import { CustomerDto } from '@/customer/data-access/dto/customer.dto';
import { Skeleton } from '@/shared/ui/skeleton';

@Component({
  selector: 'customer-detail-ui',
  templateUrl: './customer-detail.html',
  imports: [NgIcon, Skeleton],
  viewProviders: [provideIcons({ lucideBuilding2, lucidePencil, lucideMapPin, lucideMail })],
})
export class CustomerDetailUi {
  customer = input.required<CustomerDto | null>();

  loading = input(false);
}

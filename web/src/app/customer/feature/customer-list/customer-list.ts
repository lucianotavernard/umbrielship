import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucidePlus } from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Sheet } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Pagination } from '@/shared/ui/pagination';
import { Confirmation } from '@/shared/ui/confirmation';

import { CustomerDto, CustomersResponseDto } from '@/customer/data-access/dto/customer.dto';
import { CustomerListUi } from '@/customer/ui/customer-list/customer-list';
import { CustomerFormUi } from '@/customer/ui/customer-form/customer-form';

@Component({
  selector: 'customer-list',
  templateUrl: './customer-list.html',
  imports: [NgIcon, Button, Pagination, Sheet, Confirmation, CustomerListUi, CustomerFormUi],
  viewProviders: [provideIcons({ lucideUsers, lucidePlus })],
})
export class CustomerList {
  private readonly http = inject(HttpClient);
  private readonly customerResource = httpResource<CustomersResponseDto>(() => '/api/customers');

  page = signal(1);
  submitting = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  selectedCustomer = signal<CustomerDto | null>(null);

  loading = computed(() => this.customerResource.isLoading());
  customers = computed(() => this.customerResource.value()?.customers ?? []);
  totalCustomers = computed(() => this.customerResource.value()?.total ?? 0);

  changePage(page: number) {
    this.page.set(page);
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(customer: CustomerDto) {
    this.selectedCustomer.set(customer);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.isDialogActive.set(false);
    this.selectedCustomer.set(null);
  }

  handleSubmit(customer: Omit<CustomerDto, 'id'>) {
    this.submitting.set(true);

    this.http
      .post<CustomerDto>('/api/customers', customer)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.customerResource.reload();
          this.closeSheet();

          toast.success('Cliente criado com sucesso', {
            description: 'O cliente foi criado com sucesso.',
          });
        },
        error: () => {
          toast.error('Erro ao criar cliente', {
            description: 'Ocorreu um erro ao criar o cliente.',
          });
        },
      });
  }
}

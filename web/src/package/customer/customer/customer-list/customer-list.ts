import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { CustomerForm } from '../components/customer-form';
import { CustomerList as CustomerListUI } from '../components/customer-list';
import { CreateCustomerRequest, CustomerService, GetCustomersResponse } from '../customer.service';

@Component({
  selector: 'customer-list',
  imports: [Button, Pagination, Sheet, Skeleton, CustomerForm, CustomerListUI],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  private readonly customerService = inject(CustomerService);
  private readonly customerForm = viewChild(CustomerForm);

  private readonly customerResource = httpResource<GetCustomersResponse>(
    () => `/api/customers?page=${this.page()}`,
  );

  readonly perPage = 10;

  page = signal(1);
  isSheetActive = signal(false);

  loading = computed(() => this.customerResource.isLoading());
  customers = computed(() => resourceValue(this.customerResource)?.customers ?? []);
  total = computed(() => resourceValue(this.customerResource)?.total ?? 0);

  changePage(page: number) {
    this.page.set(page);
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  createCustomer(customer: CreateCustomerRequest) {
    this.customerForm()?.loading.set(true);
    this.customerService.createCustomer(customer).subscribe({
      next: () => {
        toast.success('Cliente criado com sucesso', {
          description: 'O cliente foi criado com sucesso.',
        });
        this.customerForm()?.loading.set(false);
        this.customerForm()?.reset();
        this.closeSheet();
        this.customerResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar cliente', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar o cliente.'),
        });
        this.customerForm()?.loading.set(false);
      },
    });
  }
}

import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { CustomerForm } from '../components/customer-form';
import { CustomerList as CustomerListUI } from '../components/customer-list';
import {
  CreateCustomerRequest,
  Customer,
  CustomerService,
  GetCustomersResponse,
} from '../customer.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({
  selector: 'customer-list',
  imports: [NgIcon, Button, Confirmation, Pagination, Sheet, Skeleton, CustomerForm, CustomerListUI],
  viewProviders: [provideIcons({ lucidePlus })],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly customerService = inject(CustomerService);
  private readonly customerForm = viewChild(CustomerForm);

  private readonly customerResource = httpResource<GetCustomersResponse>(
    () => `/api/customers?page=${this.page()}`,
  );

  page = signal(1);
  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  selectedCustomer = signal<Customer | null>(null);

  loading = computed(() => this.customerResource.isLoading());
  customers = computed(() => resourceValue(this.customerResource)?.customers ?? []);
  totalCustomers = computed(() => resourceValue(this.customerResource)?.total ?? 0);

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.selectedCustomer.set(null);
    this.isDialogActive.set(false);
  }

  createCustomer(customer: CreateCustomerRequest) {
    this.submitting.set(true);
    this.customerService.createCustomer(customer).subscribe({
      next: () => {
        toast.success('Cliente criado com sucesso', {
          description: 'O cliente foi criado com sucesso.',
        });
        this.submitting.set(false);
        this.customerForm()?.reset();
        this.closeSheet();
        this.customerResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar cliente', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar o cliente.'),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteCustomer() {
    this.confirming.set(true);

    const customer = this.selectedCustomer();
    this.customerService.deleteCustomer(customer!.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.customerResource.reload();
        this.closeDialog();

        toast.success('Cliente excluído com sucesso', {
          description: 'O cliente foi excluído com sucesso.',
        });
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDialog();
        toast.error('Erro ao excluir cliente', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir o cliente.'),
        });
      },
    });
  }
}

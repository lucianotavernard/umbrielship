import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucidePhone, lucidePlus, lucideSearch, lucideShip, lucideUsers } from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Metric, twoDigits } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { CustomerForm } from '../components/customer-form';
import { CustomerList as CustomerListUI } from '../components/customer-list';
import {
  CreateCustomerRequest,
  CustomerListItem,
  CustomerService,
  GetCustomersResponse,
} from '../customer.service';

const collator = (a: string, b: string) => a.localeCompare(b, 'pt-BR');
const fold = (text: string) => text.toLocaleLowerCase('pt-BR');

@Component({
  selector: 'customer-list',
  imports: [NgIcon, Button, Confirmation, Metric, Sheet, Skeleton, CustomerForm, CustomerListUI],
  viewProviders: [provideIcons({ lucideMail, lucidePhone, lucidePlus, lucideSearch, lucideShip, lucideUsers })],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly customerService = inject(CustomerService);
  private readonly customerForm = viewChild(CustomerForm);

  /** Every Customer of the Organization in one request (AD-023): search and counts run here. */
  private readonly customerResource = httpResource<GetCustomersResponse>(() => '/api/customers');

  search = signal('');
  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  /** The Customer the drawer edits; null while it creates one. */
  editing = signal<CustomerListItem | null>(null);
  selectedCustomer = signal<CustomerListItem | null>(null);

  loading = computed(() => this.customerResource.isLoading());

  /** Every Customer, by name as the mareos sorts them. */
  customers = computed(() =>
    [...(resourceValue(this.customerResource)?.customers ?? [])].sort((a, b) =>
      collator(a.name, b.name),
    ),
  );

  shown = computed(() => {
    const term = fold(this.search().trim());
    if (!term) return this.customers();
    return this.customers().filter((customer) =>
      fold(
        [customer.name, customer.email, customer.phone ?? '', customer.address.city, customer.address.state].join(' '),
      ).includes(term),
    );
  });

  /** Counted over every Customer, never over the search result. */
  metrics = computed(() => {
    const customers = this.customers();
    return {
      customers: twoDigits(customers.length),
      vessels: twoDigits(customers.reduce((total, customer) => total + customer.vesselCount, 0)),
      emails: twoDigits(customers.filter((customer) => !!customer.email?.trim()).length),
      phones: twoDigits(customers.filter((customer) => !!customer.phone?.trim()).length),
    };
  });

  constructor() {
    effect(() => {
      const error = this.customerResource.error();
      if (!error) return;
      // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
      untracked(() =>
        toast.error('Erro ao carregar clientes', {
          description: apiErrorMessage(error as { error?: unknown }, 'Ocorreu um erro ao carregar os clientes.'),
        }),
      );
    });
  }

  openCreate() {
    this.editing.set(null);
    this.customerForm()?.load(null);
    this.isSheetActive.set(true);
  }

  /** Every opening shows the Customer's values, also after a Cancelar that left typed ones. */
  openEdit(customer: CustomerListItem) {
    this.editing.set(customer);
    this.customerForm()?.load(customer);
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(customer: CustomerListItem) {
    this.selectedCustomer.set(customer);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.selectedCustomer.set(null);
    this.isDialogActive.set(false);
  }

  saveCustomer(customer: CreateCustomerRequest) {
    const editing = this.editing();
    this.submitting.set(true);

    const request = editing
      ? this.customerService.updateCustomer(editing.id, customer)
      : this.customerService.createCustomer(customer);

    request.subscribe({
      next: () => {
        if (editing) {
          toast.success('Cliente atualizado com sucesso', {
            description: 'O cliente foi atualizado com sucesso.',
          });
        } else {
          toast.success('Cliente criado com sucesso', {
            description: 'O cliente foi criado com sucesso.',
          });
          this.search.set('');
        }
        this.submitting.set(false);
        this.closeSheet();
        this.editing.set(null);
        this.customerResource.reload();
      },
      error: (response) => {
        // The drawer stays open with what was typed.
        toast.error(editing ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente', {
          description: apiErrorMessage(
            response,
            editing ? 'Ocorreu um erro ao atualizar o cliente.' : 'Ocorreu um erro ao criar o cliente.',
          ),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteCustomer() {
    const customer = this.selectedCustomer();
    if (!customer) return;
    this.confirming.set(true);

    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.closeDialog();
        this.customerResource.reload();
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

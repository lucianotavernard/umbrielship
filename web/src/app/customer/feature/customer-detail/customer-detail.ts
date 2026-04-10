import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Sheet } from '@/shared/ui/sheet';

import { CustomerDto, CustomerResponseDto } from '@/customer/data-access/dto/customer.dto';
import { CustomerDetailUi } from '@/customer/ui/customer-detail/customer-detail';
import { CustomerFormUi } from '@/customer/ui/customer-form/customer-form';

@Component({
  selector: 'customer-detail',
  templateUrl: './customer-detail.html',
  imports: [NgIcon, Skeleton, Sheet, CustomerDetailUi, CustomerFormUi],
  viewProviders: [provideIcons({ lucideMapPin })],
})
export class CustomerDetail {
  private readonly http = inject(HttpClient);
  
  id = input<string>();

  customerResource = httpResource<CustomerResponseDto>(() => `/api/customers/${this.id()}`);

  submitting = signal(false);
  isSheetActive = signal(false);

  customer = computed(() => this.customerResource.value()?.customer ?? null);
  loading = computed(() => this.customerResource.isLoading());

  editCustomer() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  handleSubmit(customer: Omit<CustomerDto, 'id'>) {
    this.submitting.set(true);

    this.http.put<CustomerDto>(`/api/customers/${this.id()}`, customer)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.customerResource.reload();

          this.closeSheet();

          toast.success('Cliente atualizado com sucesso', {
            description: `O cliente ${customer.name} foi atualizado com sucesso.`,
          });
        },
        error: () => {
          toast.error('Erro ao atualizar cliente', {
            description: 'Ocorreu um erro ao criar o cliente.',
          });
        },
      });
  }
}

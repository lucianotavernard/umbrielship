import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin, lucidePencil } from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Sheet } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';

import { GOOGLE_MAPS_EMBED_API_KEY } from '@/shared/config/google-maps';
import { CustomerDto, CustomerResponseDto } from '@/customer/data-access/dto/customer.dto';
import { CustomerDetailUi } from '@/customer/ui/customer-detail/customer-detail';
import { CustomerFormUi } from '@/customer/ui/customer-form/customer-form';

@Component({
  selector: 'customer-detail',
  templateUrl: './customer-detail.html',
  imports: [NgIcon, Skeleton, Sheet, Button, CustomerDetailUi, CustomerFormUi],
  viewProviders: [provideIcons({ lucideMapPin, lucidePencil })],
})
export class CustomerDetail {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  id = input<string>();

  customerResource = httpResource<CustomerResponseDto>(() => `/api/customers/${this.id()}`);

  submitting = signal(false);
  isSheetActive = signal(false);

  customer = computed(() => this.customerResource.value()?.customer ?? null);
  loading = computed(() => this.customerResource.isLoading());

  /** Iframe src for Google Maps (address search / Embed API). */
  mapEmbedSrc = computed((): SafeResourceUrl | null => {
    const c = this.customer();
    if (!c?.address) {
      return null;
    }
    const { address, city, state } = c.address;
    if (!address?.trim() && !city?.trim()) {
      return null;
    }
    const parts = [address?.trim(), city?.trim(), state?.trim(), 'Brasil'].filter(Boolean);
    const q = encodeURIComponent(parts.join(', '));
    const key = GOOGLE_MAPS_EMBED_API_KEY.trim();
    const url = key
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${q}&zoom=16`
      : `https://www.google.com/maps?q=${q}&output=embed&z=16`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  editCustomer() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openSheet() {
    this.isSheetActive.set(true);
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

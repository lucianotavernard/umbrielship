import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMapPin,
  lucidePencil,
  lucideShip,
  lucidePlus,
  lucideArrowLeft,
} from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Sheet } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';

import { GOOGLE_MAPS_EMBED_API_KEY } from '@/shared/config/google-maps';

import { CustomerDto, CustomerResponseDto } from '@/customer/data-access/dto/customer.dto';
import { VesselDto, VesselsResponseDto } from '@/customer/data-access/dto/vessel.dto';

import { CustomerDetailUi } from '@/customer/ui/customer-detail/customer-detail';
import { CustomerFormUi } from '@/customer/ui/customer-form/customer-form';
import { VesselListUi } from '@/customer/ui/vessel-list/vessel-list';
import { VesselFormUi } from '@/customer/ui/vessel-form/vessel-form';

@Component({
  selector: 'customer-detail',
  templateUrl: './customer-detail.html',
  imports: [
    NgIcon,
    Skeleton,
    Sheet,
    Button,
    Pagination,
    CustomerDetailUi,
    CustomerFormUi,
    VesselListUi,
    VesselFormUi,
  ],
  viewProviders: [
    provideIcons({ lucideMapPin, lucidePencil, lucideShip, lucidePlus, lucideArrowLeft }),
  ],
})
export class CustomerDetail {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  id = input<string>();

  customerResource = httpResource<CustomerResponseDto>(() => `/api/customers/${this.id()}`);
  vesselsResource = httpResource<VesselsResponseDto>(() => `/api/vessels?customerId=${this.id()}`, {
    defaultValue: {
      vessels: [],
      total: 0,
    },
  });

  page = signal(1);
  submittingNewCustomer = signal(false);
  isCustomerSheetActive = signal(false);

  submittingNewVessel = signal(false);
  isNewVesselSheetActive = signal(false);

  customer = computed(() => this.customerResource.value()?.customer ?? null);
  loadingCustomer = computed(() => this.customerResource.isLoading());

  vessels = computed(() => this.vesselsResource.value().vessels);
  totalVessels = computed(() => this.vesselsResource.value().total);
  loadingVessels = computed(() => this.vesselsResource.isLoading());

  /** Iframe src for Google Maps (address search / Embed API). */
  mapEmbedSrc = computed((): SafeResourceUrl | null => {
    const customer = this.customer();
    if (!customer?.address) {
      return null;
    }

    const { address, city, state } = customer.address;
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

  goBack() {
    this.router.navigateByUrl('/customers');
  }

  editCustomer() {
    this.isCustomerSheetActive.set(true);
  }

  openCustomerSheet() {
    this.isCustomerSheetActive.set(true);
  }

  closeCustomerSheet() {
    this.isCustomerSheetActive.set(false);
  }

  openNewVesselSheet() {
    this.isNewVesselSheetActive.set(true);
  }

  closeNewVesselSheet() {
    this.isNewVesselSheetActive.set(false);
  }

  handleSubmitCustomer(customer: Omit<CustomerDto, 'id'>) {
    this.submittingNewCustomer.set(true);

    const customerId = this.id();

    this.http
      .put<CustomerDto>(`/api/customers/${customerId}`, customer)
      .pipe(finalize(() => this.submittingNewCustomer.set(false)))
      .subscribe({
        next: () => {
          this.customerResource.reload();

          this.closeCustomerSheet();

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

  handleSubmitVessel(vessel: Omit<VesselDto, 'id' | 'customer'>) {
    this.submittingNewVessel.set(true);

    const customerId = this.id();
    vessel.customerId = customerId!;

    this.http
      .post<VesselDto>(`/api/vessels`, vessel)
      .pipe(finalize(() => this.submittingNewVessel.set(false)))
      .subscribe({
        next: () => {
          this.vesselsResource.reload();

          this.closeNewVesselSheet();

          toast.success('Embarcação criada com sucesso', {
            description: `A embarcação ${vessel.name} foi criada com sucesso.`,
          });
        },
        error: () => {
          toast.error('Erro ao criar embarcação', {
            description: 'Ocorreu um erro ao criar a embarcação.',
          });
        },
      });
  }
}

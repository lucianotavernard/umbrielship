import { HttpClient, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMapPin,
  lucidePencil,
  lucidePlus,
  lucideShip,
} from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Sheet } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Pagination } from '@/shared/ui/pagination';

import { GOOGLE_MAPS_EMBED_API_KEY } from '@/shared/config/google-maps';

import { VesselDto, VesselResponseDto } from '@/customer/data-access/dto/vessel.dto';
import { CustomersResponseDto } from '@/customer/data-access/dto/customer.dto';

import { VesselDetailUi } from '@/customer/ui/vessel-detail/vessel-detail';
import { VesselFormUi } from '@/customer/ui/vessel-form/vessel-form';

@Component({
  selector: 'vessel-detail',
  templateUrl: './vessel-detail.html',
  imports: [NgIcon, Skeleton, Sheet, Button, Pagination, VesselDetailUi, VesselFormUi],
  viewProviders: [
    provideIcons({ lucideMapPin, lucidePencil, lucideShip, lucidePlus, lucideArrowLeft }),
  ],
})
export class VesselDetail {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  id = input<string>();

  vesselResource = httpResource<VesselResponseDto>(() => `/api/vessels/${this.id()}`);
  customersResource = httpResource<CustomersResponseDto>(() => `/api/customers`, {
    defaultValue: {
      customers: [],
      total: 0,
    },
  });

  page = signal(1);
  submitting = signal(false);
  isSheetActive = signal(false);

  selectedVessel = signal<VesselDto | null>(null);

  vessel = computed(() => this.vesselResource.value()?.vessel ?? null);
  loading = computed(() => this.vesselResource.isLoading());

  customers = computed(() => this.customersResource.value().customers);
  loadingCustomers = computed(() => this.customersResource.isLoading());

  /** Iframe src for Google Maps (address search / Embed API). */
  mapEmbedSrc = computed((): SafeResourceUrl | null => {
    const vessel = this.vessel();
    if (!vessel?.customer?.address) {
      return null;
    }

    const { address, city, state } = vessel.customer.address;
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

  openSheet() {
    this.isSheetActive.set(true);
    this.selectedVessel.set(this.vessel());
  }

  closeSheet() {
    this.isSheetActive.set(false);
    this.selectedVessel.set(null);
  }

  handleSubmit(vessel: Omit<VesselDto, 'id' | 'customer'>) {
    this.submitting.set(true);

    const vesselId = this.id();

    this.http
      .put<VesselDto>(`/api/vessels/${vesselId}`, vessel)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.vesselResource.reload();

          this.closeSheet();

          toast.success('Embarcação atualizada com sucesso', {
            description: `A embarcação ${vessel.name} foi atualizada com sucesso.`,
          });
        },
        error: () => {
          toast.error('Erro ao atualizar embarcação', {
            description: 'Ocorreu um erro ao atualizar a embarcação.',
          });
        },
      });
  }
}

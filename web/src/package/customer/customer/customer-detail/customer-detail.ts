import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowUpRight,
  lucideBuilding2,
  lucideMail,
  lucideMapPin,
  lucidePhone,
  lucideShip,
  lucideTrash2,
} from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { initials } from '../../../shared/components/lib/initials';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import {
  GetVesselsResponse,
  Vessel,
  VesselService,
  vesselTypeLabels,
} from '../../vessel/vessel.service';
import { Customer } from '../customer.service';

@Component({
  selector: 'customer-detail',
  imports: [NgIcon, RouterLink, Confirmation, Skeleton],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowUpRight,
      lucideBuilding2,
      lucideMail,
      lucideMapPin,
      lucidePhone,
      lucideShip,
      lucideTrash2,
    }),
  ],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly vesselService = inject(VesselService);

  id = input.required<string>();
  /** Bound by the route resource; null when the Customer answered 404. */
  customer = input.required<Customer | null>();

  /** Every Vessel of the Customer in one request (AD-022, AD-023). */
  vesselsResource = httpResource<GetVesselsResponse>(() =>
    this.customer() ? `/api/vessels?customerId=${this.id()}` : undefined,
  );

  confirming = signal(false);
  isDeleteVesselDialogActive = signal(false);
  selectedVessel = signal<Vessel | null>(null);

  loading = computed(() => this.vesselsResource.isLoading());
  vessels = computed(() => resourceValue(this.vesselsResource)?.vessels ?? []);
  vesselCount = computed(() => resourceValue(this.vesselsResource)?.total ?? 0);

  protected readonly typeLabels = vesselTypeLabels;
  protected readonly initialsOf = initials;

  openDeleteVesselDialog(vessel: Vessel) {
    this.selectedVessel.set(vessel);
    this.isDeleteVesselDialogActive.set(true);
  }

  closeDeleteVesselDialog() {
    this.isDeleteVesselDialogActive.set(false);
    this.selectedVessel.set(null);
  }

  deleteVessel() {
    const vessel = this.selectedVessel();
    if (!vessel) return;
    this.confirming.set(true);

    this.vesselService.deleteVessel(vessel.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.closeDeleteVesselDialog();
        this.vesselsResource.reload();
        toast.success('Embarcação excluída com sucesso', {
          description: 'A embarcação foi excluída com sucesso.',
        });
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDeleteVesselDialog();
        toast.error('Erro ao excluir embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a embarcação.'),
        });
      },
    });
  }
}

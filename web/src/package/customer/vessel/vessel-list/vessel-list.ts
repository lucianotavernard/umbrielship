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
import { GetCustomersResponse } from '../../customer/customer.service';
import { VesselForm } from '../components/vessel-form';
import { VesselList as VesselListUI } from '../components/vessel-list';
import { CreateVesselRequest, GetVesselsResponse, Vessel, VesselService } from '../vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({
  selector: 'vessel-list',
  imports: [NgIcon, Button, Confirmation, Pagination, Sheet, Skeleton, VesselForm, VesselListUI],
  viewProviders: [provideIcons({ lucidePlus })],
  templateUrl: './vessel-list.html',
})
export class VesselList {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly vesselService = inject(VesselService);
  private readonly vesselForm = viewChild(VesselForm);

  vesselResource = httpResource<GetVesselsResponse>(() => `/api/vessels?page=${this.page()}`);
  customerResource = httpResource<GetCustomersResponse>(() => '/api/customers?page=1');

  page = signal(1);
  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  selectedVessel = signal<Vessel | null>(null);

  loading = computed(() => this.vesselResource.isLoading());
  vessels = computed(() => resourceValue(this.vesselResource)?.vessels ?? []);
  customers = computed(() => resourceValue(this.customerResource)?.customers ?? []);
  totalVessels = computed(() => resourceValue(this.vesselResource)?.total ?? 0);

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(vessel: Vessel) {
    this.selectedVessel.set(vessel);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.selectedVessel.set(null);
    this.isDialogActive.set(false);
  }

  createVessel(vessel: CreateVesselRequest) {
    this.submitting.set(true);
    this.vesselService.createVessel(vessel).subscribe({
      next: () => {
        toast.success('Embarcação criada com sucesso', {
          description: 'A embarcação foi criada com sucesso.',
        });
        this.submitting.set(false);
        this.vesselForm()?.reset();
        this.closeSheet();
        this.vesselResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a embarcação.'),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteVessel() {
    this.confirming.set(true);

    const vessel = this.selectedVessel();
    this.vesselService.deleteVessel(vessel!.id).subscribe({
      next: () => {
        this.vesselResource.reload();
        this.closeDialog();

        toast.success('Embarcação excluída com sucesso', {
          description: 'A embarcação foi excluída com sucesso.',
        });
      },
      error: (response) => {
        toast.error('Erro ao excluir embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a embarcação.'),
        });
      },
    });
  }
}

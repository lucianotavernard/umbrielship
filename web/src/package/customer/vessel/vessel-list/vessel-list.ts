import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { GetCustomersResponse } from '../../customer/customer.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { VesselForm } from '../components/vessel-form';
import { VesselList as VesselListUI } from '../components/vessel-list';
import { CreateVesselRequest, GetVesselsResponse, Vessel, VesselService } from '../vessel.service';

@Component({
  selector: 'vessel-list',
  imports: [Button, Pagination, Sheet, Confirmation, VesselForm, VesselListUI],
  templateUrl: './vessel-list.html',
})
export class VesselList {
  private readonly vesselService = inject(VesselService);
  private readonly vesselForm = viewChild(VesselForm);

  private readonly vesselsResource = httpResource<GetVesselsResponse>(
    () => `/api/vessels?page=${this.page()}`,
  );
  private readonly customersResource = httpResource<GetCustomersResponse>(() => '/api/customers?page=1');

  readonly perPage = 10;

  page = signal(1);
  isSheetActive = signal(false);
  isDialogActive = signal(false);
  confirming = signal(false);
  selected = signal<Vessel | null>(null);

  loading = computed(() => this.vesselsResource.isLoading());
  vessels = computed(() => resourceValue(this.vesselsResource)?.vessels ?? []);
  total = computed(() => resourceValue(this.vesselsResource)?.total ?? 0);
  customers = computed(() => resourceValue(this.customersResource)?.customers ?? []);

  changePage(page: number) {
    this.page.set(page);
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(vessel: Vessel) {
    this.selected.set(vessel);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.isDialogActive.set(false);
    this.selected.set(null);
  }

  createVessel(vessel: CreateVesselRequest) {
    this.vesselService.createVessel(vessel).subscribe({
      next: () => {
        toast.success('Embarcação criada com sucesso', {
          description: 'A embarcação foi criada com sucesso.',
        });
        this.closeSheet();
        this.vesselsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a embarcação.'),
        });
      },
    });
  }

  confirmDelete() {
    const vessel = this.selected();
    if (!vessel || this.confirming()) return;
    this.confirming.set(true);
    this.vesselService.deleteVessel(vessel.id).subscribe({
      next: () => {
        this.confirming.set(false);
        toast.success('Embarcação excluída');
        this.closeDialog();
        this.vesselsResource.reload();
      },
      error: (response) => {
        this.confirming.set(false);
        toast.error('Erro ao excluir embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a embarcação.'),
        });
      },
    });
  }
}

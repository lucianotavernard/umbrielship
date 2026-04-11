import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUsers, lucidePlus } from '@ng-icons/lucide';

import { toast } from '@/shared/ui/toaster';
import { Sheet } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { Pagination } from '@/shared/ui/pagination';
import { Confirmation } from '@/shared/ui/confirmation';
import { Skeleton } from '@/shared/ui/skeleton';

import { VesselListUi } from '@/customer/ui/vessel-list/vessel-list';
import { VesselFormUi } from '@/customer/ui/vessel-form/vessel-form';
import { VesselDto, VesselsResponseDto } from '@/customer/data-access/dto/vessel.dto';

@Component({
  selector: 'vessel-list',
  templateUrl: './vessel-list.html',
  imports: [NgIcon, Button, Pagination, Sheet, Skeleton, Confirmation, VesselListUi, VesselFormUi],
  viewProviders: [provideIcons({ lucideUsers, lucidePlus })],
})
export class VesselList {
  private readonly http = inject(HttpClient);
  private readonly vesselsResource = httpResource<VesselsResponseDto>(() => '/api/vessels', {
    defaultValue: {
      vessels: [],
      total: 0,
    },
  });

  page = signal(1);
  submitting = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  selectedVessel = signal<VesselDto | null>(null);

  loading = computed(() => this.vesselsResource.isLoading());
  vessels = computed(() => this.vesselsResource.value().vessels);
  total = computed(() => this.vesselsResource.value().total);

  changePage(page: number) {
    this.page.set(page);
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(vessel: VesselDto) {
    this.selectedVessel.set(vessel);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.isDialogActive.set(false);
    this.selectedVessel.set(null);
  }

  handleSubmit(vessel: Omit<VesselDto, 'id'>) {
    this.submitting.set(true);

    this.http
      .post<VesselDto>('/api/vessels', vessel)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.vesselsResource.reload();
          this.closeSheet();

          toast.success('Embarcação criada com sucesso', {
            description: 'A embarcação foi criada com sucesso.',
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

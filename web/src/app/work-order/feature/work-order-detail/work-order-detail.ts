import { HttpClient, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendar,
  lucideHistory,
  lucidePlus,
  lucideShip,
  lucideWrench,
} from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { toast } from '@/shared/ui/toaster';

import type {
  WorkOrderServiceDto,
  WorkOrderServicesResponseDto,
} from '@/work-order/data-access/dto/work-order-service.dto';
import type {
  WorkOrderDto,
  WorkOrderResponseDto
} from '@/work-order/data-access/dto/work-order.dto';
import { WorkOrderDetailUi } from '@/work-order/ui/work-order-detail/work-order-detail';
import { WorkOrderFormUi } from '@/work-order/ui/work-order-form/work-order-form';
import { WorkOrderServiceListUi } from '@/work-order/ui/work-order-service-list/work-order-service-list';

@Component({
  selector: 'work-order-detail',
  templateUrl: './work-order-detail.html',
  imports: [
    NgIcon,
    Sheet,
    Button,
    WorkOrderDetailUi,
    WorkOrderServiceListUi,
    WorkOrderFormUi,
  ],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideShip,
      lucideCalendar,
      lucideWrench,
      lucidePlus,
      lucideHistory,
    }),
  ],
})
export class WorkOrderDetail {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  id = input<string>();

  workOrderResource = httpResource<WorkOrderResponseDto>(() => `/api/work-orders/${this.id()}`);
  workOrderServiceResource = httpResource<WorkOrderServicesResponseDto>(
    () => `/api/work-orders/${this.id()}/services`,
    {
      defaultValue: {
        services: [],
        total: 0,
      },
    },
  );

  submitting = signal(false);
  isSheetActive = signal(false);

  submittingWorkOrderService = signal(false);
  isWorkOrderServiceSheetActive = signal(false);

  workOrder = computed(() => this.workOrderResource.value()?.workOrder ?? null);
  loading = computed(() => this.workOrderResource.isLoading());

  workOrderServices = computed(() => this.workOrderServiceResource.value().services);
  loadingWorkOrderServices = computed(() => this.workOrderServiceResource.isLoading());

  goBack() {
    const workOrder = this.workOrder();

    if (workOrder) {
      console.log(workOrder);
      this.router.navigateByUrl(`/vessels/${workOrder.vessel.vesselId}`);
    }
  }

  opensSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  handleSubmit(workOrder: Omit<WorkOrderDto, 'id'>) {
    this.submitting.set(true);
    this.http
      .put<void>(`/api/work-orders/${this.id()}`, workOrder)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.workOrderResource.reload();
          this.closeSheet();

          toast.success('Ordem atualizada com sucesso', {
            description: `A nova ordem de serviço foi atualizada com sucesso.`,
          });
        },
        error: () => {
          toast.error('Erro ao atualizar ordem', {
            description: 'Ocorreu um erro ao atualizar a ordem de serviço.',
          });
        },
      });
  }

  openSheetWorkOrderService() {
    this.isWorkOrderServiceSheetActive.set(true);
  }

  closeSheetWorkOrderService() {
    this.isWorkOrderServiceSheetActive.set(false);
  }

  handleSubmitService(workOrderService: Omit<WorkOrderServiceDto, 'id'>) {
    this.submittingWorkOrderService.set(true);

    this.http
      .post<void>(`/api/work-orders/${this.id()}/services`, workOrderService)
      .pipe(finalize(() => this.submittingWorkOrderService.set(false)))
      .subscribe({
        next: () => {
          this.workOrderResource.reload();
          this.closeSheetWorkOrderService();

          toast.success('Serviço adicionado com sucesso', {
            description: 'O serviço foi adicionado à ordem de serviço com sucesso.',
          });
        },
        error: () => {
          toast.error('Erro ao adicionar serviço', {
            description: 'Ocorreu um erro ao adicionar serviço à ordem de serviço.',
          });
        },
      });
  }
}

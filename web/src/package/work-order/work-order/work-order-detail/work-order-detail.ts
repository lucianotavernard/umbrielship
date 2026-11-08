import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderServiceForm } from '../../work-order-service/components/work-order-service-form';
import { WorkOrderServiceList } from '../../work-order-service/components/work-order-service-list';
import {
  CreateWorkOrderServiceRequest,
  GetWorkOrderServicesResponse,
  WorkOrderServiceService,
} from '../../work-order-service/work-order-service.service';
import { WorkOrderServiceImageService } from '../../work-order-service-image/work-order-service-image.service';
import { WorkOrderForm } from '../components/work-order-form';
import {
  GetWorkOrderResponse,
  UpdateWorkOrderRequest,
  WorkOrderService,
  workOrderStatusLabels,
} from '../work-order.service';

@Component({
  selector: 'work-order-detail',
  imports: [DatePipe, Button, Sheet, WorkOrderForm, WorkOrderServiceList, WorkOrderServiceForm],
  templateUrl: './work-order-detail.html',
})
export class WorkOrderDetail {
  private readonly router = inject(Router);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderServiceService = inject(WorkOrderServiceService);
  private readonly imageService = inject(WorkOrderServiceImageService);

  id = input.required<string>();

  private readonly workOrderResource = httpResource<GetWorkOrderResponse>(
    () => `/api/work-orders/${this.id()}`,
  );
  private readonly servicesResource = httpResource<GetWorkOrderServicesResponse>(
    () => `/api/work-orders/${this.id()}/services`,
  );

  isSheetActive = signal(false);
  isServiceSheetActive = signal(false);

  workOrder = computed(() => resourceValue(this.workOrderResource)?.workOrder ?? null);
  services = computed(() => resourceValue(this.servicesResource)?.services ?? []);
  loading = computed(() => this.workOrderResource.isLoading());
  loadingServices = computed(() => this.servicesResource.isLoading());

  protected readonly statusLabels = workOrderStatusLabels;

  goBack() {
    const workOrder = this.workOrder();
    void this.router.navigateByUrl(
      workOrder ? `/vessels/${workOrder.vessel.vesselId}` : '/vessels',
    );
  }

  save(workOrder: UpdateWorkOrderRequest) {
    this.workOrderService.updateWorkOrder(this.id(), workOrder).subscribe({
      next: () => {
        toast.success('Ordem atualizada com sucesso', {
          description: 'A ordem de serviço foi atualizada com sucesso.',
        });
        this.isSheetActive.set(false);
        this.workOrderResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao atualizar ordem', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar a ordem de serviço.'),
        });
      },
    });
  }

  createService(service: CreateWorkOrderServiceRequest) {
    this.workOrderServiceService.create(this.id(), service).subscribe({
      next: () => {
        toast.success('Serviço criado com sucesso');
        this.isServiceSheetActive.set(false);
        this.servicesResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar o serviço.'),
        });
      },
    });
  }

  upload(event: { serviceId: string; file: File }) {
    this.imageService.upload(this.id(), event.serviceId, event.file).subscribe({
      next: ({ image }) => {
        toast.success('Foto enviada', { description: image.url });
      },
      error: (response) => {
        toast.error('Erro ao enviar foto', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao enviar a foto.'),
        });
      },
    });
  }
}

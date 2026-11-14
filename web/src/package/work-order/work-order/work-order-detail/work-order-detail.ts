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
import { lucideArrowLeft, lucidePlus, lucideWrench } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { WorkOrderDetail as WorkOrderDetailUI } from '../components/work-order-detail';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({
  selector: 'work-order-detail',
  imports: [NgIcon, DatePipe, Button, Sheet, WorkOrderForm, WorkOrderServiceList, WorkOrderServiceForm, WorkOrderDetailUI],
  viewProviders: [provideIcons({ lucideArrowLeft, lucideWrench, lucidePlus })],
  templateUrl: './work-order-detail.html',
})
export class WorkOrderDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderServiceService = inject(WorkOrderServiceService);
  private readonly imageService = inject(WorkOrderServiceImageService);

  id = input.required<string>();

  workOrderResource = httpResource<GetWorkOrderResponse>(() => `/api/work-orders/${this.id()}`);
  servicesResource = httpResource<GetWorkOrderServicesResponse>(() => `/api/work-orders/${this.id()}/services`);

  submitting = signal(false);
  isEditWorkOrderSheetActive = signal(false);
  isCreateServiceSheetActive = signal(false);

  workOrder = computed(() => this.workOrderResource.hasValue() ? this.workOrderResource.value()?.workOrder ?? null : null);
  loadingWorkOrder = computed(() => this.workOrderResource.isLoading());

  loading = computed(() => this.servicesResource.isLoading());
  services = computed(() => this.servicesResource.hasValue() ? this.servicesResource.value()?.services ?? [] : []);

  protected readonly statusLabels = workOrderStatusLabels;

  openEditWorkOrderSheet() {
    this.isEditWorkOrderSheetActive.set(true);
  }

  closeEditWorkOrderSheet() {
    this.isEditWorkOrderSheetActive.set(false);
  }

  openCreateServiceSheet() {
    this.isCreateServiceSheetActive.set(true);
  }

  closeCreateServiceSheet() {
    this.isCreateServiceSheetActive.set(false);
  }

  editWorkOrder(workOrder: UpdateWorkOrderRequest) {
    this.submitting.set(true);
    this.workOrderService.updateWorkOrder(this.id(), workOrder).subscribe({
      next: () => {
        toast.success('Ordem atualizada com sucesso', {
          description: 'A ordem de serviço foi atualizada com sucesso.',
        });
        this.closeEditWorkOrderSheet();
        this.workOrderResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao atualizar ordem', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar a ordem de serviço.'),
        });
      },
    });
  }

  createWorkOrderService(service: CreateWorkOrderServiceRequest) {
    this.workOrderServiceService.create(this.id(), service).subscribe({
      next: () => {
        toast.success('Serviço criado com sucesso', {
          description: 'O serviço foi criado com sucesso.',
        });
        this.closeCreateServiceSheet();
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

import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderForm } from '../../../work-order/work-order/components/work-order-form';
import { WorkOrderList } from '../../../work-order/work-order/components/work-order-list';
import {
  CreateWorkOrderRequest,
  GetWorkOrdersResponse,
  UpdateWorkOrderRequest,
  WorkOrderService,
} from '../../../work-order/work-order/work-order.service';
import { GetVesselResponse, vesselTypeLabels, VesselType } from '../vessel.service';

@Component({
  selector: 'vessel-detail',
  imports: [Button, Sheet, WorkOrderList, WorkOrderForm],
  templateUrl: './vessel-detail.html',
})
export class VesselDetail {
  private readonly router = inject(Router);
  private readonly workOrderService = inject(WorkOrderService);

  id = input.required<string>();

  private readonly vesselResource = httpResource<GetVesselResponse>(() => `/api/vessels/${this.id()}`);
  private readonly workOrdersResource = httpResource<GetWorkOrdersResponse>(
    () => `/api/work-orders?vesselId=${this.id()}&take=10&skip=0`,
  );

  isSheetActive = signal(false);

  vessel = computed(() => resourceValue(this.vesselResource)?.vessel ?? null);
  workOrders = computed(() => resourceValue(this.workOrdersResource)?.workOrders ?? []);
  loading = computed(() => this.vesselResource.isLoading());
  loadingWorkOrders = computed(() => this.workOrdersResource.isLoading());

  typeLabel(type: string) {
    return vesselTypeLabels[type as VesselType] ?? type;
  }

  goBack() {
    const vessel = this.vessel();
    void this.router.navigateByUrl(vessel ? `/customers/${vessel.customerId}` : '/vessels');
  }

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  createWorkOrder(workOrder: UpdateWorkOrderRequest) {
    const request: CreateWorkOrderRequest = { ...workOrder, vesselId: this.id() };
    this.workOrderService.createWorkOrder(request).subscribe({
      next: () => {
        toast.success('Ordem criada com sucesso');
        this.closeSheet();
        this.workOrdersResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar ordem', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a ordem de serviço.'),
        });
      },
    });
  }
}

import { HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideExternalLink,
  lucideMail,
  lucideMapPin,
  lucidePhone,
  lucidePlus,
} from '@ng-icons/lucide';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderForm } from '../../../work-order/work-order/components/work-order-form';
import { WorkOrderList } from '../../../work-order/work-order/components/work-order-list';
import {
  CreateWorkOrderRequest,
  GetWorkOrdersResponse,
  UpdateWorkOrderRequest,
  WorkOrder,
  WorkOrderService,
} from '../../../work-order/work-order/work-order.service';
import { VesselForm } from '../components/vessel-form';
import { VesselDetail as VesselDetailUI } from '../components/vessel-detail';
import {
  CreateVesselRequest,
  GetVesselResponse,
  UpdateVesselRequest,
  VesselService,
} from '../vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({
  selector: 'vessel-detail',
  imports: [
    NgIcon,
    RouterLink,
    Button,
    Confirmation,
    Pagination,
    Sheet,
    Skeleton,
    VesselDetailUI,
    VesselForm,
    WorkOrderList,
    WorkOrderForm,
  ],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucidePlus,
      lucideMapPin,
      lucideMail,
      lucidePhone,
      lucideExternalLink,
    }),
  ],
  templateUrl: './vessel-detail.html',
})
export class VesselDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  vesselService = inject(VesselService);
  workOrderService = inject(WorkOrderService);

  id = input.required<string>();

  vesselResource = httpResource<GetVesselResponse>(() => `/api/vessels/${this.id()}`);
  workOrdersResource = httpResource<GetWorkOrdersResponse>(
    () => `/api/work-orders?vesselId=${this.id()}&take=10&skip=${(this.page() - 1) * 10}`,
  );

  page = signal(1);
  submitting = signal(false);
  confirming = signal(false);
  isEditVesselSheetActive = signal(false);
  isCreateWorkOrderSheetActive = signal(false);
  isDeleteWorkOrderDialogActive = signal(false);

  selectedWorkOrder = signal<WorkOrder | null>(null);

  vessel = computed(() =>
    this.vesselResource.hasValue() ? (this.vesselResource.value()?.vessel ?? null) : null,
  );
  loadingVessel = computed(() => this.vesselResource.isLoading());
  notFound = computed(
    () => (this.vesselResource.error() as { status?: number } | undefined)?.status === HttpStatusCode.NotFound,
  );

  loading = computed(() => this.workOrdersResource.isLoading());
  workOrders = computed(() =>
    this.workOrdersResource.hasValue() ? (this.workOrdersResource.value()?.workOrders ?? []) : [],
  );
  totalWorkOrders = computed(() =>
    this.workOrdersResource.hasValue() ? (this.workOrdersResource.value()?.total ?? 0) : 0,
  );

  openCreateWorkOrderSheet() {
    this.isCreateWorkOrderSheetActive.set(true);
  }

  closeCreateWorkOrderSheet() {
    this.isCreateWorkOrderSheetActive.set(false);
  }

  openEditVesselSheet() {
    this.isEditVesselSheetActive.set(true);
  }

  closeEditVesselSheet() {
    this.isEditVesselSheetActive.set(false);
  }

  openDeleteWorkOrderDialog(workOrder: WorkOrder) {
    this.selectedWorkOrder.set(workOrder);
    this.isDeleteWorkOrderDialogActive.set(true);
  }

  closeDeleteWorkOrderDialog() {
    this.isDeleteWorkOrderDialogActive.set(false);
    this.selectedWorkOrder.set(null);
  }

  editVessel(vessel: UpdateVesselRequest) {
    this.submitting.set(true);
    const { customerId, name, type, length } = vessel;
    this.vesselService.updateVessel(this.id(), { customerId, name, type, length }).subscribe({
      next: () => {
        toast.success('Embarcação atualizada com sucesso', {
          description: 'A embarcação foi atualizada com sucesso.',
        });
        this.closeEditVesselSheet();
        this.vesselResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao atualizar embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar a embarcação.'),
        });
      },
    });
  }

  createWorkOrder(workOrder: UpdateWorkOrderRequest) {
    this.workOrderService.createWorkOrder(workOrder).subscribe({
      next: () => {
        toast.success('Ordem de serviço criada com sucesso', {
          description: 'A ordem de serviço foi criada com sucesso.',
        });
        this.closeCreateWorkOrderSheet();
        this.workOrdersResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar ordem de serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a ordem de serviço.'),
        });
      },
    });
  }

  deleteWorkOrder() {
    this.confirming.set(true);

    const workOrder = this.selectedWorkOrder();
    this.workOrderService.deleteWorkOrder(workOrder!.id).subscribe({
      next: () => {
        this.workOrdersResource.reload();
        this.closeDeleteWorkOrderDialog();

        toast.success('Ordem de serviço excluída com sucesso', {
          description: 'A ordem de serviço foi excluída com sucesso.',
        });
      },
      error: (response) => {
        toast.error('Erro ao excluir ordem de serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a ordem de serviço.'),
        });
      },
    });
  }
}

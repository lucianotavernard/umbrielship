import { HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideChevronRight,
  lucideMail,
  lucidePencil,
  lucidePhone,
  lucidePlus,
  lucideRuler,
  lucideShip,
  lucideUser,
} from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { initials } from '../../../shared/components/lib/initials';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderForm, WorkOrderFormSubmit } from '../../../work-order/work-order/components/work-order-form';
import { workforceResources } from '../../../workforce/staff/workforce-resources';
import { WorkOrderList } from '../../../work-order/work-order/components/work-order-list';
import {
  CreateWorkOrderRequest,
  GetWorkOrdersResponse,
  WorkOrder,
  WorkOrderService,
} from '../../../work-order/work-order/work-order.service';
import { VesselForm } from '../components/vessel-form';
import { formatLength } from '../vessel-csv';
import {
  CreateVesselRequest,
  GetVesselResponse,
  VesselService,
  vesselTypeLabels,
} from '../vessel.service';

@Component({
  selector: 'vessel-detail',
  imports: [
    NgIcon,
    RouterLink,
    Confirmation,
    Pagination,
    Sheet,
    Skeleton,
    VesselForm,
    WorkOrderList,
    WorkOrderForm,
  ],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideChevronRight,
      lucideMail,
      lucidePencil,
      lucidePhone,
      lucidePlus,
      lucideRuler,
      lucideShip,
      lucideUser,
    }),
  ],
  templateUrl: './vessel-detail.html',
})
export class VesselDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  /** Only an administrator names a Responsável (AD-079). */
  protected readonly isAdministrator = inject(AuthenticationService).isAdministrator;
  protected readonly workforce = workforceResources(() => this.isAdministrator(), { withAssignments: false });
  vesselService = inject(VesselService);
  workOrderService = inject(WorkOrderService);
  private readonly vesselForm = viewChild(VesselForm);
  private readonly workOrderForm = viewChild(WorkOrderForm);

  id = input.required<string>();

  vesselResource = httpResource<GetVesselResponse>(() => `/api/vessels/${this.id()}`);
  /** WorkOrders stay ten per page (AD-029). */
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

  vessel = computed(() => resourceValue(this.vesselResource)?.vessel ?? null);
  notFound = computed(
    () => (this.vesselResource.error() as { status?: number } | undefined)?.status === HttpStatusCode.NotFound,
  );

  loading = computed(() => this.workOrdersResource.isLoading());
  workOrders = computed(() => resourceValue(this.workOrdersResource)?.workOrders ?? []);
  totalWorkOrders = computed(() => resourceValue(this.workOrdersResource)?.total ?? 0);

  protected readonly typeLabels = vesselTypeLabels;
  protected readonly length = formatLength;
  protected readonly initialsOf = initials;

  /** The "Nova ordem de serviço" drawer offers only this Vessel, locked (AD-042). */
  formVessels = computed(() => {
    const vessel = this.vessel();
    return vessel ? [{ id: vessel.id, name: vessel.name, customerId: vessel.customerId }] : [];
  });
  formCustomerNames = computed(() => {
    const vessel = this.vessel();
    return new Map(vessel?.customer ? [[vessel.customerId, vessel.customer.name]] : []);
  });

  openCreateWorkOrderSheet() {
    this.workOrderForm()?.reset();
    this.isCreateWorkOrderSheetActive.set(true);
  }

  closeCreateWorkOrderSheet() {
    this.isCreateWorkOrderSheetActive.set(false);
  }

  /** Every opening shows the Vessel's values, also after a Cancelar that left typed ones. */
  openEditVesselSheet() {
    this.vesselForm()?.load(this.vessel());
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

  editVessel(vessel: CreateVesselRequest) {
    const current = this.vessel();
    if (!current) return;
    this.submitting.set(true);
    const { name, type, length, status } = vessel;
    this.vesselService
      .updateVessel(this.id(), { customerId: current.customerId, name, type, length, status })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          toast.success('Embarcação atualizada com sucesso', {
            description: 'A embarcação foi atualizada com sucesso.',
          });
          this.closeEditVesselSheet();
          this.vesselResource.reload();
        },
        error: (response) => {
          this.submitting.set(false);
          toast.error('Erro ao atualizar embarcação', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar a embarcação.'),
          });
        },
      });
  }

  createWorkOrder(workOrder: WorkOrderFormSubmit) {
    this.submitting.set(true);
    this.workOrderService.createWorkOrder(workOrder).subscribe({
      next: () => {
        this.submitting.set(false);
        toast.success('Ordem de serviço criada com sucesso', {
          description: 'A ordem de serviço foi criada com sucesso.',
        });
        this.closeCreateWorkOrderSheet();
        this.workOrdersResource.reload();
      },
      error: (response) => {
        this.submitting.set(false);
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
        this.confirming.set(false);
        // The last WorkOrder of a page takes the page with it: step back to the last one left.
        const lastPage = Math.max(1, Math.ceil((this.totalWorkOrders() - 1) / 10));
        if (this.page() > lastPage) {
          this.page.set(lastPage);
        } else {
          this.workOrdersResource.reload();
        }
        this.closeDeleteWorkOrderDialog();

        toast.success('Ordem de serviço excluída com sucesso', {
          description: 'A ordem de serviço foi excluída com sucesso.',
        });
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDeleteWorkOrderDialog();
        toast.error('Erro ao excluir ordem de serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a ordem de serviço.'),
        });
      },
    });
  }
}

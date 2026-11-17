import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideChevronRight,
  lucideClipboardCheck,
  lucideClipboardList,
  lucidePencil,
  lucidePlus,
  lucideRuler,
  lucideShip,
  lucideWrench,
} from '@ng-icons/lucide';

import { formatLength } from '../../../customer/vessel/vessel-csv';
import { VesselType, vesselTypeLabels } from '../../../customer/vessel/vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionAssignmentForm } from '../../inspection-assignment/components/inspection-assignment-form';
import { InspectionAssignmentList } from '../../inspection-assignment/components/inspection-assignment-list';
import {
  AssignInspectionTemplateRequest,
  GetInspectionAssignmentsResponse,
  InspectionAssignment,
  InspectionAssignmentService,
} from '../../inspection-assignment/inspection-assignment.service';
import { GetInspectionTemplatesResponse } from '../../inspection-template/inspection-template.service';
import { Inspection } from '../../inspection/inspection.service';
import { WorkOrderServiceForm } from '../../work-order-service/components/work-order-service-form';
import { WorkOrderServiceList } from '../../work-order-service/components/work-order-service-list';
import {
  CreateWorkOrderServiceRequest,
  GetWorkOrderServicesResponse,
  WorkOrderServiceService,
} from '../../work-order-service/work-order-service.service';
import { WorkOrderServiceImageService } from '../../work-order-service-image/work-order-service-image.service';
import { WorkOrderForm, WorkOrderFormValue } from '../components/work-order-form';
import {
  CreateWorkOrderRequest,
  GetWorkOrderResponse,
  workOrderCode,
  WorkOrderService,
  workOrderStatusLabels,
  workOrderStatusTones,
} from '../work-order.service';

/** A WorkOrder in the mareos look (AD-033): its Vessel, period, services and inspections. */
@Component({
  selector: 'work-order-detail',
  imports: [
    NgIcon,
    DatePipe,
    RouterLink,
    Confirmation,
    Sheet,
    Skeleton,
    WorkOrderForm,
    WorkOrderServiceList,
    WorkOrderServiceForm,
    InspectionAssignmentForm,
    InspectionAssignmentList,
  ],
  viewProviders: [
    provideIcons({
      lucideCalendarDays,
      lucideChevronRight,
      lucideClipboardCheck,
      lucideClipboardList,
      lucidePencil,
      lucidePlus,
      lucideRuler,
      lucideShip,
      lucideWrench,
    }),
  ],
  templateUrl: './work-order-detail.html',
})
export class WorkOrderDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  protected readonly isAdministrator = inject(AuthenticationService).isAdministrator;
  private readonly role = inject(AuthenticationService).role;
  protected readonly isInspector = computed(() => this.role() === 'inspector');
  private readonly router = inject(Router);
  private readonly inspectionAssignmentService = inject(InspectionAssignmentService);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderServiceService = inject(WorkOrderServiceService);
  private readonly imageService = inject(WorkOrderServiceImageService);
  private readonly workOrderForm = viewChild(WorkOrderForm);
  private readonly serviceForm = viewChild(WorkOrderServiceForm);

  id = input.required<string>();

  workOrderResource = httpResource<GetWorkOrderResponse>(() => `/api/work-orders/${this.id()}`);
  servicesResource = httpResource<GetWorkOrderServicesResponse>(() => `/api/work-orders/${this.id()}/services`);
  assignmentsResource = httpResource<GetInspectionAssignmentsResponse>(
    () => `/api/work-orders/${this.id()}/inspection-assignments`,
  );
  // The templates are read only while the assignment sheet is open.
  templatesResource = httpResource<GetInspectionTemplatesResponse>(() =>
    this.isAssignSheetActive() ? '/api/inspection-templates?per_page=100' : undefined,
  );

  submitting = signal(false);
  assigning = signal(false);
  removing = signal(false);
  isAssignSheetActive = signal(false);
  selectedAssignment = signal<InspectionAssignment | null>(null);
  isEditWorkOrderSheetActive = signal(false);
  isCreateServiceSheetActive = signal(false);

  workOrder = computed(() => resourceValue(this.workOrderResource)?.workOrder ?? null);
  notFound = computed(() => (this.workOrderResource.error() as { status?: number } | undefined)?.status === 404);
  code = computed(() => workOrderCode(this.id()));

  services = computed(() => resourceValue(this.servicesResource)?.services ?? []);
  loadingServices = computed(() => this.servicesResource.isLoading());

  loadingAssignments = computed(() => this.assignmentsResource.isLoading());
  assignments = computed(() => resourceValue(this.assignmentsResource)?.inspectionAssignments ?? []);
  loadingTemplates = computed(() => this.templatesResource.isLoading());
  templates = computed(() => resourceValue(this.templatesResource)?.inspectionTemplates ?? []);
  templatesError = computed(() => {
    const error = this.templatesResource.error();
    return error
      ? apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar os modelos de inspeção.')
      : null;
  });

  protected readonly statusLabels = workOrderStatusLabels;
  protected readonly statusTones = workOrderStatusTones;
  protected readonly length = formatLength;

  vesselType = computed(() => {
    const type = this.workOrder()?.vessel.type;
    return type ? (vesselTypeLabels[type as VesselType] ?? type) : '';
  });

  workOrderStatus = computed(() => this.workOrder()?.status ?? null);
  serviceStatuses = computed(() =>
    Object.fromEntries(this.services().map((service) => [service.id, service.status])),
  );

  /** The drawer edits this WorkOrder with its Vessel locked. */
  formValue = computed<WorkOrderFormValue | null>(() => {
    const order = this.workOrder();
    return order
      ? { vesselId: order.vessel.vesselId, startDate: order.startDate, endDate: order.endDate, status: order.status }
      : null;
  });
  formVessels = computed(() => {
    const order = this.workOrder();
    return order ? [{ id: order.vessel.vesselId, name: order.vessel.name, customerId: '' }] : [];
  });

  inspect(assignment: InspectionAssignment) {
    void this.router.navigate(['/work-orders', this.id(), 'assignments', assignment.id, 'inspect']);
  }

  openInspection(selection: { assignment: InspectionAssignment; inspection: Inspection }) {
    void this.router.navigate([
      '/work-orders',
      this.id(),
      'assignments',
      selection.assignment.id,
      'inspections',
      selection.inspection.id,
    ]);
  }

  openAssignSheet() {
    this.isAssignSheetActive.set(true);
  }

  closeAssignSheet() {
    this.isAssignSheetActive.set(false);
  }

  openRemoveDialog(assignment: InspectionAssignment) {
    this.selectedAssignment.set(assignment);
  }

  closeRemoveDialog() {
    this.selectedAssignment.set(null);
  }

  assignInspectionTemplate(request: AssignInspectionTemplateRequest) {
    this.assigning.set(true);
    this.inspectionAssignmentService.assign(this.id(), request).subscribe({
      next: () => {
        toast.success('Modelo atribuído com sucesso', {
          description: 'O modelo de inspeção foi atribuído à ordem de serviço.',
        });
        this.assigning.set(false);
        this.closeAssignSheet();
        this.assignmentsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao atribuir modelo', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao atribuir o modelo de inspeção.'),
        });
        this.assigning.set(false);
      },
    });
  }

  removeInspectionAssignment() {
    const assignment = this.selectedAssignment();
    if (!assignment) return;

    this.removing.set(true);
    this.inspectionAssignmentService.remove(this.id(), assignment.id).subscribe({
      next: () => {
        toast.success('Atribuição removida com sucesso', {
          description: 'A atribuição e as perguntas copiadas foram excluídas.',
        });
        this.removing.set(false);
        this.closeRemoveDialog();
        this.assignmentsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao remover atribuição', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao remover a atribuição.'),
        });
        this.removing.set(false);
        this.closeRemoveDialog();
      },
    });
  }

  openEditWorkOrderSheet() {
    const value = this.formValue();
    if (value) this.workOrderForm()?.load(value);
    this.isEditWorkOrderSheetActive.set(true);
  }

  closeEditWorkOrderSheet() {
    this.isEditWorkOrderSheetActive.set(false);
  }

  openCreateServiceSheet() {
    this.serviceForm()?.reset();
    this.isCreateServiceSheetActive.set(true);
  }

  closeCreateServiceSheet() {
    this.isCreateServiceSheetActive.set(false);
  }

  editWorkOrder(request: CreateWorkOrderRequest) {
    this.submitting.set(true);
    this.workOrderService
      .updateWorkOrder(this.id(), { startDate: request.startDate, endDate: request.endDate, status: request.status })
      .subscribe({
        next: () => {
          toast.success('Ordem atualizada com sucesso', {
            description: 'A ordem de serviço foi atualizada com sucesso.',
          });
          this.submitting.set(false);
          this.closeEditWorkOrderSheet();
          this.workOrderResource.reload();
        },
        error: (response) => {
          this.submitting.set(false);
          toast.error('Erro ao atualizar ordem', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar a ordem de serviço.'),
          });
        },
      });
  }

  createWorkOrderService(service: CreateWorkOrderServiceRequest) {
    this.submitting.set(true);
    this.workOrderServiceService.create(this.id(), service).subscribe({
      next: () => {
        toast.success('Serviço criado com sucesso', {
          description: 'O serviço foi criado com sucesso.',
        });
        this.submitting.set(false);
        this.closeCreateServiceSheet();
        this.servicesResource.reload();
      },
      error: (response) => {
        this.submitting.set(false);
        toast.error('Erro ao criar serviço', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar o serviço.'),
        });
      },
    });
  }

  upload(event: { serviceId: string; file: File }) {
    this.imageService.upload(this.id(), event.serviceId, event.file).subscribe({
      next: () => {
        toast.success('Foto enviada', { description: 'A foto foi anexada ao serviço.' });
      },
      error: (response) => {
        toast.error('Erro ao enviar foto', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao enviar a foto.'),
        });
      },
    });
  }
}

import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
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
import { InspectionAssignmentForm } from '../../inspection-assignment/components/inspection-assignment-form';
import { InspectionAssignmentList } from '../../inspection-assignment/components/inspection-assignment-list';
import {
  AssignInspectionTemplateRequest,
  GetInspectionAssignmentsResponse,
  InspectionAssignment,
  InspectionAssignmentService,
} from '../../inspection-assignment/inspection-assignment.service';
import { GetInspectionTemplatesResponse } from '../../inspection-template/inspection-template.service';
import { WorkOrderForm } from '../components/work-order-form';
import {
  GetWorkOrderResponse,
  UpdateWorkOrderRequest,
  WorkOrderService,
  workOrderStatusLabels,
} from '../work-order.service';
import { lucideArrowLeft, lucideClipboardCheck, lucidePlus, lucideWrench } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { WorkOrderDetail as WorkOrderDetailUI } from '../components/work-order-detail';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';

@Component({
  selector: 'work-order-detail',
  imports: [
    NgIcon,
    DatePipe,
    Button,
    Confirmation,
    Sheet,
    WorkOrderForm,
    WorkOrderServiceList,
    WorkOrderServiceForm,
    WorkOrderDetailUI,
    InspectionAssignmentForm,
    InspectionAssignmentList,
  ],
  viewProviders: [provideIcons({ lucideArrowLeft, lucideClipboardCheck, lucideWrench, lucidePlus })],
  templateUrl: './work-order-detail.html',
})
export class WorkOrderDetail {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  protected readonly isAdministrator = inject(AuthenticationService).isAdministrator;
  private readonly inspectionAssignmentService = inject(InspectionAssignmentService);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly workOrderServiceService = inject(WorkOrderServiceService);
  private readonly imageService = inject(WorkOrderServiceImageService);

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

  workOrder = computed(() => this.workOrderResource.hasValue() ? this.workOrderResource.value()?.workOrder ?? null : null);
  loadingWorkOrder = computed(() => this.workOrderResource.isLoading());

  loading = computed(() => this.servicesResource.isLoading());
  services = computed(() => this.servicesResource.hasValue() ? this.servicesResource.value()?.services ?? [] : []);

  loadingAssignments = computed(() => this.assignmentsResource.isLoading());
  assignments = computed(() => resourceValue(this.assignmentsResource)?.inspectionAssignments ?? []);
  loadingTemplates = computed(() => this.templatesResource.isLoading());
  templates = computed(() => resourceValue(this.templatesResource)?.inspectionTemplates ?? []);

  protected readonly statusLabels = workOrderStatusLabels;

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

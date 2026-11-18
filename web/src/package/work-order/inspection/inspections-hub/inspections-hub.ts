import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck, lucideClipboardList, lucideClock3, lucidePlus } from '@ng-icons/lucide';

import { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Metric, twoDigits } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import {
  AssignToWorkOrderForm,
  AssignToWorkOrderRequest,
} from '../../inspection-assignment/components/assign-to-work-order-form';
import {
  AssignmentCardRow,
  InspectionAssignmentCards,
} from '../../inspection-assignment/components/inspection-assignment-cards';
import {
  GetOrganizationInspectionAssignmentsResponse,
  InspectionAssignmentService,
} from '../../inspection-assignment/inspection-assignment.service';
import { inspectionBlockedReason } from '../../inspection-assignment/inspection-availability';
import { InspectionTemplateCards } from '../../inspection-template/components/inspection-template-cards';
import { InspectionTemplateForm } from '../../inspection-template/components/inspection-template-form';
import {
  GetInspectionTemplatesResponse,
  InspectionTemplateRequest,
  InspectionTemplateService,
  InspectionTemplateSummary,
  isNameTaken,
  NAME_TAKEN,
} from '../../inspection-template/inspection-template.service';
import { WorkOrderRow } from '../../work-order/work-order-filters';
import { GetWorkOrdersResponse } from '../../work-order/work-order.service';

type Tab = 'templates' | 'assignments';

/** The mareos "Inspeções" hub (AD-032, AD-038): templates and assignments, by Role. */
@Component({
  selector: 'inspections-hub',
  imports: [
    NgIcon,
    Metric,
    Sheet,
    Skeleton,
    InspectionTemplateCards,
    InspectionTemplateForm,
    InspectionAssignmentCards,
    AssignToWorkOrderForm,
  ],
  viewProviders: [provideIcons({ lucideClipboardCheck, lucideClipboardList, lucideClock3, lucidePlus })],
  templateUrl: './inspections-hub.html',
})
export class InspectionsHub {
  private readonly authentication = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly templateService = inject(InspectionTemplateService);
  private readonly assignmentService = inject(InspectionAssignmentService);
  private readonly templateForm = viewChild(InspectionTemplateForm);
  private readonly assignForm = viewChild(AssignToWorkOrderForm);

  protected readonly isAdministrator = this.authentication.isAdministrator;
  protected readonly isInspector = computed(() => this.authentication.role() === 'inspector');

  templatesResource = httpResource<GetInspectionTemplatesResponse>(() => '/api/inspection-templates');
  assignmentsResource = httpResource<GetOrganizationInspectionAssignmentsResponse>(() => '/api/inspection-assignments');
  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');

  tab = signal<Tab>('templates');
  /** The template cards take the wide column; the assignment list, for any Role, the narrow one. */
  wide = computed(() => !this.isInspector() && this.tab() === 'templates');
  submitting = signal(false);
  isTemplateSheetActive = signal(false);
  assigning = signal<InspectionTemplateSummary | null>(null);

  loading = computed(
    () =>
      this.templatesResource.isLoading() ||
      this.assignmentsResource.isLoading() ||
      this.workOrderResource.isLoading() ||
      this.vesselResource.isLoading(),
  );
  templates = computed(() => resourceValue(this.templatesResource)?.inspectionTemplates ?? []);
  private readonly vesselNames = computed(
    () => new Map((resourceValue(this.vesselResource)?.vessels ?? []).map((vessel) => [vessel.id, vessel.name])),
  );
  workOrders = computed<WorkOrderRow[]>(() =>
    (resourceValue(this.workOrderResource)?.workOrders ?? []).map((order) => ({
      ...order,
      vesselName: this.vesselNames().get(order.vesselId) ?? '',
      customerName: '',
    })),
  );
  private readonly assignments = computed(() => resourceValue(this.assignmentsResource)?.inspectionAssignments ?? []);

  /** Newest first, as the API lists them; for an inspector, those inspectable now come first (AD-043). */
  assignmentRows = computed<AssignmentCardRow[]>(() => {
    const rows = this.assignments().map((assignment) => ({
      ...assignment,
      vesselName: this.vesselNames().get(assignment.workOrder.vesselId) ?? '',
      blockedReason: inspectionBlockedReason(
        assignment.workOrder.status,
        assignment.service?.status,
        assignment.service !== null,
      ),
    }));
    if (!this.isInspector()) return rows;
    return [...rows.filter((row) => row.blockedReason === null), ...rows.filter((row) => row.blockedReason !== null)];
  });

  metrics = computed(() => ({
    templates: twoDigits(this.templates().length),
    waiting: twoDigits(this.assignments().filter((assignment) => assignment.inspections.length === 0).length),
    completed: twoDigits(this.assignments().reduce((sum, assignment) => sum + assignment.inspections.length, 0)),
  }));

  constructor() {
    effect(() => {
      const errors = [this.templatesResource, this.assignmentsResource, this.workOrderResource, this.vesselResource]
        .map((resource) => resource.error())
        .filter((error) => !!error);
      // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
      untracked(() => {
        for (const error of errors) {
          toast.error('Erro ao carregar inspeções', {
            description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar as inspeções.'),
          });
        }
      });
    });
  }

  openTemplateSheet() {
    this.templateForm()?.reset();
    this.isTemplateSheetActive.set(true);
  }

  closeTemplateSheet() {
    this.isTemplateSheetActive.set(false);
  }

  createTemplate(request: InspectionTemplateRequest) {
    this.submitting.set(true);
    this.templateService.createInspectionTemplate(request).subscribe({
      next: () => {
        toast.success('Modelo de inspeção criado com sucesso', {
          description: 'O modelo de inspeção foi criado com sucesso.',
        });
        this.submitting.set(false);
        this.closeTemplateSheet();
        this.tab.set('templates');
        this.templatesResource.reload();
      },
      error: (response) => {
        if (isNameTaken(response)) {
          toast.error(NAME_TAKEN);
        } else {
          toast.error('Erro ao criar modelo de inspeção', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao criar o modelo de inspeção.'),
          });
        }
        this.submitting.set(false);
      },
    });
  }

  openAssign(template: InspectionTemplateSummary) {
    this.assignForm()?.reset();
    this.assigning.set(template);
  }

  closeAssign() {
    this.assigning.set(null);
  }

  assign(request: AssignToWorkOrderRequest) {
    const template = this.assigning();
    if (!template) return;
    this.submitting.set(true);
    const body = request.serviceId
      ? { templateId: template.id, serviceId: request.serviceId }
      : { templateId: template.id };
    this.assignmentService.assign(request.workOrderId, body).subscribe({
      next: () => {
        toast.success('Modelo atribuído com sucesso', {
          description: 'O modelo de inspeção foi atribuído à ordem de serviço.',
        });
        this.submitting.set(false);
        this.closeAssign();
        this.tab.set('assignments');
        this.assignmentsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao atribuir modelo', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao atribuir o modelo de inspeção.'),
        });
        this.submitting.set(false);
      },
    });
  }

  inspect(row: AssignmentCardRow) {
    void this.router.navigate(['/work-orders', row.workOrder.id, 'assignments', row.id, 'inspect'], {
      queryParams: { from: 'inspections' },
    });
  }
}

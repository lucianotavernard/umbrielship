import { httpResource } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCheck, lucideShieldCheck, lucideTrash2 } from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import {
  GetInspectionAssignmentsResponse,
  WHOLE_WORK_ORDER,
} from '../../inspection-assignment/inspection-assignment.service';
import { inspectionBlockedReason } from '../../inspection-assignment/inspection-availability';
import { GetWorkOrderServicesResponse } from '../../work-order-service/work-order-service.service';
import { GetWorkOrderResponse, workOrderCode } from '../../work-order/work-order.service';
import { InspectionChecklist } from '../components/inspection-checklist';
import { InspectionView } from '../components/inspection-view';
import { CompleteInspectionRequest, inspectionResultLabels, InspectionService } from '../inspection.service';

/**
 * An Inspection on a full page (AD-032, AD-045): answered at `/…/inspect`, read at
 * `/…/inspections/:inspectionId`.
 */
@Component({
  selector: 'inspection-page',
  imports: [NgIcon, DatePipe, RouterLink, Confirmation, Skeleton, InspectionChecklist, InspectionView],
  viewProviders: [provideIcons({ lucideArrowLeft, lucideCheck, lucideShieldCheck, lucideTrash2 })],
  templateUrl: './inspection-page.html',
})
export class InspectionPage {
  private readonly authentication = inject(AuthenticationService);
  private readonly inspectionService = inject(InspectionService);
  private readonly router = inject(Router);
  private readonly checklist = viewChild(InspectionChecklist);

  id = input.required<string>();
  assignmentId = input.required<string>();
  /** Set on the read-only page of a completed Inspection. */
  inspectionId = input<string>();
  /** `inspections` when the page was opened from the Inspections hub. */
  from = input<string>();

  workOrderResource = httpResource<GetWorkOrderResponse>(() => `/api/work-orders/${this.id()}`);
  servicesResource = httpResource<GetWorkOrderServicesResponse>(() => `/api/work-orders/${this.id()}/services`);
  assignmentsResource = httpResource<GetInspectionAssignmentsResponse>(
    () => `/api/work-orders/${this.id()}/inspection-assignments`,
  );

  completing = signal(false);
  discarding = signal(false);
  isDiscardDialogActive = signal(false);

  protected readonly isInspector = computed(() => this.authentication.role() === 'inspector');
  protected readonly code = computed(() => workOrderCode(this.id()));
  protected readonly resultLabels = inspectionResultLabels;
  protected readonly wholeWorkOrder = WHOLE_WORK_ORDER;

  loading = computed(
    () =>
      this.workOrderResource.isLoading() || this.servicesResource.isLoading() || this.assignmentsResource.isLoading(),
  );
  workOrder = computed(() => resourceValue(this.workOrderResource)?.workOrder ?? null);
  assignment = computed(
    () =>
      resourceValue(this.assignmentsResource)?.inspectionAssignments.find(
        (assignment) => assignment.id === this.assignmentId(),
      ) ?? null,
  );
  /** Questions are asked in `position` order, whatever order the response lists them in. */
  items = computed(() => [...(this.assignment()?.items ?? [])].sort((a, b) => a.position - b.position));
  inspection = computed(() => {
    const id = this.inspectionId();
    return id ? (this.assignment()?.inspections.find((inspection) => inspection.id === id) ?? null) : null;
  });

  /** Nothing to show: the WorkOrder, the assignment or the Inspection is not in the Organization. */
  notFound = computed(() => {
    if (this.workOrderResource.error() || this.assignmentsResource.error()) return true;
    if (this.loading()) return false;
    if (!this.assignment()) return true;
    return !!this.inspectionId() && !this.inspection();
  });

  blockedReason = computed(() => {
    const assignment = this.assignment();
    if (!assignment) return null;
    const service = assignment.service;
    const status = service
      ? (resourceValue(this.servicesResource)?.services.find((item) => item.id === service.id)?.status ?? null)
      : null;
    return inspectionBlockedReason(this.workOrder()?.status, status, service !== null);
  });

  fromHub = computed(() => this.from() === 'inspections');
  backLink = computed(() => (this.fromHub() ? ['/inspections'] : ['/work-orders', this.id()]));
  backLabel = computed(() => (this.fromHub() ? 'Voltar às inspeções' : 'Voltar à ordem de serviço'));

  inspectorName = computed(() => this.inspection()?.inspectorName ?? this.authentication.name() ?? '');
  target = computed(() => this.assignment()?.service?.name ?? WHOLE_WORK_ORDER);
  answered = computed(() => this.checklist()?.answered() ?? 0);

  complete(request: CompleteInspectionRequest) {
    this.completing.set(true);
    this.inspectionService.complete(this.id(), this.assignmentId(), request).subscribe({
      next: () => {
        this.completing.set(false);
        toast.success('Inspeção registrada com sucesso', {
          description: 'A inspeção foi registrada no histórico da atribuição.',
        });
        void this.router.navigate(this.backLink());
      },
      error: (response) => {
        // The page keeps the answers as typed.
        this.completing.set(false);
        this.checklist()?.closeConfirmation();
        toast.error('Erro ao registrar inspeção', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao registrar a inspeção.'),
        });
      },
    });
  }

  discard() {
    const inspectionId = this.inspectionId();
    if (!inspectionId) return;
    this.discarding.set(true);
    this.inspectionService.discard(this.id(), this.assignmentId(), inspectionId).subscribe({
      next: () => {
        this.discarding.set(false);
        this.isDiscardDialogActive.set(false);
        toast.success('Inspeção descartada com sucesso', {
          description: 'A inspeção deixou de aparecer no app.',
        });
        void this.router.navigate(['/work-orders', this.id()]);
      },
      error: (response) => {
        this.discarding.set(false);
        this.isDiscardDialogActive.set(false);
        toast.error('Erro ao descartar inspeção', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao descartar a inspeção.'),
        });
      },
    });
  }
}

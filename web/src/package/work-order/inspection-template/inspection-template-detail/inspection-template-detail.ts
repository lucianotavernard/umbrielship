import { DatePipe } from '@angular/common';
import { HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePencil, lucideTrash } from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionTemplateForm } from '../components/inspection-template-form';
import {
  GetInspectionTemplateResponse,
  InspectionTemplateRequest,
  InspectionTemplateService,
  isNameTaken,
  NAME_TAKEN,
} from '../inspection-template.service';

@Component({
  selector: 'inspection-template-detail',
  imports: [DatePipe, NgIcon, RouterLink, Button, Confirmation, Sheet, Skeleton, InspectionTemplateForm],
  viewProviders: [provideIcons({ lucideArrowLeft, lucidePencil, lucideTrash })],
  templateUrl: './inspection-template-detail.html',
})
export class InspectionTemplateDetail {
  protected readonly isAdministrator = inject(AuthenticationService).isAdministrator;
  private readonly inspectionTemplateService = inject(InspectionTemplateService);
  private readonly router = inject(Router);

  id = input.required<string>();

  inspectionTemplateResource = httpResource<GetInspectionTemplateResponse>(
    () => `/api/inspection-templates/${this.id()}`,
  );

  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  loading = computed(() => this.inspectionTemplateResource.isLoading());
  inspectionTemplate = computed(() =>
    this.inspectionTemplateResource.hasValue()
      ? (this.inspectionTemplateResource.value()?.inspectionTemplate ?? null)
      : null,
  );
  items = computed(() =>
    [...(this.inspectionTemplate()?.items ?? [])].sort((a, b) => a.position - b.position),
  );
  notFound = computed(
    () =>
      (this.inspectionTemplateResource.error() as { status?: number } | undefined)?.status ===
      HttpStatusCode.NotFound,
  );

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog() {
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.isDialogActive.set(false);
  }

  editInspectionTemplate(request: InspectionTemplateRequest) {
    this.submitting.set(true);
    this.inspectionTemplateService.updateInspectionTemplate(this.id(), request).subscribe({
      next: () => {
        toast.success('Modelo de inspeção atualizado com sucesso', {
          description: 'O modelo de inspeção foi atualizado com sucesso.',
        });
        this.submitting.set(false);
        this.closeSheet();
        this.inspectionTemplateResource.reload();
      },
      error: (response) => {
        if (isNameTaken(response)) {
          toast.error(NAME_TAKEN);
        } else {
          toast.error('Erro ao atualizar modelo de inspeção', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao atualizar o modelo de inspeção.'),
          });
        }
        this.submitting.set(false);
      },
    });
  }

  deleteInspectionTemplate() {
    this.confirming.set(true);
    this.inspectionTemplateService.deleteInspectionTemplate(this.id()).subscribe({
      next: () => {
        this.confirming.set(false);
        this.closeDialog();
        toast.success('Modelo de inspeção excluído com sucesso', {
          description: 'O modelo de inspeção foi excluído com sucesso.',
        });
        this.router.navigate(['/inspection-templates']);
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDialog();
        toast.error('Erro ao excluir modelo de inspeção', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir o modelo de inspeção.'),
        });
      },
    });
  }
}

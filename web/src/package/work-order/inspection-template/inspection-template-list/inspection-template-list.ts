import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionTemplateForm } from '../components/inspection-template-form';
import { InspectionTemplateList as InspectionTemplateListUI } from '../components/inspection-template-list';
import {
  GetInspectionTemplatesResponse,
  InspectionTemplateRequest,
  InspectionTemplateService,
  isNameTaken,
  NAME_TAKEN,
} from '../inspection-template.service';

@Component({
  selector: 'inspection-template-list',
  imports: [NgIcon, Button, Pagination, Sheet, Skeleton, InspectionTemplateForm, InspectionTemplateListUI],
  viewProviders: [provideIcons({ lucidePlus })],
  templateUrl: './inspection-template-list.html',
})
export class InspectionTemplateList {
  protected readonly isAdministrator = inject(AuthenticationService).isAdministrator;
  private readonly inspectionTemplateService = inject(InspectionTemplateService);
  private readonly inspectionTemplateForm = viewChild(InspectionTemplateForm);

  private readonly inspectionTemplateResource = httpResource<GetInspectionTemplatesResponse>(
    () => `/api/inspection-templates?page=${this.page()}`,
  );

  page = signal(1);
  submitting = signal(false);
  isSheetActive = signal(false);

  loading = computed(() => this.inspectionTemplateResource.isLoading());
  inspectionTemplates = computed(
    () => resourceValue(this.inspectionTemplateResource)?.inspectionTemplates ?? [],
  );
  total = computed(() => resourceValue(this.inspectionTemplateResource)?.total ?? 0);

  openSheet() {
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  createInspectionTemplate(request: InspectionTemplateRequest) {
    this.submitting.set(true);
    this.inspectionTemplateService.createInspectionTemplate(request).subscribe({
      next: () => {
        toast.success('Modelo de inspeção criado com sucesso', {
          description: 'O modelo de inspeção foi criado com sucesso.',
        });
        this.submitting.set(false);
        this.inspectionTemplateForm()?.reset();
        this.closeSheet();
        // The newest template is first, on page 1.
        if (this.page() === 1) {
          this.inspectionTemplateResource.reload();
        } else {
          this.page.set(1);
        }
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
}

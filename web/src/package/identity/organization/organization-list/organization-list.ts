import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { OrganizationForm } from '../components/organization-form';
import { OrganizationList as OrganizationListUI } from '../components/organization-list';
import {
  GetOrganizationsResponse,
  OrganizationService,
} from '../organization.service';

@Component({
  selector: 'organization-list',
  imports: [Button, Pagination, Sheet, OrganizationForm, OrganizationListUI],
  templateUrl: './organization-list.html',
})
export class OrganizationList {
  private readonly organizationService = inject(OrganizationService);
  private readonly organizationForm = viewChild.required(OrganizationForm);

  private readonly organizationResource = httpResource<GetOrganizationsResponse>(
    () => `/api/organizations?page=${this.page()}&per_page=${this.perPage}`,
  );

  readonly perPage = 20;

  page = signal(1);
  isSheetActive = signal(false);

  loading = computed(() => this.organizationResource.isLoading());
  organizations = computed(() => resourceValue(this.organizationResource)?.organizations ?? []);
  total = computed(() => resourceValue(this.organizationResource)?.total ?? 0);

  changePage(page: number) {
    this.page.set(page);
  }

  openSheet() {
    this.organizationForm().reset();
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  createOrganization(organization: { name: string; email: string }) {
    this.organizationService.createOrganization(organization).subscribe({
      next: () => {
        toast.success('Organização criada com sucesso');
        this.closeSheet();
        this.organizationResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar organização', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a organização.'),
        });
      },
    });
  }
}

import { Component, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { Organization, OrganizationService } from '../organization.service';
import { OrganizationForm } from './organization-form';

/**
 * The "Nova organização" drawer, opened from the Organizations list and from the sidebar's
 * Organization menu (AD-117). It posts the form, toasts, and tells who opened it what it created;
 * a failure keeps the drawer open with what was typed.
 */
@Component({
  selector: 'organization-create-sheet-ui',
  imports: [Sheet, OrganizationForm],
  template: `
    <t-sheet
      kicker="GESTÃO / ORGANIZAÇÕES"
      title="Nova organização"
      description="Preencha os campos abaixo para criar uma nova organização"
      [isActive]="isActive()"
      (closed)="closed.emit()"
    >
      <organization-form-ui [loading]="submitting()" (closed)="closed.emit()" (submitted)="create($event)" />
    </t-sheet>
  `,
})
export class OrganizationCreateSheet {
  private readonly organizationService = inject(OrganizationService);
  private readonly form = viewChild(OrganizationForm);

  readonly isActive = input(false);

  readonly closed = output<void>();
  readonly created = output<Organization>();

  protected readonly submitting = signal(false);

  constructor() {
    // Every opening starts from an empty form.
    effect(() => {
      if (this.isActive()) untracked(() => this.form()?.reset());
    });
  }

  protected create(organization: { name: string; email: string }) {
    this.submitting.set(true);
    this.organizationService.createOrganization(organization).subscribe({
      next: (created) => {
        this.submitting.set(false);
        toast.success('Organização criada com sucesso');
        this.created.emit(created);
      },
      error: (response) => {
        this.submitting.set(false);
        toast.error('Erro ao criar organização', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a organização.'),
        });
      },
    });
  }
}

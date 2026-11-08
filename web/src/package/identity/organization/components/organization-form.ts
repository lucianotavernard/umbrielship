import { Component, output, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';

@Component({
  selector: 'organization-form-ui',
  imports: [FormField, FormGroup, Label, Input, Button],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <t-form-group>
        <label tLabel for="organization-name">Nome</label>
        <input tInput id="organization-name" type="text" [formField]="organizationForm.name" />
      </t-form-group>
      <t-form-group>
        <label tLabel for="organization-email">E-mail</label>
        <input tInput id="organization-email" type="email" [formField]="organizationForm.email" />
      </t-form-group>
      <footer class="flex justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit">Salvar</button>
      </footer>
    </form>
  `,
})
export class OrganizationForm {
  submitted = output<{ name: string; email: string }>();
  closed = output<void>();

  model = signal({ name: '', email: '' });

  organizationForm = form(this.model, (path) => {
    required(path.name);
    email(path.email);
    required(path.email);
  });

  reset() {
    this.organizationForm().reset({ name: '', email: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.submitted.emit(this.organizationForm().value());
  }
}

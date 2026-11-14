import { Component, output, signal } from '@angular/core';
import { email, form, FormField, maxLength, required } from '@angular/forms/signals';

import { Button } from '../../../shared/components/ui/button';
import { FormGroup, Input, Label } from '../../../shared/components/ui/form';
import { Icon } from '../../../shared/components/ui/icon';

@Component({
  selector: 'organization-form-ui',
  imports: [FormField, FormGroup, Label, Input, Button, Icon],
  template: `
    <form class="flex flex-col gap-6" (submit)="submitForm($event)">
      <section class="rounded-2xl shadow-xs border overflow-hidden">
        <div class="flex items-center gap-3 border-b bg-muted px-6 py-4">
          <div class="flex rounded-lg bg-background p-3 shadow-xs">
            <svg tIcon name="building-2" />
          </div>
          <div>
            <h3 class="text-sm font-semibold">Detalhes da Organização</h3>
            <p class="text-xs text-muted-foreground">Informações básicas sobre a organização</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-6">
          <t-form-group class="sm:col-span-full">
            <label tLabel for="organization-name">Nome</label>
            <input
              tInput
              id="organization-name"
              type="text"
              placeholder="Acme Inc"
              [formField]="organizationForm.name"
            />
          </t-form-group>
          <t-form-group class="sm:col-span-full">
            <label tLabel for="organization-email">E-mail</label>
            <input
              tInput
              id="organization-email"
              type="email"
              placeholder="contato@acme.com"
              [formField]="organizationForm.email"
            />
          </t-form-group>
        </div>
      </section>
      <footer class="flex items-center justify-end gap-3">
        <button tButton type="button" variant="outline" (click)="closed.emit()">Cancelar</button>
        <button tButton type="submit" [disabled]="organizationForm().invalid()">Salvar</button>
      </footer>
    </form>
  `,
})
export class OrganizationForm {
  submitted = output<{ name: string; email: string }>();
  closed = output<void>();

  model = signal({ name: '', email: '' });

  organizationForm = form(this.model, (path) => {
    required(path.name, { message: 'Nome é obrigatório' });
    maxLength(path.name, 80, { message: 'Nome deve ter no máximo 80 caracteres' });
    email(path.email, { message: 'E-mail inválido' });
    required(path.email, { message: 'E-mail é obrigatório' });
  });

  reset() {
    this.organizationForm().reset({ name: '', email: '' });
  }

  submitForm(event: Event) {
    event.preventDefault();
    if (this.organizationForm().invalid()) return;
    this.submitted.emit(this.organizationForm().value());
  }
}

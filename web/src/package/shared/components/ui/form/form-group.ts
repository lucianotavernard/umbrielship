import { Component, computed, contentChildren, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { InputError } from './input-error';

@Component({
  selector: 't-form-group',
  imports: [InputError],
  template: `
    <ng-content />

    @for (binding of fields(); track $index) {
      @if (binding.state().touched()) {
        @for (error of binding.errors(); track $index) {
          <t-input-error>{{ error.message }}</t-input-error>
        }
      }
    }
  `,
  host: {
    '[class]': 'computedClass()',
  },
})
export class FormGroup {
  readonly class = input<ClassValue>('');

  protected readonly fields = contentChildren(FormField, { descendants: true });

  protected readonly computedClass = computed(() => cn('group/field flex w-full gap-3 data-[invalid=true]:text-destructive flex-col [&>*]:w-full [&>.sr-only]:w-auto', this.class()));
}

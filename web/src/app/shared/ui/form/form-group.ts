import { Component, computed, contentChild, input } from '@angular/core';
import { NgControl } from '@angular/forms';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

import { FormFieldError } from './form-field-error';

@Component({
  selector: 'form-group',
  imports: [FormFieldError],
  template: `
    <ng-content />

    @if (control()?.control?.touched && control()?.control?.errors) {
      <form-field-error [errors]="control()?.control?.errors" />
    }
  `,
  host: {
    '[class]': 'computedClass()',
  },
})
export class FormGroup {
  class = input<ClassValue>('');

  control = contentChild(NgControl);

  computedClass = computed(() => cn('grid gap-3 items-start min-w-0', this.class()));
}

import { Component, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Component({
  selector: 'input-error',
  template: `
    <ng-content />
  `,
  host: {
    '[class]': 'computedClass()',
  },
})
export class InputError {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('text-destructive text-sm font-medium', this.class()));
}

import { Component, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Component({
  selector: 't-input-error',
  template: '<ng-content />',
  host: {
    '[class]': 'computedClass()',
  },
})
export class InputError {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('text-sm font-medium text-destructive', this.class()));
}

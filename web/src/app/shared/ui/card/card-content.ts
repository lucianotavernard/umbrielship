import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card-content',
  host: {
    'data-slot': 'card-content',
    '[class]': 'computedClass()',
  },
})
export class CardContent {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('px-6', this.class()));
}

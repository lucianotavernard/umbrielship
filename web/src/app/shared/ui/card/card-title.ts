import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card-title',
  host: {
    'data-slot': 'card-title',
    '[class]': 'computedClass()',
  },
})
export class CardTitle {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('leading-none font-semibold', this.class()));
}

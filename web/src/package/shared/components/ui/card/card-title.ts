import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-title',
  host: {
    'data-slot': 'card-title',
    '[class]': 'computedClass()',
  },
})
export class CardTitle {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('leading-none font-semibold', this.class()));
}

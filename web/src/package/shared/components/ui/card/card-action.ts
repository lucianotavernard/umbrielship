import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-action',
  host: {
    'data-slot': 'card-action',
    '[class]': 'computedClass()',
  },
})
export class CardAction {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', this.class()),
  );
}

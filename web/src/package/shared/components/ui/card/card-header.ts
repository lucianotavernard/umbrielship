import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-header',
  host: {
    'data-slot': 'card-header',
    '[class]': 'computedClass()',
  },
})
export class CardHeader {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      this.class(),
    ),
  );
}

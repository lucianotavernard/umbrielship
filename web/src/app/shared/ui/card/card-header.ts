import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card-header',
  host: {
    'data-slot': 'card-header',
    '[class]': 'computedClass()',
  },
})
export class CardHeader {
  class = input<ClassValue>('');

  computedClass = computed(() =>
    cn(
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
      this.class(),
    ),
  );
}

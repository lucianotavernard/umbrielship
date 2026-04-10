import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card',
  host: {
    'data-slot': 'card',
    '[attr.data-size]': 'size()',
    '[class]': 'computedClass()',
  },
})
export class Card {
  class = input<ClassValue>('');

  size = input<'sm' | 'default'>('default');

  computedClass = computed(() =>
    cn(
      'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
      this.class(),
    ),
  );
}

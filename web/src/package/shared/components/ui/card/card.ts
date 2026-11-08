import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card',
  host: {
    'data-slot': 'card',
    '[attr.data-size]': 'size()',
    '[class]': 'computedClass()',
  },
})
export class Card {
  readonly class = input<ClassValue>('');

  readonly size = input<'sm' | 'default'>('default');

  protected readonly computedClass = computed(() =>
    cn('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', this.class()),
  );
}

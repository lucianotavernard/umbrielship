import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-content',
  host: {
    'data-slot': 'card-content',
    '[class]': 'computedClass()',
  },
})
export class CardContent {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('px-6', this.class()));
}

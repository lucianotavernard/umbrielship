import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-footer',
  host: {
    'data-slot': 'card-footer',
    '[class]': 'computedClass()',
  },
})
export class CardFooter {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('flex items-center px-6 [.border-t]:pt-6', this.class()));
}

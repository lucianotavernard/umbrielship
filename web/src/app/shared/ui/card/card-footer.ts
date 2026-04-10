import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card-footer',
  host: {
    'data-slot': 'card-footer',
    '[class]': 'computedClass()',
  },
})
export class CardFooter {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('flex items-center px-6 [.border-t]:pt-6', this.class()));
}

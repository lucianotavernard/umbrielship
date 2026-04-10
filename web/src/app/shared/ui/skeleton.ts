import { computed, Directive, input } from '@angular/core';

import { ClassValue } from 'clsx';

import { cn } from '../util/cn';

@Directive({
  selector: 'skeleton',
  host: {
    'data-slot': 'skeleton',
    '[class]': 'computedClass()',
  },
})
export class Skeleton {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('animate-pulse rounded-md bg-accent', this.class()));
}

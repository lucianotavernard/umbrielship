import { computed, Directive, input } from '@angular/core';

import { ClassValue } from 'clsx';

import { cn } from '../lib/cn';

@Directive({
  selector: '[tSkeleton], t-skeleton',
  host: {
    'data-slot': 'skeleton',
    '[class]': 'computedClass()',
  },
})
export class Skeleton {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('animate-pulse rounded-md bg-accent', this.class()));
}
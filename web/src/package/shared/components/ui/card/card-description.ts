import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-card-description',
  host: {
    'data-slot': 'card-description',
    '[class]': 'computedClass()',
  },
})
export class CardDescription {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('text-sm text-muted-foreground', this.class()));
}

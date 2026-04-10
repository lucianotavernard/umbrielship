import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'card-description',
  host: {
    'data-slot': 'card-description',
    '[class]': 'computedClass()',
  },
})
export class CardDescription {
  class = input<ClassValue>('');

  computedClass = computed(() => cn('text-sm text-muted-foreground', this.class()));
}

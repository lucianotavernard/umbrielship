import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'thead[tTableHeader]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class TableHeader {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('[&_tr]:border-b sticky top-0 z-10 bg-muted', this.class()));
}

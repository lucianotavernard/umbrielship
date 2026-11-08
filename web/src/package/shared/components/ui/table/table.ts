import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'table[tTable]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Table {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('w-full caption-bottom text-sm', this.class()));
}

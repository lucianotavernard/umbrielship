import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'td[tTableCell]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class TableCell {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', this.class()),
  );
}

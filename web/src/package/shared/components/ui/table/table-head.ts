import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'th[tTableHead]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class TableHead {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', this.class()),
  );
}

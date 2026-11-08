import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'tbody[tTableBody]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class TableBody {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('[&_tr:last-child]:border-0 **:data-[slot=table-cell]:first:w-8', this.class()),
  );
}

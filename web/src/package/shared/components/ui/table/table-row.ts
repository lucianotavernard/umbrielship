import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'tr[tTableRow]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class TableRow {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80', this.class()),
  );
}

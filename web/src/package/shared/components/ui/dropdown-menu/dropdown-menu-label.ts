import { booleanAttribute, computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-dropdown-menu-label',
  host: {
    'data-slot': 'dropdown-menu-label',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[class]': 'computedClass()',
  },
})
export class DropdownMenuLabel {
  readonly class = input<ClassValue>('');

  readonly inset = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    cn('block px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', this.class()),
  );
}

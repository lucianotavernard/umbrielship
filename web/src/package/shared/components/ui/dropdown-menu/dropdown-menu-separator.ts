import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-dropdown-menu-separator',
  host: {
    'data-slot': 'dropdown-menu-separator',
    role: 'separator',
    '[class]': 'computedClass()',
  },
})
export class DropdownMenuSeparator {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('-mx-1 my-1 block h-px bg-border', this.class()),
  );
}

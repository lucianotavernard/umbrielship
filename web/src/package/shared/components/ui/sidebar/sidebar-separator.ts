import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-sidebar-separator',
  host: {
    'data-slot': 'sidebar-separator',
    'data-sidebar': 'separator',
    role: 'separator',
    '[class]': 'computedClass()',
  },
})
export class SidebarSeparator {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('mx-2 block h-px shrink-0 bg-sidebar-border', this.class()),
  );
}

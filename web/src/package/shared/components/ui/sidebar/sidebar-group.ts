import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-sidebar-group',
  host: {
    'data-slot': 'sidebar-group',
    'data-sidebar': 'group',
    '[class]': 'computedClass()',
  },
})
export class SidebarGroup {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('relative flex w-full min-w-0 flex-col p-2', this.class()),
  );
}

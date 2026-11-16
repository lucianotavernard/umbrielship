import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'ul[tSidebarMenu]',
  host: {
    'data-slot': 'sidebar-menu',
    'data-sidebar': 'menu',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenu {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('flex w-full min-w-0 flex-col gap-1', this.class()),
  );
}

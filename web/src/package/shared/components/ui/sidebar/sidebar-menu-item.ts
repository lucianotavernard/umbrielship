import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'li[tSidebarMenuItem]',
  host: {
    'data-slot': 'sidebar-menu-item',
    'data-sidebar': 'menu-item',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenuItem {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('group/menu-item relative', this.class()));
}

import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'li[tSidebarMenuSubItem]',
  host: {
    'data-slot': 'sidebar-menu-sub-item',
    'data-sidebar': 'menu-sub-item',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenuSubItem {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('group/menu-sub-item relative', this.class()),
  );
}

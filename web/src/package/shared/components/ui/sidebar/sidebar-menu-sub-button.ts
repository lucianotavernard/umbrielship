import { booleanAttribute, computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'a[tSidebarMenuSubButton], button[tSidebarMenuSubButton]',
  host: {
    'data-slot': 'sidebar-menu-sub-button',
    'data-sidebar': 'menu-sub-button',
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive()',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenuSubButton {
  readonly class = input<ClassValue>('');

  readonly size = input<'sm' | 'md'>('md');
  readonly isActive = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    cn(
      'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
      'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      this.size() === 'sm' ? 'text-xs' : 'text-sm',
      'group-data-[collapsible=icon]:hidden',
      this.class(),
    ),
  );
}

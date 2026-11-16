import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'button[tSidebarGroupAction], a[tSidebarGroupAction]',
  host: {
    'data-slot': 'sidebar-group-action',
    'data-sidebar': 'group-action',
    '[class]': 'computedClass()',
  },
})
export class SidebarGroupAction {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
      this.class(),
    ),
  );
}

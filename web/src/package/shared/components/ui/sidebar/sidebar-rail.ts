import { computed, Directive, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { SidebarProvider } from './sidebar-provider';

/** The thin strip on the sidebar edge that toggles it. Goes inside `t-sidebar`. */
@Directive({
  selector: 'button[tSidebarRail]',
  host: {
    'data-slot': 'sidebar-rail',
    'data-sidebar': 'rail',
    'aria-label': 'Alternar barra lateral',
    title: 'Alternar barra lateral',
    tabindex: '-1',
    '[class]': 'computedClass()',
    '(click)': 'sidebar.toggle()',
  },
})
export class SidebarRail {
  protected readonly sidebar = inject(SidebarProvider);

  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex',
      'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
      '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
      'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar',
      '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
      '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
      this.class(),
    ),
  );
}

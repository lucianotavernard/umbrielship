import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { SidebarProvider } from './sidebar-provider';

export const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type SidebarMenuButtonVariants = VariantProps<typeof sidebarMenuButtonVariants>;

@Directive({
  selector: 'button[tSidebarMenuButton], a[tSidebarMenuButton]',
  host: {
    'data-slot': 'sidebar-menu-button',
    'data-sidebar': 'menu-button',
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive()',
    '[attr.title]': 'title()',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenuButton {
  private readonly sidebar = inject(SidebarProvider);

  readonly class = input<ClassValue>('');

  readonly variant = input<SidebarMenuButtonVariants['variant']>('default');
  readonly size = input<SidebarMenuButtonVariants['size']>('default');
  readonly isActive = input(false, { transform: booleanAttribute });

  /** Shown as the native tooltip only while the sidebar is collapsed to icons, when the label is hidden. */
  readonly tooltip = input('');

  protected readonly title = computed(() =>
    this.tooltip() && this.sidebar.state() === 'collapsed' && !this.sidebar.isMobile()
      ? this.tooltip()
      : null,
  );

  protected readonly computedClass = computed(() =>
    cn(sidebarMenuButtonVariants({ variant: this.variant(), size: this.size() }), this.class()),
  );
}

import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { SidebarProvider } from './sidebar-provider';

@Component({
  selector: 't-sidebar',
  imports: [NgTemplateOutlet],
  template: `
    <!-- One ng-content, stamped by whichever branch is live: a second ng-content would steal the content. -->
    <ng-template #content><ng-content /></ng-template>

    @if (collapsible() === 'none') {
      <ng-container [ngTemplateOutlet]="content" />
    } @else if (sidebar.isMobile()) {
      <div
        class="fixed inset-0 z-50 bg-black/10 transition-opacity duration-300 supports-backdrop-filter:backdrop-blur-xs"
        [class.opacity-0]="!sidebar.openMobile()"
        [class.pointer-events-none]="!sidebar.openMobile()"
        (click)="sidebar.openMobile.set(false)"
      ></div>

      <!-- Kept in the DOM while closed so it can slide; inert keeps it out of the tab order. -->
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Barra lateral"
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        [attr.inert]="sidebar.openMobile() ? null : ''"
        [style.--sidebar-width]="'18rem'"
        [class]="mobileClass()"
      >
        <div class="flex h-full w-full flex-col">
          <ng-container [ngTemplateOutlet]="content" />
        </div>
      </div>
    } @else {
      <!-- Reserves the sidebar width in the page flow; the container below is fixed. -->
      <div data-slot="sidebar-gap" [class]="gapClass()"></div>
      <div data-slot="sidebar-container" [class]="containerClass()">
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          <ng-container [ngTemplateOutlet]="content" />
        </div>
      </div>
    }
  `,
  host: {
    'data-slot': 'sidebar',
    '[attr.data-state]': 'docked() ? sidebar.state() : null',
    '[attr.data-collapsible]': 'docked() ? (sidebar.open() ? "" : collapsible()) : null',
    '[attr.data-variant]': 'docked() ? variant() : null',
    '[attr.data-side]': 'side()',
    '[class]': 'computedClass()',
    '(document:keydown.escape)': 'sidebar.openMobile.set(false)',
  },
})
export class Sidebar {
  protected readonly sidebar = inject(SidebarProvider);

  readonly class = input<ClassValue>('');

  readonly side = input<'left' | 'right'>('left');
  readonly variant = input<'sidebar' | 'floating' | 'inset'>('sidebar');
  readonly collapsible = input<'offcanvas' | 'icon' | 'none'>('offcanvas');

  /** The desktop sidebar that collapses; the only mode the data-* styling hooks apply to. */
  protected readonly docked = computed(
    () => this.collapsible() !== 'none' && !this.sidebar.isMobile(),
  );

  private readonly padded = computed(
    () => this.variant() === 'floating' || this.variant() === 'inset',
  );

  protected readonly computedClass = computed(() => {
    if (this.collapsible() === 'none') {
      return cn(
        'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
        this.class(),
      );
    }

    return this.sidebar.isMobile()
      ? 'text-sidebar-foreground'
      : 'group peer hidden text-sidebar-foreground md:block';
  });

  protected readonly mobileClass = computed(() =>
    cn(
      'fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) flex-col bg-sidebar p-0 text-sidebar-foreground shadow-lg transition-transform duration-300 ease-in-out',
      this.side() === 'left' ? 'left-0 border-r' : 'right-0 border-l',
      !this.sidebar.openMobile() &&
        (this.side() === 'left' ? '-translate-x-full' : 'translate-x-full'),
    ),
  );

  protected readonly gapClass = computed(() =>
    cn(
      'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
      'group-data-[collapsible=offcanvas]:w-0',
      'group-data-[side=right]:rotate-180',
      this.padded()
        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
    ),
  );

  protected readonly containerClass = computed(() =>
    cn(
      'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
      this.side() === 'left'
        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
      this.padded()
        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
      this.class(),
    ),
  );
}

import { Component, computed, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { buttonVariants } from '../button';
import { Icon } from '../icon';

import { SidebarProvider } from './sidebar-provider';

@Component({
  selector: 'button[tSidebarTrigger]',
  imports: [Icon],
  template: `
    <svg tIcon name="panel-left" />
    <span class="sr-only">Alternar barra lateral</span>
  `,
  host: {
    'data-slot': 'sidebar-trigger',
    'data-sidebar': 'trigger',
    '[class]': 'computedClass()',
    '(click)': 'sidebar.toggle()',
  },
})
export class SidebarTrigger {
  protected readonly sidebar = inject(SidebarProvider);

  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7', this.class()),
  );
}

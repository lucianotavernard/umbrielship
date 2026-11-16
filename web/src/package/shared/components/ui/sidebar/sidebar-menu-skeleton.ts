import { booleanAttribute, Component, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { Skeleton } from '../skeleton';

@Component({
  selector: 't-sidebar-menu-skeleton',
  imports: [Skeleton],
  template: `
    @if (showIcon()) {
      <t-skeleton class="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
    }
    <t-skeleton
      class="h-4 max-w-(--skeleton-width) flex-1"
      data-sidebar="menu-skeleton-text"
      [style.--skeleton-width]="width"
    />
  `,
  host: {
    'data-slot': 'sidebar-menu-skeleton',
    'data-sidebar': 'menu-skeleton',
    '[class]': 'computedClass()',
  },
})
export class SidebarMenuSkeleton {
  readonly class = input<ClassValue>('');

  readonly showIcon = input(false, { transform: booleanAttribute });

  /** Between 50% and 90%, so a list of skeletons looks like a list of labels. */
  protected readonly width = `${Math.floor(Math.random() * 40) + 50}%`;

  protected readonly computedClass = computed(() =>
    cn('flex h-8 items-center gap-2 rounded-md px-2', this.class()),
  );
}

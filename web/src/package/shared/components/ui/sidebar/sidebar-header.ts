import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-sidebar-header',
  host: {
    'data-slot': 'sidebar-header',
    'data-sidebar': 'header',
    '[class]': 'computedClass()',
  },
})
export class SidebarHeader {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('flex flex-col gap-2 p-2', this.class()));
}

import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-sidebar-group-content',
  host: {
    'data-slot': 'sidebar-group-content',
    'data-sidebar': 'group-content',
    '[class]': 'computedClass()',
  },
})
export class SidebarGroupContent {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('block w-full text-sm', this.class()));
}

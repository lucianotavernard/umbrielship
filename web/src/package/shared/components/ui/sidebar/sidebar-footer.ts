import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-sidebar-footer',
  host: {
    'data-slot': 'sidebar-footer',
    'data-sidebar': 'footer',
    '[class]': 'computedClass()',
  },
})
export class SidebarFooter {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() => cn('flex flex-col gap-2 p-2', this.class()));
}

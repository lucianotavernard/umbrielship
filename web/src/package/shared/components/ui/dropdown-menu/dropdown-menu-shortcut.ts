import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 't-dropdown-menu-shortcut',
  host: {
    'data-slot': 'dropdown-menu-shortcut',
    '[class]': 'computedClass()',
  },
})
export class DropdownMenuShortcut {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn('ml-auto text-xs tracking-widest text-muted-foreground', this.class()),
  );
}

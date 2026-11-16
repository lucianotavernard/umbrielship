import { computed, Directive, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { inputVariants } from '../form/input';

@Directive({
  selector: 'input[tSidebarInput]',
  host: {
    'data-slot': 'sidebar-input',
    'data-sidebar': 'input',
    '[class]': 'computedClass()',
  },
})
export class SidebarInput {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(inputVariants(), 'h-8 w-full bg-background shadow-none', this.class()),
  );
}

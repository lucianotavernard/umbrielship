import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { DropdownMenu } from './dropdown-menu';
import { ITEM_CLASS, releaseItem } from './dropdown-menu-surface';

/** Choosing an item closes the menu; its own `(click)` runs as on any button or link. */
@Directive({
  selector: 'button[tDropdownMenuItem], a[tDropdownMenuItem]',
  host: {
    'data-slot': 'dropdown-menu-item',
    role: 'menuitem',
    tabindex: '-1',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[class]': 'computedClass()',
    '(click)': 'menu.close()',
    '(pointerenter)': 'element.focus()',
    '(pointerleave)': 'release()',
  },
})
export class DropdownMenuItem {
  protected readonly menu = inject(DropdownMenu);
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  readonly variant = input<'default' | 'destructive'>('default');
  readonly inset = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    cn(
      ITEM_CLASS,
      "px-2 py-1.5 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
      this.class(),
    ),
  );

  protected release() {
    releaseItem(this.element);
  }
}

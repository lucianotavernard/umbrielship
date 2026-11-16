import { booleanAttribute, Component, computed, ElementRef, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { Icon } from '../icon';

import { DropdownMenuSub } from './dropdown-menu-sub';
import { ITEM_CLASS } from './dropdown-menu-surface';

@Component({
  selector: 'button[tDropdownMenuSubTrigger]',
  imports: [Icon],
  template: `
    <ng-content />
    <svg tIcon name="chevron-right" class="ml-auto size-4" />
  `,
  host: {
    'data-slot': 'dropdown-menu-sub-trigger',
    role: 'menuitem',
    tabindex: '-1',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'sub.open()',
    '[attr.data-state]': 'sub.open() ? "open" : "closed"',
    '[attr.data-inset]': 'inset() ? "" : null',
    '[style.anchor-name]': 'sub.anchorName',
    '[class]': 'computedClass()',
    '(click)': 'sub.show($event.detail === 0)',
    '(pointerenter)': 'onPointerEnter()',
    '(keydown.arrowRight)': 'onArrowRight($event)',
  },
})
export class DropdownMenuSubTrigger {
  protected readonly sub = inject(DropdownMenuSub);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  readonly inset = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    cn(
      ITEM_CLASS,
      "px-2 py-1.5 data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
      this.class(),
    ),
  );

  constructor() {
    this.sub.trigger = this.element;
  }

  // No pointerleave here: the focus must stay on the trigger while the pointer travels to the submenu.
  protected onPointerEnter() {
    this.element.focus();
    this.sub.show();
  }

  protected onArrowRight(event: Event) {
    event.preventDefault();
    this.sub.show(true);
  }
}

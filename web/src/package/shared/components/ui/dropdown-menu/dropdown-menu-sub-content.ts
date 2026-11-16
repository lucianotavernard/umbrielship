import { computed, Directive, effect, ElementRef, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { DropdownMenuSub } from './dropdown-menu-sub';
import {
  isOwnEvent,
  menuItems,
  navigateMenu,
  POSITION_FALLBACKS,
  positionArea,
  setPopoverOpen,
  sideMargin,
} from './dropdown-menu-surface';

@Directive({
  selector: 't-dropdown-menu-sub-content',
  host: {
    'data-slot': 'dropdown-menu-sub-content',
    popover: 'manual',
    role: 'menu',
    tabindex: '-1',
    'aria-orientation': 'vertical',
    '[attr.data-state]': 'sub.open() ? "open" : "closed"',
    '[style.position-anchor]': 'sub.anchorName',
    '[style.position-area]': 'area',
    '[style.position-try-fallbacks]': 'fallbacks',
    '[style.margin]': 'margin',
    '[class]': 'computedClass()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DropdownMenuSubContent {
  protected readonly sub = inject(DropdownMenuSub);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  protected readonly fallbacks = POSITION_FALLBACKS;
  protected readonly area = positionArea('right', 'start');
  protected readonly margin = sideMargin('right', 4);

  protected readonly computedClass = computed(() =>
    cn(
      'inset-auto min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg outline-hidden data-[state=open]:animate-fade-in',
      this.class(),
    ),
  );

  constructor() {
    let seenRequest = this.sub.focusRequest();

    effect(() => {
      const open = this.sub.open();
      const request = this.sub.focusRequest();

      setPopoverOpen(this.element, open);

      // Opened by hover, the focus stays on the trigger.
      if (open && request !== seenRequest) menuItems(this.element)[0]?.focus();

      seenRequest = request;
    });
  }

  protected onKeydown(event: KeyboardEvent) {
    navigateMenu(this.element, event);

    if (event.key === 'ArrowLeft' && isOwnEvent(this.element, event)) {
      event.preventDefault();
      this.sub.close();
    }
  }
}

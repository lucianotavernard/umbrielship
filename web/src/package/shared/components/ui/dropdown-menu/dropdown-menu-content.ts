import { computed, Directive, effect, ElementRef, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { DropdownMenu } from './dropdown-menu';
import {
  type MenuAlign,
  type MenuSide,
  menuItems,
  navigateMenu,
  POSITION_FALLBACKS,
  positionArea,
  setPopoverOpen,
  sideMargin,
} from './dropdown-menu-surface';

/**
 * The menu panel. It is a manual popover, so it opens in the top layer, above any `overflow` or
 * `z-index` around the trigger, and CSS anchor positioning keeps it next to the trigger.
 */
@Directive({
  selector: 't-dropdown-menu-content',
  host: {
    'data-slot': 'dropdown-menu-content',
    popover: 'manual',
    role: 'menu',
    tabindex: '-1',
    'aria-orientation': 'vertical',
    '[attr.data-state]': 'menu.open() ? "open" : "closed"',
    '[attr.data-side]': 'side()',
    '[style.position-anchor]': 'menu.anchorName',
    '[style.position-area]': 'area()',
    '[style.position-try-fallbacks]': 'fallbacks',
    '[style.margin]': 'margin()',
    '[class]': 'computedClass()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DropdownMenuContent {
  protected readonly menu = inject(DropdownMenu);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  readonly side = input<MenuSide>('bottom');
  readonly align = input<MenuAlign>('start');
  readonly sideOffset = input(4);

  protected readonly fallbacks = POSITION_FALLBACKS;
  protected readonly area = computed(() => positionArea(this.side(), this.align()));
  protected readonly margin = computed(() => sideMargin(this.side(), this.sideOffset()));

  protected readonly computedClass = computed(() =>
    cn(
      // inset-auto undoes the centring a popover gets from the browser.
      'inset-auto max-h-[calc(100dvh-1rem)] min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-fade-in',
      this.class(),
    ),
  );

  constructor() {
    let wasOpen = false;
    let seenRequest = this.menu.focusRequest();

    effect(() => {
      const open = this.menu.open();
      const request = this.menu.focusRequest();

      setPopoverOpen(this.element, open);

      if (open && request !== seenRequest) {
        (menuItems(this.element)[0] ?? this.element).focus();
      } else if (open && !wasOpen) {
        this.element.focus();
      }

      wasOpen = open;
      seenRequest = request;
    });
  }

  protected onKeydown(event: KeyboardEvent) {
    navigateMenu(this.element, event);
  }
}

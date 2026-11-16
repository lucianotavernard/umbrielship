import { Directive, effect, ElementRef, inject, signal } from '@angular/core';

import { DropdownMenu } from './dropdown-menu';

let nextId = 0;

/** Wraps a `[tDropdownMenuSubTrigger]` and its `t-dropdown-menu-sub-content`, and holds the submenu state. */
@Directive({
  selector: 't-dropdown-menu-sub',
  host: {
    'data-slot': 'dropdown-menu-sub',
    class: 'contents',
    '(document:focusin)': 'onFocusIn($event)',
  },
})
export class DropdownMenuSub {
  private readonly menu = inject(DropdownMenu);
  private readonly parent = inject(DropdownMenuSub, { skipSelf: true, optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly open = signal(false);
  readonly anchorName = `--t-dropdown-menu-sub-${nextId++}`;

  /** Bumped when the submenu is opened from the keyboard, which asks its content to focus the first item. */
  readonly focusRequest = signal(0);

  /** Set by `[tDropdownMenuSubTrigger]`; takes the focus back when the submenu closes. */
  trigger: HTMLElement | null = null;

  constructor() {
    // A submenu never outlives the menu it hangs from.
    effect(() => {
      if (!this.menu.open() || this.parent?.open() === false) this.open.set(false);
    });
  }

  show(focusFirst = false) {
    if (focusFirst) this.focusRequest.update((count) => count + 1);
    this.open.set(true);
  }

  close() {
    this.open.set(false);
    this.trigger?.focus();
  }

  /** Hovering or arrowing to another item of the parent menu moves the focus out, which closes the submenu. */
  protected onFocusIn(event: FocusEvent) {
    if (this.open() && event.target instanceof Node && !this.host.contains(event.target)) {
      this.open.set(false);
    }
  }
}

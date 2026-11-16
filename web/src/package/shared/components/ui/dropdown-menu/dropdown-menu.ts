import { Directive, ElementRef, inject, model, signal } from '@angular/core';

let nextId = 0;

/**
 * Holds the open state of one menu. The trigger, the content and the items inject this directive,
 * so they must sit inside a `t-dropdown-menu`.
 */
@Directive({
  selector: 't-dropdown-menu',
  exportAs: 'tDropdownMenu',
  host: {
    'data-slot': 'dropdown-menu',
    // The wrapper takes no box of its own: the trigger lays out as if it were not wrapped.
    class: 'contents',
    '(document:pointerdown)': 'onPointerDown($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class DropdownMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly open = model(false);

  /** Ties the content to the trigger for CSS anchor positioning. */
  readonly anchorName = `--t-dropdown-menu-${nextId++}`;

  /** Bumped when the menu is opened from the keyboard, which asks the content to focus its first item. */
  readonly focusRequest = signal(0);

  /** Set by `[tDropdownMenuTrigger]`; takes the focus back when the menu closes. */
  trigger: HTMLElement | null = null;

  show(focusFirst = false) {
    if (focusFirst) this.focusRequest.update((count) => count + 1);
    this.open.set(true);
  }

  close(restoreFocus = true) {
    if (!this.open()) return;

    this.open.set(false);
    if (restoreFocus) this.trigger?.focus();
  }

  protected onPointerDown(event: Event) {
    // The focus stays where the user pressed.
    if (event.target instanceof Node && !this.host.contains(event.target)) this.close(false);
  }
}

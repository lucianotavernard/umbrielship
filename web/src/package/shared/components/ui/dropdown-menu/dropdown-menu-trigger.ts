import { Directive, ElementRef, inject } from '@angular/core';

import { DropdownMenu } from './dropdown-menu';

@Directive({
  selector: 'button[tDropdownMenuTrigger]',
  host: {
    'data-slot': 'dropdown-menu-trigger',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'menu.open()',
    '[attr.data-state]': 'menu.open() ? "open" : "closed"',
    '[style.anchor-name]': 'menu.anchorName',
    '(click)': 'onClick($event)',
    '(keydown.arrowDown)': 'onArrowDown($event)',
  },
})
export class DropdownMenuTrigger {
  protected readonly menu = inject(DropdownMenu);

  constructor() {
    this.menu.trigger = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }

  protected onClick(event: MouseEvent) {
    if (this.menu.open()) {
      this.menu.close();
    } else {
      // A click with no pointer behind it is Enter or Space.
      this.menu.show(event.detail === 0);
    }
  }

  protected onArrowDown(event: Event) {
    event.preventDefault();
    this.menu.show(true);
  }
}

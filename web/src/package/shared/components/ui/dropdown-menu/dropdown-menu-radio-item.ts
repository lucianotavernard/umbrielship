import { booleanAttribute, Component, computed, ElementRef, inject, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { DropdownMenu } from './dropdown-menu';
import { DropdownMenuRadioGroup } from './dropdown-menu-radio-group';
import { ITEM_CLASS, releaseItem } from './dropdown-menu-surface';

@Component({
  selector: 'button[tDropdownMenuRadioItem]',
  template: `
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      @if (checked()) {
        <span class="size-2 rounded-full bg-current"></span>
      }
    </span>
    <ng-content />
  `,
  host: {
    'data-slot': 'dropdown-menu-radio-item',
    role: 'menuitemradio',
    tabindex: '-1',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[class]': 'computedClass()',
    '(click)': 'choose()',
    '(pointerenter)': 'element.focus()',
    '(pointerleave)': 'release()',
  },
})
export class DropdownMenuRadioItem {
  private readonly menu = inject(DropdownMenu);
  private readonly group = inject(DropdownMenuRadioGroup);
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly checked = computed(() => this.group.value() === this.value());

  protected readonly computedClass = computed(() =>
    cn(ITEM_CLASS, 'py-1.5 pr-2 pl-8', this.class()),
  );

  protected choose() {
    this.group.value.set(this.value());
    this.menu.close();
  }

  protected release() {
    releaseItem(this.element);
  }
}

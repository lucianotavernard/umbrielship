import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { Icon } from '../icon';

import { DropdownMenu } from './dropdown-menu';
import { ITEM_CLASS, releaseItem } from './dropdown-menu-surface';

@Component({
  selector: 'button[tDropdownMenuCheckboxItem]',
  imports: [Icon],
  template: `
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      @if (checked()) {
        <svg tIcon name="check" />
      }
    </span>
    <ng-content />
  `,
  host: {
    'data-slot': 'dropdown-menu-checkbox-item',
    role: 'menuitemcheckbox',
    tabindex: '-1',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[class]': 'computedClass()',
    '(click)': 'toggle()',
    '(pointerenter)': 'element.focus()',
    '(pointerleave)': 'release()',
  },
})
export class DropdownMenuCheckboxItem {
  private readonly menu = inject(DropdownMenu);
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly class = input<ClassValue>('');

  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly computedClass = computed(() =>
    cn(ITEM_CLASS, 'py-1.5 pr-2 pl-8', this.class()),
  );

  protected toggle() {
    this.checked.update((checked) => !checked);
    this.menu.close();
  }

  protected release() {
    releaseItem(this.element);
  }
}

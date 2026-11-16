import { Directive, model } from '@angular/core';

@Directive({
  selector: 't-dropdown-menu-radio-group',
  host: {
    'data-slot': 'dropdown-menu-radio-group',
    role: 'group',
    class: 'block',
  },
})
export class DropdownMenuRadioGroup {
  /** The `value` of the chosen `[tDropdownMenuRadioItem]`. */
  readonly value = model<string>();
}

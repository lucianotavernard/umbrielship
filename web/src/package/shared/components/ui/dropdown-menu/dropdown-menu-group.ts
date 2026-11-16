import { Directive } from '@angular/core';

@Directive({
  selector: 't-dropdown-menu-group',
  host: {
    'data-slot': 'dropdown-menu-group',
    role: 'group',
    class: 'block',
  },
})
export class DropdownMenuGroup {}

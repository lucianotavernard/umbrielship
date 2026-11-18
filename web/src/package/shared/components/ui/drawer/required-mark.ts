import { Component } from '@angular/core';

/** The red `*` after the label of a field the form requires. */
@Component({
  selector: 't-required',
  template: '*',
  host: {
    'data-slot': 'required-mark',
    class: 'text-destructive',
  },
})
export class RequiredMark {}

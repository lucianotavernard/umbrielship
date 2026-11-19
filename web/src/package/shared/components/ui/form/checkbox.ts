import { Directive, computed, input } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

/**
 * A table's checkbox drawn by the app instead of the browser, so its border takes the primary
 * colour: empty with a primary border, filled with a white check when checked and with a white dash
 * while some rows are selected (`indeterminate`). The marks live in `styles.css` (`.t-checkbox`).
 */
@Directive({
  selector: 'input[type="checkbox"][tCheckbox]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Checkbox {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      't-checkbox size-[15px] shrink-0 cursor-pointer appearance-none rounded-[4px] border border-primary bg-card bg-[length:11px_11px] bg-center bg-no-repeat align-middle transition-colors checked:bg-primary indeterminate:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.class(),
    ),
  );
}

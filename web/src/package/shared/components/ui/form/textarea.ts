import { Directive, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { DrawerForm } from '../drawer/drawer-form';

/** The multi-line field of the reference drawer ("Descrição do serviço"). */
@Directive({
  selector: 'textarea[tTextarea]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-invalid]': 'drawerInvalid() || null',
  },
})
export class Textarea {
  readonly class = input<ClassValue>('');

  private readonly drawer = inject(DrawerForm, { optional: true });
  private readonly binding = inject(FormField, { self: true, optional: true });

  /** Inside a drawer the field is red only once the save button was used (AD-057). */
  protected readonly drawerInvalid = computed(() => !!this.drawer?.shown() && !!this.binding?.state().invalid());

  protected readonly computedClass = computed(() =>
    cn(
      'min-h-[75px] w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-[11px] leading-[1.5] shadow-xs outline-none placeholder:text-muted-foreground focus:border-ring/60 focus:ring-[3px] focus:ring-ring/15 dark:bg-input/30',
      this.drawer
        ? this.drawerInvalid() && 'border-destructive text-destructive focus:ring-destructive'
        : '[&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:text-destructive',
      this.class(),
    ),
  );
}

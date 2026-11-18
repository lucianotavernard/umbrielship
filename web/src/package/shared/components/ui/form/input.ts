import { Directive, computed, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';
import { DrawerForm, drawerFieldClass } from '../drawer/drawer-form';

export const inputVariants = cva(
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
  {
    variants: {
      error: {
        auto: '[&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:text-destructive [&.ng-invalid.ng-touched]:focus-visible:ring-destructive',
        true: 'border-destructive text-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: 'input[tInput]',
  host: {
    '[class]': 'computedClass()',
    '[attr.data-invalid]': 'drawerInvalid() || null',
  },
})
export class Input {
  readonly class = input<ClassValue>('');

  readonly error = input<InputVariants['error']>('auto');

  private readonly drawer = inject(DrawerForm, { optional: true });
  private readonly binding = inject(FormField, { self: true, optional: true });

  /** Inside a drawer the field is red only once the save button was used (AD-057). */
  protected readonly drawerInvalid = computed(() => !!this.drawer?.shown() && !!this.binding?.state().invalid());

  protected readonly computedClass = computed(() =>
    cn(
      inputVariants({ error: this.drawer ? (this.drawerInvalid() ? true : null) : this.error() }),
      this.drawer && drawerFieldClass,
      this.class(),
    ),
  );
}

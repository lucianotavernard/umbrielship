import { Directive, computed, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

export const selectVariants = cva(
  'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal text-muted-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50 [&_optgroup]:rounded [&_optgroup]:border [&_optgroup]:border-input [&_optgroup]:bg-transparent [&_optgroup]:p-0.5 [&_optgroup]:dark:bg-input/30 [&_option]:w-full [&_option]:rounded [&_option]:bg-transparent [&_option]:px-2 [&_option]:py-1.5 [&_option]:text-sm [&_option]:text-popover-foreground [&_option]:hover:bg-accent [&_option]:disabled:text-muted-foreground',
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

export type SelectVariants = VariantProps<typeof selectVariants>;

@Directive({
  selector: 'select[tSelect]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Select {
  readonly class = input<ClassValue>('');

  readonly error = input<SelectVariants['error']>('auto');

  protected readonly computedClass = computed(() => cn(selectVariants({ error: this.error() }), this.class()));
}

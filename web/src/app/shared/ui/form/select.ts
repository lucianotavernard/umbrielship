import { Directive, computed, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

export const selectVariants = cva(
  'flex items-center w-full h-9 px-3 rounded-md border font-normal bg-transparent dark:bg-input/30 dark:hover:bg-input/50 border border-input disabled:cursor-not-allowed disabled:opacity-50 flex focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-ring/50 gap-2 items-center justify-between outline-none px-3 py-2 rounded-md shadow-xs text-sm text-muted-foreground [&_optgroup]:bg-transparent [&_optgroup]:dark:bg-input/30 [&_optgroup]:rounded [&_optgroup]:border [&_optgroup]:border-input [&_optgroup]:p-0.5 [&_option]:py-1.5 [&_option]:px-2 [&_option]:rounded [&_option]:bg-transparent [&_option]:text-popover-foreground [&_option]:text-sm [&_option]:w-full [&_option]:hover:bg-accent [&_option]:disabled:text-muted-foreground',
  {
    variants: {
      error: {
        auto: '[&.ng-invalid.ng-touched]:text-destructive [&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:focus-visible:ring-destructive',
        true: 'text-destructive border-destructive focus-visible:ring-destructive',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  }
);

export type selectVariants = VariantProps<typeof selectVariants>;

@Directive({
  selector: 'select',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Select {
  class = input<ClassValue>('');

  error = input<selectVariants['error']>('auto');

  computedClass = computed(() => cn(selectVariants({ error: this.error() }), this.class()));
}
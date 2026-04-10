import { Directive, computed, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

export const inputVariants = cva(
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
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
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;

@Directive({
  selector: 'input',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Input {
  class = input<ClassValue>('');

  error = input<InputVariants['error']>('auto');

  computedClass = computed(() => cn(inputVariants({ error: this.error() }), this.class()));
}

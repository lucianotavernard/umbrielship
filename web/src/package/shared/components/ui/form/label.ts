import { Directive, computed, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

export const labelVariants = cva(
  'text-sm leading-none font-medium [&:has(~input:disabled)]:cursor-not-allowed [&:has(~input:disabled)]:opacity-70 [&:has(~select:disabled)]:cursor-not-allowed [&:has(~select:disabled)]:opacity-70 [&:has(~textarea:disabled)]:cursor-not-allowed [&:has(~textarea:disabled)]:opacity-70',
  {
    variants: {
      error: {
        auto: '[&:has(~input.ng-invalid.ng-touched)]:text-destructive [&:has(~select.ng-invalid.ng-touched)]:text-destructive [&:has(~textarea.ng-invalid.ng-touched)]:text-destructive',
        true: 'text-destructive',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  },
);

export type LabelVariants = VariantProps<typeof labelVariants>;

@Directive({
  selector: 'label[tLabel]',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Label {
  readonly class = input<ClassValue>('');

  readonly error = input<LabelVariants['error']>('auto');

  protected readonly computedClass = computed(() => cn(labelVariants({ error: this.error() }), this.class()));
}

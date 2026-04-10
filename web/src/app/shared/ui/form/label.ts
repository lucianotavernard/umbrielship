import { Directive, computed, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

export const labelVariants = cva(
  'text-sm font-medium leading-none [&>[sterkInput]]:my-1 [&:has(~[sterkInput]:disabled)]:cursor-not-allowed [&:has(~[sterkInput]:disabled)]:opacity-70',
  {
    variants: {
      error: {
        auto: '[&:has(~[sterkInput].ng-invalid.ng-touched)]:text-destructive',
        true: 'text-destructive',
      },
      disabled: {
        auto: '[&:has(~[sterkInput]:disabled)]:opacity-70',
        true: 'opacity-70',
        false: '',
      },
    },
    defaultVariants: {
      error: 'auto',
    },
  },
);
export type LabelVariants = VariantProps<typeof labelVariants>;

@Directive({
  selector: 'label',
  host: {
    '[class]': 'computedClass()',
  },
})
export class Label {
  class = input<ClassValue>('');

  error = input<LabelVariants['error']>('auto');

  computedClass = computed(() => cn(labelVariants({ error: this.error() }), this.class()));
}

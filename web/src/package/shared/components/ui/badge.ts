import { computed, Directive, input } from '@angular/core';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../lib/cn';

export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white dark:bg-destructive/60',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
  selector: 't-badge',
  host: {
    'data-slot': 'badge',
    '[class]': 'computedClass()',
    '[attr.data-variant]': 'variant()',
  },
})
export class Badge {
  readonly class = input<ClassValue>('');

  readonly variant = input<BadgeVariants['variant']>('default');

  protected readonly computedClass = computed(() => cn(badgeVariants({ variant: this.variant() }), this.class()));
}

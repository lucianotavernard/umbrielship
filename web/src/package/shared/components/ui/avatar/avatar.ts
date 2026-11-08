import { Component, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

import { AvatarImage } from './avatar-image';

export const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    variant: {
      sm: 'size-6 text-xs',
      md: 'size-10',
      lg: 'size-14 text-lg',
    },
  },
  defaultVariants: {
    variant: 'md',
  },
});

export type AvatarVariants = VariantProps<typeof avatarVariants>;

@Component({
  selector: 't-avatar',
  template: `
    @if (image()?.loaded()) {
      <ng-content select="img[tAvatarImage]" />
    } @else {
      <ng-content select="t-avatar-fallback" />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'computedClass()',
  },
})
export class Avatar {
  readonly class = input<ClassValue>('');
  readonly variant = input<AvatarVariants['variant']>('md');

  readonly image = contentChild(AvatarImage);

  protected readonly computedClass = computed(() => cn(avatarVariants({ variant: this.variant() }), this.class()));
}
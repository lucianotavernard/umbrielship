import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, contentChild, input } from '@angular/core';

import { type VariantProps, cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

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
  selector: 'avatar',
  template: `
    @if (image()?.loaded()) {
      <ng-content select="img[avatarImage]" />
    } @else {
      <ng-content select="avatar-fallback" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'computedClass()',
  },
})
export class Avatar {
  class = input<ClassValue>('');
  variant = input<AvatarVariants['variant']>('md');

  image = contentChild(AvatarImage);

  computedClass = computed(() => cn(avatarVariants({ variant: this.variant() }), this.class()));
}

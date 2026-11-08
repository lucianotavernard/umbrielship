import { computed, Directive, input } from '@angular/core';

import { type ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: '[tAvatarGroup], t-avatar-group',
  host: {
    'data-slot': 'avatar-group',
    '[class]': 'computedClass()',
  },
})
export class AvatarGroup {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
      this.class(),
    ),
  );
}

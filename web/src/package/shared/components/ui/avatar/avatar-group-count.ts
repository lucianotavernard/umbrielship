import { computed, Directive, input } from '@angular/core';

import { type ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: '[tAvatarGroupCount], t-avatar-group-count',
  host: {
    'data-slot': 'avatar-group-count',
    '[class]': 'computedClass()',
  },
})
export class AvatarGroupCount {
  readonly class = input<ClassValue>('');

  protected readonly computedClass = computed(() =>
    cn(
      'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
      this.class(),
    ),
  );
}

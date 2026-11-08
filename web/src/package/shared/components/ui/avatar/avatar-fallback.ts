import { Component, computed } from '@angular/core';

import { cn } from '../../lib/cn';

@Component({
  selector: 't-avatar-fallback',
  template: `
    <ng-content />
  `,
  host: {
    '[class]': 'computedClass()',
  },
})
export class AvatarFallback {
  computedClass = computed(() =>
    cn('flex size-full items-center justify-center rounded-full bg-popover border border-border'),
  );
}
import { Component, computed } from '@angular/core';

import { cn } from '../../util/cn';

@Component({
  selector: 'avatar-fallback',
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

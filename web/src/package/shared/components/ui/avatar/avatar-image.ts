import { Directive, computed, input, signal } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

@Directive({
  selector: 'img[tAvatarImage]',
  host: {
    '[class]': 'computedClass()',
    '(error)': 'onError()',
    '(load)': 'onLoad()',
  },
})
export class AvatarImage {
  readonly class = input<ClassValue>('');

  readonly loading = signal(false);

  readonly loaded = computed(() => this.loading());

  protected readonly computedClass = computed(() => cn('aspect-square object-cover size-full', this.class()));

  protected onError() {
    this.loading.set(false);
  }

  protected onLoad() {
    this.loading.set(true);
  }
}
import { Directive, computed, input, signal } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../util/cn';

@Directive({
  selector: 'img[avatarImage]',
  host: {
    '[class]': 'computedClass()',
    '(error)': 'onError()',
    '(load)': 'onLoad()',
  },
})
export class AvatarImage {
  class = input<ClassValue>('');

  loading = signal(false);

  loaded = computed(() => this.loading());

  computedClass = computed(() => cn('aspect-square object-cover size-full', this.class()));

  protected onError() {
    this.loading.set(false);
  }

  protected onLoad() {
    this.loading.set(true);
  }
}

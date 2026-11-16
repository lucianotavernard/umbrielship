import { computed, DestroyRef, Directive, inject, input, model, signal } from '@angular/core';

import type { ClassValue } from 'clsx';

import { cn } from '../../lib/cn';

const STORAGE_KEY = '@umbriel:sidebar';
const MOBILE_QUERY = '(max-width: 767px)';
const KEYBOARD_SHORTCUT = 'b';

/**
 * Holds the sidebar state for everything inside it. The pieces (`t-sidebar`, `button[tSidebarTrigger]`,
 * `[tSidebarMenuButton]`...) inject this directive, so they must sit under a `t-sidebar-provider`.
 */
@Directive({
  selector: 't-sidebar-provider',
  host: {
    'data-slot': 'sidebar-wrapper',
    '[style.--sidebar-width]': '"16rem"',
    '[style.--sidebar-width-icon]': '"3rem"',
    '[class]': 'computedClass()',
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class SidebarProvider {
  readonly class = input<ClassValue>('');

  /** Desktop state. Starts from the last choice kept in localStorage; `[(open)]` controls it from outside. */
  readonly open = model(localStorage.getItem(STORAGE_KEY) !== 'false');
  readonly openMobile = signal(false);
  readonly isMobile = signal(false);

  readonly state = computed(() => (this.open() ? 'expanded' : 'collapsed'));

  protected readonly computedClass = computed(() =>
    cn(
      'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
      this.class(),
    ),
  );

  constructor() {
    // jsdom, where the specs run, has no matchMedia.
    if (typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);

    this.isMobile.set(query.matches);
    query.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
  }

  setOpen(open: boolean) {
    this.open.set(open);
    localStorage.setItem(STORAGE_KEY, String(open));
  }

  toggle() {
    if (this.isMobile()) {
      this.openMobile.update((open) => !open);
    } else {
      this.setOpen(!this.open());
    }
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.toggle();
    }
  }
}

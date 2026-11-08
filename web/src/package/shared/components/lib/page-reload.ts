import { InjectionToken } from '@angular/core';

// Reloads the page; a token so specs can watch the reload instead of performing it.
export const PAGE_RELOAD = new InjectionToken<() => void>('PAGE_RELOAD', {
  providedIn: 'root',
  factory: () => () => window.location.reload(),
});

export const THEME_KEY = '@umbriel:theme';

export type Theme = 'light' | 'dark';

/** Paints `root` with `theme` and keeps the choice for the next visit. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function saveTheme(theme: Theme, storage: Storage = localStorage) {
  storage.setItem(THEME_KEY, theme);
}

/**
 * Applies the theme kept in `@umbriel:theme` before the app boots, so a reload keeps the user's
 * choice. With nothing kept, the page keeps the theme `index.html` starts with.
 */
export function restoreTheme(
  storage: Storage = localStorage,
  root: HTMLElement = document.documentElement,
) {
  let saved: string | null = null;
  try {
    saved = storage.getItem(THEME_KEY);
  } catch {
    return;
  }

  if (saved === 'light' || saved === 'dark') applyTheme(saved, root);
}

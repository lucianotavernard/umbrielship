import { restoreTheme, THEME_KEY } from '../theme';

describe('restoreTheme', () => {
  function storage(value: string | null): Storage {
    return { getItem: (key: string) => (key === THEME_KEY ? value : null) } as Storage;
  }

  it('customer-ui C4 applies the saved theme before boot', () => {
    const root = document.createElement('html');
    root.classList.add('dark');

    restoreTheme(storage('light'), root);
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.style.colorScheme).toBe('light');

    restoreTheme(storage('dark'), root);
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.style.colorScheme).toBe('dark');

    // Nothing kept: the theme index.html starts with stays.
    restoreTheme(storage(null), root);
    expect(root.classList.contains('dark')).toBe(true);
  });
});

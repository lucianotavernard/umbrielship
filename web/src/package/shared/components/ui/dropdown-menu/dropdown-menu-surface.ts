/**
 * What `t-dropdown-menu-content` and `t-dropdown-menu-sub-content` share: showing in the top layer,
 * sitting next to their trigger, and moving the focus between their items.
 */

export type MenuSide = 'top' | 'right' | 'bottom' | 'left';
export type MenuAlign = 'start' | 'center' | 'end';

/** Tried in order when the menu would not fit on the chosen side. */
export const POSITION_FALLBACKS = 'flip-block, flip-inline, flip-block flip-inline';

/** jsdom, where the specs run, has no Popover API; there the menu simply stays in the page. */
export function setPopoverOpen(element: HTMLElement, open: boolean) {
  if (typeof element.togglePopover === 'function' && element.isConnected) {
    element.togglePopover(open);
  }
}

/** The CSS `position-area` that puts a menu on `side` of its anchor, lined up by `align`. */
export function positionArea(side: MenuSide, align: MenuAlign) {
  if (align === 'center') return side;

  const vertical = side === 'top' || side === 'bottom';
  const span = vertical
    ? align === 'start'
      ? 'span-right'
      : 'span-left'
    : align === 'start'
      ? 'span-bottom'
      : 'span-top';

  return `${side} ${span}`;
}

/** The gap between the anchor and the menu, as a margin on the edge that faces the anchor. */
export function sideMargin(side: MenuSide, offset: number) {
  const gap = `${offset}px`;

  return {
    bottom: `${gap} 0 0 0`,
    top: `0 0 ${gap} 0`,
    right: `0 0 0 ${gap}`,
    left: `0 ${gap} 0 0`,
  }[side];
}

/** The items of this menu that can take the focus, leaving out the ones of a submenu inside it. */
export function menuItems(menu: HTMLElement) {
  return [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([data-disabled])')].filter(
    (item) => item.closest('[role="menu"]') === menu,
  );
}

/** Whether the event started in this menu and not in a submenu inside it. */
export function isOwnEvent(menu: HTMLElement, event: Event) {
  return event.target instanceof HTMLElement && event.target.closest('[role="menu"]') === menu;
}

/** Arrow keys, Home and End move the focus; Tab stays in the menu. */
export function navigateMenu(menu: HTMLElement, event: KeyboardEvent) {
  if (!isOwnEvent(menu, event)) return;

  if (event.key === 'Tab') {
    event.preventDefault();
    return;
  }

  const items = menuItems(menu);
  const current = items.indexOf(document.activeElement as HTMLElement);
  const last = items.length - 1;

  const target = {
    ArrowDown: items[Math.min(current + 1, last)],
    ArrowUp: items[current === -1 ? last : Math.max(current - 1, 0)],
    Home: items[0],
    End: items[last],
  }[event.key];

  if (target) {
    event.preventDefault();
    target.focus();
  }
}

/** The pointer leaving an item hands the focus back to its menu, so no item stays highlighted. */
export function releaseItem(item: HTMLElement) {
  item.closest<HTMLElement>('[role="menu"]')?.focus();
}

export const ITEM_CLASS =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm text-left text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

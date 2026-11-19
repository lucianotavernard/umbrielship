// The pages of a table that holds every row in the browser: 10 rows at a time (AD-101).

export const PAGE_SIZE = 10;

/** The rows of page `page` (1-based). */
export function pageOf<T>(rows: T[], page: number, size = PAGE_SIZE): T[] {
  return rows.slice((page - 1) * size, page * size);
}

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.ceil(total / size);
}

/** "Exibindo 11–20 de 23", over the rows a search or a filter keeps. */
export function rangeLabel(total: number, page: number, size = PAGE_SIZE) {
  const first = total ? (page - 1) * size + 1 : 0;
  const last = Math.min(page * size, total);
  return { first, last, total };
}

/** The page shown: a write or a filter that empties the last page falls back to the last one left. */
export function clampPage(page: number, total: number, size = PAGE_SIZE): number {
  return Math.min(Math.max(1, page), Math.max(1, pageCount(total, size)));
}

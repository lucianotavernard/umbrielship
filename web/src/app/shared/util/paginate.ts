type Page = number | undefined;

function calculatePageNumber(index: number, currentPage: number, paginationRange: number, totalPages: number) {
  const halfWay = Math.ceil(paginationRange / 2);

  if (index === paginationRange) {
    return totalPages;
  }

  if (index === 1) {
    return index;
  }

  if (paginationRange < totalPages) {
    if (totalPages - halfWay < currentPage) {
      return totalPages - paginationRange + index;
    }

    if (halfWay < currentPage) {
      return currentPage - halfWay + index;
    }

    return index;
  }

  return index;
}

export function generatePagesArray(currentPage: number, itemsPerPage: number, totalItems: number, paginationRange = 7) {
  paginationRange = +paginationRange;
  const pages: Page[] = [];

  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
  const halfWay = Math.ceil(paginationRange / 2);

  const isStart = currentPage <= halfWay;
  const isEnd = totalPages - halfWay < currentPage;
  const isMiddle = !isStart && !isEnd;

  const ellipsesNeeded = paginationRange < totalPages;
  let index = 1;

  while (index <= totalPages && index <= paginationRange) {
    let label: number | undefined = undefined;

    const pageNumber = calculatePageNumber(index, currentPage, paginationRange, totalPages);
    const openingEllipsesNeeded = index === 2 && (isMiddle || isEnd);
    const closingEllipsesNeeded = index === paginationRange - 1 && (isMiddle || isStart);

    if (!(ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded))) {
      label = pageNumber;
    }

    pages.push(label);
    index++;
  }

  return pages;
}

export function outOfBoundCorrection(totalItems: number, itemsPerPage: number, currentPage: number) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages < currentPage && 0 < totalPages) {
    return totalPages;
  }

  if (currentPage < 1) {
    return 1;
  }

  return currentPage;
}

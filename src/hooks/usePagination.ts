import { useState, useMemo } from 'react';

interface UsePaginationOptions<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    totalItems: items.length,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  };
}


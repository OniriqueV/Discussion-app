import { useMemo, useState } from "react";

export type SortOrder = "asc" | "desc";

export type FilterOptions<T> = {
  searchTerm?: string;
  searchFields?: (keyof T)[];
  statusFilter?: string;
  statusField?: keyof T;
  initialSortField?: keyof T | null; // Đổi tên để tránh hiểu nhầm
  initialSortOrder?: SortOrder;
};

export interface PaginationResult<T> {
  paginatedData: T[];
  totalPages: number;
  currentPage: number;
  setPage: (p: number) => void;
  sortField: keyof T | null;
  setSortField: (f: keyof T | null) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;
  filteredData: T[];
}

export function useFilterSortPaginate<T>(
  data: T[],
  pageSize: number,
  {
    searchTerm = "",
    searchFields = [],
    statusFilter = "all",
    statusField,
    initialSortField = null,
    initialSortOrder = "asc",
  }: FilterOptions<T> = {}
): PaginationResult<T> {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<keyof T | null>(initialSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm && searchFields.length > 0) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field =>
          String(item[field]).toLowerCase().includes(lower)
        )
      );
    }

    // Status filter
    if (statusFilter !== "all" && statusField) {
      result = result.filter(item => item[statusField] === statusFilter);
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, searchTerm, searchFields, statusFilter, statusField, sortField, sortOrder]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredData, page, pageSize]);

  return {
    paginatedData,
    totalPages: Math.ceil(filteredData.length / pageSize),
    currentPage: page,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    filteredData
  };
}

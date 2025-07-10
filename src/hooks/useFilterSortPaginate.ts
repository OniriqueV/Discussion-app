import { useMemo, useState } from "react";

export type SortOrder = "asc" | "desc";
export type FilterOptions<T> = {
  searchTerm?: string;
  searchFields?: (keyof T)[];
  statusFilter?: string;
  statusField?: keyof T;
  sortField?: keyof T | null;
  sortOrder?: SortOrder;
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
    sortField = null,
    sortOrder = "asc"
  }: FilterOptions<T>
): PaginationResult<T> {
  const [page, setPage] = useState(0);
  const [currentSortField, setSortField] = useState<typeof sortField>(sortField);
  const [currentSortOrder, setSortOrder] = useState<SortOrder>(sortOrder);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field =>
          String(item[field]).toLowerCase().includes(term)
        )
      );
    }

    // Status filter
    if (statusFilter !== "all" && statusField) {
      result = result.filter(item => item[statusField] === statusFilter);
    }

    // Sorting
    if (currentSortField) {
    result.sort((a, b) => {
        const aVal = a[currentSortField];
        const bVal = b[currentSortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
        return currentSortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return currentSortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    }


    return result;
  }, [data, searchTerm, searchFields, statusFilter, statusField, currentSortField, currentSortOrder]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredData, page, pageSize]);

  return {
    paginatedData,
    totalPages: Math.ceil(filteredData.length / pageSize),
    currentPage: page,
    setPage,
    sortField: currentSortField,
    setSortField,
    sortOrder: currentSortOrder,
    setSortOrder,
    filteredData
  };
}

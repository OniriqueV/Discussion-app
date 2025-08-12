import { useMemo, useState } from "react";

export type SortOrder = "asc" | "desc";

export type FilterOptions<T> = {
  searchTerm?: string;
  searchFields?: string[]; // Support nested fields like 'user.full_name'
  statusFilter?: string;
  statusField?: keyof T;
  initialSortField?: string | null;
  initialSortOrder?: SortOrder;
  customFilter?: (item: T) => boolean; // 👈 Thêm dòng này
};

export interface PaginationResult<T> {
  paginatedData: T[];
  totalPages: number;
  currentPage: number;
  setPage: (p: number) => void;
  sortField: string | null;
  setSortField: (f: string | null) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;
  filteredData: T[];
}

// Helper function to get nested field value
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
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
    customFilter, // 👈 destructure luôn
  }: FilterOptions<T> = {}
): PaginationResult<T> {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string | null>(initialSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm && searchFields.length > 0) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field =>
          String(getNestedValue(item, field)).toLowerCase().includes(lower)
        )
      );
    }

    // Status filter
    if (statusFilter !== "all" && statusField) {
      result = result.filter(item => item[statusField] === statusFilter);
    }

    // Custom filter
    if (customFilter) {
      result = result.filter(customFilter);
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a, sortField);
        const bVal = getNestedValue(b, sortField);

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [
    data,
    searchTerm,
    searchFields,
    statusFilter,
    statusField,
    sortField,
    sortOrder,
    customFilter, // 👈 thêm dependency
  ]);

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
    filteredData,
  };
}

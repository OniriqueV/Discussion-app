"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/mock/companies";
import { useFilterSortPaginate } from "@/hooks/useFilterSortPaginate";
import {
  DEFAULT_PAGE_SIZE,
  MESSAGES,
} from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

interface CompanyTableProps {
  companies: Company[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
}

type SortField = "name" | "status" | "numberOfUsers";
type StatusFilter = "all" | "active" | "inactive";

export default function CompanyTable({
  companies,
  onEdit,
  onDelete,
  onBulkDelete,
}: CompanyTableProps) {
  const router = useRouter();
  const [data, setData] = useState(companies);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState<SortField>("name");

  const {
  paginatedData: paginatedCompanies,
  filteredData,
  totalPages,
  currentPage: page,
  setPage,
} = useFilterSortPaginate(data, DEFAULT_PAGE_SIZE, {
  searchTerm,
  searchFields: ["name", "account"],
  statusFilter,
  statusField: "status",
  initialSortField: sortField,      // ✅ truyền đúng key
  initialSortOrder: sortOrder,      // ✅ truyền đúng key
});


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedCompanies.map((c) => c.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDeleteCompany = (company: Company) => {
    showConfirm(`Bạn có chắc muốn xoá công ty "${company.name}"?`, () => {
      setData((prev) => prev.filter((c) => c.id !== company.id));
      setSelectedIds((prev) => prev.filter((id) => id !== company.id));
      onDelete?.(company.id);
      toast.success(MESSAGES.SUCCESS_DELETE_COMP);
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn(MESSAGES.WARNING_SELECT_USERS);
      return;
    }

    showConfirm(`Bạn có chắc muốn xoá ${selectedIds.length} công ty đã chọn?`, () => {
      setData((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      onBulkDelete?.(selectedIds);
      setSelectedIds([]);
      toast.success(MESSAGES.SUCCESS_BULK_DELETE_COMP);
    });
  };

  const handleEdit = (id: number) => {
    router.push(`/companies/edit/${id}`);
  };

  const handleAdd = () => {
    router.push("/companies/add");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(0);
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 text-xs rounded-full";
    return status === "active"
      ? `${base} bg-green-100 text-green-800`
      : `${base} bg-red-100 text-red-800`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <h2 className="text-xl font-semibold">Danh sách công ty</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm công ty..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thêm công ty
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Xoá đã chọn ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Hiển thị {paginatedCompanies.length} / {filteredData.length} công ty
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 border-b text-left">
                <input
                  type="checkbox"
                  checked={
                    paginatedCompanies.length > 0 &&
                    paginatedCompanies.every((c) => selectedIds.includes(c.id))
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-3 border-b text-left">Tài khoản</th>
              <th
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                Tên công ty {getSortIcon("name")}
              </th>
              <th
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                Trạng thái {getSortIcon("status")}
              </th>
              <th
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("numberOfUsers")}
              >
                Số người dùng {getSortIcon("numberOfUsers")}
              </th>
              <th className="px-3 py-3 border-b text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Không có công ty nào
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 border-b">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td className="px-3 py-3 border-b text-gray-600">{c.account}</td>
                  <td className="px-3 py-3 border-b font-medium">{c.name}</td>
                  <td className="px-3 py-3 border-b">
                    <span className={getStatusBadge(c.status)}>
                      {c.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>
                  <td className="px-3 py-3 border-b">{c.numberOfUsers}</td>
                  <td className="px-3 py-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(c.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(c)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Trang {page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded ${
                  i === page ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmVisible && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={() => {
            onConfirmAction();
            setConfirmVisible(false);
          }}
          onCancel={() => setConfirmVisible(false)}
        />
      )}
    </div>
  );
}

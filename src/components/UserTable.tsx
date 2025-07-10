"use client";

import React, { useState, useMemo } from "react";
import { User } from "@/mock/users";
import { useFilterSortPaginate } from "@/hooks/useFilterSortPaginate";

import { 
  DEFAULT_PAGE_SIZE, 
  STATUS_OPTIONS, 
  FILTER_OPTIONS, 
  MESSAGES 
} from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";

interface UserTableProps {
  users: User[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
}

type SortField = "status" | "name"  | null;
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";

export default function UserTable({ 
  users, 
  onEdit, 
  onDelete, 
  onBulkDelete 
}: UserTableProps) {
  // const [page, setPage] = useState(0);
  const [data, setData] = useState(users);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  // const [sortField, setSortField] = useState<SortField>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(FILTER_OPTIONS.ALL);
  //Logic hiển thị confirm modal
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

    // Hook xử lý lọc, sắp xếp, phân trang
  const {
    paginatedData: paginatedUsers,
    filteredData: filteredAndSortedData,
    totalPages,
    currentPage: page,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  } = useFilterSortPaginate(data, DEFAULT_PAGE_SIZE, {
    searchTerm,
    searchFields: ["name", "email"],
    statusFilter,
    statusField: "status",
    sortField: "name",
    sortOrder: "asc",
  });

  const handleSort = (field: SortField) => {
    if (!field) return;
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  // const handleSort = (field: SortField) => {
  //   if (!field) return;
    
  //   if (sortField === field) {
  //     setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  //   } else {
  //     setSortField(field);
  //     setSortOrder("asc");
  //   }
  // };

  // const filteredAndSortedData = useMemo(() => {
  //   let filtered = [...data];

  //   // Apply search filter
  //   if (searchTerm) {
  //     filtered = filtered.filter(user =>
  //       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       user.email.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }
    

  //   // Apply status filter
  //   if (statusFilter !== FILTER_OPTIONS.ALL) {
  //     filtered = filtered.filter(user => user.status === statusFilter);
  //   }

  //   // Apply sorting
  //   if (sortField) {
  //     filtered.sort((a, b) => {
  //       const valueA = a[sortField];
  //       const valueB = b[sortField];
  //       return sortOrder === "asc"
  //         ? valueA.localeCompare(valueB)
  //         : valueB.localeCompare(valueA);
  //     });
  //   }

  //   return filtered;
  // }, [data, searchTerm, statusFilter, sortField, sortOrder]);

  // const paginatedUsers = filteredAndSortedData.slice(
  //   page * DEFAULT_PAGE_SIZE,
  //   (page + 1) * DEFAULT_PAGE_SIZE
  // );
    

  // const totalPages = Math.ceil(filteredAndSortedData.length / DEFAULT_PAGE_SIZE);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedUsers.map((u) => u.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action); // tránh chạy ngay
    setConfirmVisible(true);
    };

    const handleDelete = (user: User) => {
    showConfirm(`Bạn có chắc muốn xoá ${user.name}?`, () => {
        setData((prev) => prev.filter((u) => u.id !== user.id));
        onDelete?.(user.id);
        toast.success(MESSAGES.SUCCESS_DELETE);
    });
    };

    const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
        toast.warn(MESSAGES.WARNING_SELECT_USERS);
        return;
    }

    showConfirm(`Bạn có chắc muốn xoá ${selectedIds.length} người dùng?`, () => {
        setData((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        onBulkDelete?.(selectedIds);
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE);
    });
    };



 


  const handleStatusToggle = (userId: number) => {
    setData((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
  };


  // Confirm toast component
    const showConfirmDeleteToast = (userName: string, onConfirm: () => void) => {
    const toastId = toast.info(
        ({ closeToast }) => (
        <div>
            <p>Bạn có chắc muốn xoá <b>{userName}</b>?</p>
            <div className="mt-2 flex gap-2">
            <button
                onClick={() => {
                onConfirm();
                toast.dismiss(toastId); // đóng toast sau khi xác nhận
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
                Xoá
            </button>
            <button
                onClick={() => toast.dismiss(toastId)}
                className="px-3 py-1 bg-gray-300 text-black rounded text-sm"
            >
                Huỷ
            </button>
            </div>
        </div>
        ),
        {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        }
    );
    };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    return status === "active"
      ? `${baseClasses} bg-green-100 text-green-800`
      : `${baseClasses} bg-red-100 text-red-800`;
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    const roleColors = {
      admin: "bg-purple-100 text-purple-800",
      ca_user: "bg-blue-100 text-blue-800",
      member: "bg-gray-100 text-gray-800"
    };
    return `${baseClasses} ${roleColors[role as keyof typeof roleColors] || roleColors.member}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(0); // Reset to first page when filtering
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <h2 className="text-xl font-semibold">Danh sách người dùng</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={MESSAGES.SEARCH_PLACEHOLDER}
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={FILTER_OPTIONS.ALL}>Tất cả trạng thái</option>
              <option value={FILTER_OPTIONS.ACTIVE}>Đang hoạt động</option>
              <option value={FILTER_OPTIONS.INACTIVE}>Ngừng hoạt động</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Xoá đã chọn ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Hiển thị {paginatedUsers.length} trong tổng số {filteredAndSortedData.length} người dùng
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 border-b text-left">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    paginatedUsers.every((u) => selectedIds.includes(u.id)) &&
                    paginatedUsers.length > 0
                  }
                  className="rounded"
                />
              </th>
              <th 
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                Tên {getSortIcon("name")}
              </th>
              <th 
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                
              >
                Email 
              </th>
              <th 
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                
              >
                Vai trò 
              </th>
              <th 
                className="px-3 py-3 border-b text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                Trạng thái {getSortIcon("status")}
              </th>
              <th className="px-3 py-3 border-b text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  {MESSAGES.NO_USERS_FOUND}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 border-b">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-3 py-3 border-b font-medium">{user.name}</td>
                  <td className="px-3 py-3 border-b text-gray-600">{user.email}</td>
                  <td className="px-3 py-3 border-b">
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 border-b">
                    <span className={getStatusBadge(user.status)}>
                      {user.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>
                  <td className="px-3 py-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit?.(user.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user.id)}
                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                      >
                        {user.status === "active" ? "Tắt" : "Bật"}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
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
              className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded ${
                  i === page
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
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
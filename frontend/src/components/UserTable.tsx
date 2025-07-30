"use client";

import React, { useState, useEffect } from "react";
import { userService, User } from "@/api/user";
import { useFilterSortPaginate } from "@/hooks/useFilterSortPaginate";
import { getCompanies } from "@/api/companyApi";

import { 
  DEFAULT_PAGE_SIZE, 
  STATUS_OPTIONS, 
  FILTER_OPTIONS, 
  MESSAGES 
} from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

interface UserTableProps {
  onEdit?: (id: number) => void;
  refreshTrigger?: number; // Để trigger refresh từ parent
}

type SortField = "status" | "full_name" | null;
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";

export default function UserTable({ 
  onEdit,
  refreshTrigger = 0
}: UserTableProps) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(FILTER_OPTIONS.ALL);
  const [totalItems, setTotalItems] = useState(0);
  const [companyOptions, setCompanyOptions] = useState<{id: number, name: string}[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);

  

  const currentUser = useCurrentUser();
  const user = currentUser as any;
  const isCaUser = currentUser?.role === 'ca_user';
  


  
  // Logic hiển thị confirm modal
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Hook xử lý lọc, sắp xếp, phân trang - dùng cho local filtering
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
    searchFields: ["full_name", "email"],
    statusFilter,
    statusField: "status",
    initialSortField: "full_name",
    initialSortOrder: "asc",
  });

  // Lấy danh sách công ty khi mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (e) {
        // ignore
      }
    }
    fetchCompanies();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 1000,
      };
      if (!isCaUser && selectedCompanyId) {
        params.company_id = selectedCompanyId;
      }
      const response = await userService.getUsers(params);
      let users = response.data;
      if (isCaUser && user?.company_id) {
        users = users.filter(u => u.company_id === user.company_id);
      }
      setData(users);
      setTotalItems(users.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại fetchUsers khi chọn công ty hoặc refresh
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, selectedCompanyId]);

  const handleSort = (field: SortField) => {
    if (!field) return;
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

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
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDelete = async (user: User) => {
    showConfirm(`Bạn có chắc muốn xoá ${user.full_name}?`, async () => {
      try {
        await userService.deleteUser(user.id);
        setData((prev) => prev.filter((u) => u.id !== user.id));
        setSelectedIds((prev) => prev.filter((id) => id !== user.id));
      } catch (error) {
        // Error toast already shown in service
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.warn(MESSAGES.WARNING_SELECT_USERS);
      return;
    }

    showConfirm(`Bạn có chắc muốn xoá ${selectedIds.length} người dùng?`, async () => {
      try {
        // Delete each user individually since there's no bulk delete endpoint
        await Promise.all(selectedIds.map(id => userService.deleteUser(id)));
        setData((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE);
      } catch (error) {
        toast.error('Có lỗi khi xóa một số người dùng');
      }
    });
  };

  const handleStatusToggle = async (userId: number) => {
    const user = data.find(u => u.id === userId);
    if (!user) return;

    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await userService.updateUser(userId, { status: newStatus });
      
      setData((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
      
      toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
    } catch (error) {
      // Error toast already shown in service
    }
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
    setPage(0);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

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
            <select
              value={isCaUser ? user?.company_id ?? "" : selectedCompanyId ?? ""}
              onChange={e => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCaUser}
            >
              <option value="">Tất cả công ty</option>
              {companyOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
                onClick={() => handleSort("full_name")}
              >
                Tên {getSortIcon("full_name")}
              </th>
              <th className="px-3 py-3 border-b text-left">
                Email 
              </th>
              <th className="px-3 py-3 border-b text-left">
                Vai trò 
              </th>
              <th className="px-3 py-3 border-b text-left">
                Công ty 
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
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
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
                  <td className="px-3 py-3 border-b font-medium">{user.full_name}</td>
                  <td className="px-3 py-3 border-b text-gray-600">{user.email}</td>
                  <td className="px-3 py-3 border-b">
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 border-b text-gray-600">
                    {user.company?.name || 'N/A'}
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
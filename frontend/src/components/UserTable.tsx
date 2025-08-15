"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  refreshTrigger?: number;
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
  const [actionLoading, setActionLoading] = useState<{[key: number]: string}>({});
  const [searchFocused, setSearchFocused] = useState(false);

  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const user = currentUser as any;
  const isCaUser = currentUser?.role === 'ca_user';

  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Filter and sort hook
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

  // Memoized stats
  const stats = useMemo(() => {
    const activeUsers = data.filter(u => u.status === 'active').length;
    const inactiveUsers = data.filter(u => u.status === 'inactive').length;
    const adminUsers = data.filter(u => u.role === 'admin').length;
    const caUsers = data.filter(u => u.role === 'ca_user').length;
    const memberUsers = data.filter(u => u.role === 'member').length;
    
    return { activeUsers, inactiveUsers, adminUsers, caUsers, memberUsers };
  }, [data]);

  // Load companies
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error("Error fetching companies:", e);
      }
    }
    fetchCompanies();
  }, []);

  // Fetch users
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
        setActionLoading(prev => ({ ...prev, [user.id]: 'delete' }));
        await userService.deleteUser(user.id);
        setData((prev) => prev.filter((u) => u.id !== user.id));
        setSelectedIds((prev) => prev.filter((id) => id !== user.id));
        toast.success('Đã xóa người dùng thành công');
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        setActionLoading(prev => {
          const newState = { ...prev };
          delete newState[user.id];
          return newState;
        });
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
      setActionLoading(prev => ({ ...prev, [userId]: 'toggle' }));
      const newStatus = user.status === "active" ? "inactive" : "active";
      await userService.updateUser(userId, { status: newStatus });
      
      setData((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
      
      toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
    } catch (error) {
      console.error('Status toggle error:', error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105";
    return status === "active"
      ? `${baseClasses} bg-emerald-100 text-emerald-800 shadow-sm`
      : `${baseClasses} bg-red-100 text-red-800 shadow-sm`;
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105";
    const roleColors = {
      admin: "bg-purple-100 text-purple-800 shadow-sm",
      ca_user: "bg-blue-100 text-blue-800 shadow-sm",
      member: "bg-gray-100 text-gray-800 shadow-sm"
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(FILTER_OPTIONS.ALL);
    setSelectedCompanyId(undefined);
    setPage(0);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
        <div className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</div>
        <div className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              👥 Quản lý người dùng
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Hoạt động: {stats.activeUsers}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Ngưng hoạt động: {stats.inactiveUsers}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-gray-700">Admin: {stats.adminUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Bộ lọc & Tìm kiếm</h3>
            {(searchTerm || statusFilter !== 'all' || selectedCompanyId) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Enhanced Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 transition-colors duration-200 ${searchFocused ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 ${
                  searchFocused 
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400'
                } focus:outline-none`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 bg-white"
            >
              <option value={FILTER_OPTIONS.ALL}>🔄 Tất cả trạng thái</option>
              <option value={FILTER_OPTIONS.ACTIVE}>✅ Đang hoạt động</option>
              <option value={FILTER_OPTIONS.INACTIVE}>❌ Ngừng hoạt động</option>
            </select>

            {/* Company Filter */}
            <select
              value={isCaUser ? user?.company_id ?? "" : selectedCompanyId ?? ""}
              onChange={e => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 bg-white disabled:bg-gray-50"
              disabled={isCaUser}
            >
              <option value="">🏢 Tất cả công ty</option>
              {companyOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Bulk Actions */}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedIds.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              🗑️ Xoá đã chọn ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="text-sm font-medium text-gray-700">
          Hiển thị <span className="text-blue-600">{paginatedUsers.length}</span> trong tổng số{' '}
          <span className="text-blue-600">{filteredAndSortedData.length}</span> người dùng
        </div>
        {selectedIds.length > 0 && (
          <div className="text-sm font-medium text-orange-600">
            Đã chọn {selectedIds.length} người dùng
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        paginatedUsers.every((u) => selectedIds.includes(u.id)) &&
                        paginatedUsers.length > 0
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={() => handleSort("full_name")}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-semibold text-gray-900">Tên</span>
                    <span className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                      {getSortIcon("full_name")}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-gray-900">Email</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-gray-900">Vai trò</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-gray-900">Công ty</span>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-semibold text-gray-900">Trạng thái</span>
                    <span className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                      {getSortIcon("status")}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-gray-900">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-4xl">🔍</div>
                      <div className="text-gray-500 font-medium">Không tìm thấy người dùng</div>
                      <div className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-blue-50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors duration-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getRoleBadge(user.role)}>
                        {user.role === 'admin' ? '👑 Admin' : 
                         user.role === 'ca_user' ? '🏢 CA User' : '👤 Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{user.company?.name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(user.status)}>
                        {user.status === "active" ? "✅ Hoạt động" : "❌ Ngừng hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onEdit?.(user.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200 hover:underline"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user.id)}
                          disabled={actionLoading[user.id] === 'toggle'}
                          className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors duration-200 hover:underline disabled:opacity-50"
                        >
                          {actionLoading[user.id] === 'toggle' ? '⏳' : user.status === "active" ? "⏸️ Tắt" : "▶️ Bật"}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading[user.id] === 'delete'}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors duration-200 hover:underline disabled:opacity-50"
                        >
                          {actionLoading[user.id] === 'delete' ? '⏳' : '🗑️ Xoá'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-white border border-gray-200 rounded-lg px-6 py-4">
          <div className="text-sm text-gray-700">
            Trang <span className="font-medium">{page + 1}</span> / <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              ← Trước
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-md transition-all duration-200 font-medium ${
                    pageNum === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Sau →
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
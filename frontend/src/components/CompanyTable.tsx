"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/mock/companies";
import { useFilterSortPaginate } from "@/hooks/useFilterSortPaginate";
import { Tooltip } from "react-tooltip";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

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

interface CurrentUser {
  id: number;
  email: string;
  role: 'admin' | 'ca_user' | 'member';
  company_id: number;
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
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();

  type CurrentUser = {
    sub: number | string;
    id: number;
    email: string;
    role: 'admin' | 'ca_user' | 'member';
    company_id?: number;
    full_name: string;
  };

  const user = currentUser as CurrentUser;

  // Sửa lỗi NaN: đảm bảo luôn parse được ID dạng số
  const userId = typeof user?.sub === "number" ? user.sub : parseInt(user?.sub as string, 10);

  // Kiểm tra vai trò
  const isAdmin = user?.role === 'admin';
  const isCaUser = user?.role === 'ca_user';

  // Lọc công ty dựa trên vai trò người dùng
  const visibleCompanies = useMemo(() => {
    if (isAdmin) return companies;

    if (isCaUser && user?.company_id) {
      return companies.filter((company) => company.id === user.company_id);
    }

    return [];
  }, [companies, isAdmin, isCaUser, user]);

  const [data, setData] = useState(visibleCompanies);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    setData(visibleCompanies);
  }, [visibleCompanies]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  const {
    paginatedData: paginatedCompanies,
    filteredData,
    totalPages,
    currentPage: page,
    setPage,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  } = useFilterSortPaginate(data, DEFAULT_PAGE_SIZE, {
    searchTerm,
    searchFields: ["name", "account"],
    statusFilter,
    statusField: "status",
    initialSortField: "name",
    initialSortOrder: "asc",
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return (
      <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return sortOrder === "asc" ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
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
    const base = "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-all duration-200";
    return status === "active"
      ? `${base} bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm`
      : `${base} bg-red-50 text-red-700 border border-red-200 shadow-sm`;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(0);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6 bg-white">
      {/* Header với gradient background */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 -mx-6 -mt-6 px-6 pt-6 pb-4 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Danh sách công ty</h1>
              <p className="text-sm text-gray-600 mt-1">Quản lý thông tin các công ty trong hệ thống</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm công ty
                </button>
                
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xoá ({selectedIds.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search và Filters với animation */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm công ty..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-all duration-200 ${
                showFilters 
                  ? 'border-blue-300 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Bộ lọc
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel với slide animation */}
        <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats và Summary với cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Tổng số công ty</p>
              <p className="text-2xl font-bold text-blue-900">{data.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-900">{data.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hiển thị</p>
              <p className="text-2xl font-bold text-gray-900">{paginatedCompanies.length}/{filteredData.length}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table với improved styling */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={
                        paginatedCompanies.length > 0 &&
                        paginatedCompanies.every((c) => selectedIds.includes(c.id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                    />
                  )}
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Tài khoản
                  </th>
                )}
                <th
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Tên công ty
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {getSortIcon("name")}
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Trạng thái
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {getSortIcon("status")}
                    </div>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
                  onClick={() => handleSort("numberOfUsers")}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    Số người dùng
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {getSortIcon("numberOfUsers")}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-gray-500 font-medium">Không có công ty nào</p>
                      <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo công ty mới</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      {isAdmin && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(() => {
                          const caUsers = Array.isArray(c.users)
                            ? c.users.filter((u) => u.role === "ca_user")
                            : [];

                          if (caUsers.length === 0) return c.account ?? "";

                          const first = caUsers[0]?.email;
                          const remaining = caUsers.length - 1;
                          const tooltipId = `tooltip-${c.id}`;

                          return (
                            <div>
                              <span data-tooltip-id={tooltipId} className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                                {first}
                                {remaining > 0 && (
                                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    +{remaining}
                                  </span>
                                )}
                              </span>
                              <Tooltip id={tooltipId} place="top">
                                <div className="text-sm text-left whitespace-pre-line">
                                  {caUsers.map((u) => u.email).join("\n")}
                                </div>
                              </Tooltip>
                            </div>
                          );
                        })()}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        {c.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(c.status)}>
                        {c.status === "active" ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Ngừng hoạt động
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium">{c.numberOfUsers}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-500">{c.maxUsers}</span>
                        <div className="ml-3 w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              (c.numberOfUsers / c.maxUsers) > 0.8 
                                ? 'bg-red-400' 
                                : (c.numberOfUsers / c.maxUsers) > 0.6 
                                  ? 'bg-yellow-400' 
                                  : 'bg-green-400'
                            }`}
                            style={{width: `${(c.numberOfUsers / c.maxUsers) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(c.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCompany(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xoá
                          </button>
                        )}
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
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{page * DEFAULT_PAGE_SIZE + 1}</span> đến{' '}
                <span className="font-medium">
                  {Math.min((page + 1) * DEFAULT_PAGE_SIZE, filteredData.length)}
                </span>{' '}
                trong tổng số <span className="font-medium">{filteredData.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="sr-only">Trang trước</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i;
                  } else if (page <= 2) {
                    pageNumber = i;
                  } else if (page >= totalPages - 3) {
                    pageNumber = totalPages - 5 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
                        pageNumber === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="sr-only">Trang sau</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Confirm Modal */}
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
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import { Tag, tagApi } from "@/api/tag";

// --- Main component ---
export default function TagTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "postCount" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const res = await tagApi.findAll();
        setTags(res.data);
      } catch (err) {
        toast.error("Không thể tải danh sách tag");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);
  
  const filteredSorted = useMemo(() => {
    let filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

    filtered.sort((a, b) => {
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tags, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredSorted.length / DEFAULT_PAGE_SIZE);
  const paginatedTags = filteredSorted.slice(
    page * DEFAULT_PAGE_SIZE,
    (page + 1) * DEFAULT_PAGE_SIZE
  );

  const toggleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: typeof sortKey) => {
    if (sortKey !== key) return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = paginatedTags.map((t) => t.id);
    const allSelected = currentIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleDelete = (tag: Tag) => {
    setConfirmMessage(`Bạn có chắc muốn xoá tag "${tag.name}"?`);
    setOnConfirmAction(() => async () => {
      try {
        await tagApi.delete(tag.slug);
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
        setSelectedIds((prev) => prev.filter((id) => id !== tag.id));
        toast.success(MESSAGES.SUCCESS_DELETE_TAG);
      } catch (error) {
        toast.error("Xoá tag thất bại");
      }
    });
    setConfirmVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một tag để xoá.");
      return;
    }

    setConfirmMessage(`Bạn có chắc muốn xoá ${selectedIds.length} tag đã chọn?`);
    setOnConfirmAction(() => async () => {
      try {
        await tagApi.bulkDelete({ slugs: tags.filter(t => selectedIds.includes(t.id)).map(t => t.slug) });
        setTags((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE_TAG);
      } catch (error) {
        toast.error("Xoá hàng loạt thất bại");
      }
    });
    setConfirmVisible(true);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên tag..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(0);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedIds.length} đã chọn
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Bỏ chọn
                </button>
              </div>
            )}
            
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xoá đã chọn
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <span>Tổng cộng: <span className="font-semibold text-gray-900">{filteredSorted.length}</span> tag</span>
          {search && (
            <span>Kết quả tìm kiếm: <span className="font-semibold text-blue-600">{filteredSorted.length}</span></span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={paginatedTags.length > 0 && paginatedTags.every((t) => selectedIds.includes(t.id))}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-2">
                  <span>Tên Tag</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => toggleSort("postCount")}
              >
                <div className="flex items-center gap-2">
                  <span>Số bài viết</span>
                  {getSortIcon("postCount")}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => toggleSort("created_at")}
              >
                <div className="flex items-center gap-2">
                  <span>Ngày tạo</span>
                  {getSortIcon("created_at")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="text-gray-500 font-medium">Không có tag nào</p>
                      {search && (
                        <p className="text-sm text-gray-400 mt-1">
                          Thử tìm kiếm với từ khóa khác hoặc{" "}
                          <button 
                            onClick={() => setSearch("")}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            xoá bộ lọc
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTags.map((tag, index) => (
                <tr 
                  key={tag.id} 
                  className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(tag.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tag.id)}
                      onChange={() => toggleSelect(tag.id)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {tag.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                        <div className="text-xs text-gray-500">/{tag.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {tag.postCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(tag.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(tag.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/tags/edit/${tag.slug}`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Sửa
                      </Link>
                      <button 
                        onClick={() => handleDelete(tag)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-medium">{page * DEFAULT_PAGE_SIZE + 1}</span> đến{" "}
              <span className="font-medium">{Math.min((page + 1) * DEFAULT_PAGE_SIZE, filteredSorted.length)}</span> trong tổng số{" "}
              <span className="font-medium">{filteredSorted.length}</span> kết quả
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(0, page - 1))} 
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <div className="sm:hidden">
                <span className="px-3 py-2 text-sm text-gray-500">
                  {page + 1} / {totalPages}
                </span>
              </div>

              <button 
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))} 
                disabled={page === totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
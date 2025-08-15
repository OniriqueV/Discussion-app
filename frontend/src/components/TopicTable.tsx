"use client";
import { Topic, topicApi } from "@/api/topic";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

type SortKey = "name" | "postCount" | "created_at";

export default function TopicTable() {
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Check authentication and permissions
  const hasPermission = currentUser && (currentUser.role === 'admin' || currentUser.role === 'ca_user');

  useEffect(() => {
    if (!userLoading && !hasPermission) {
      toast.error("Bạn không có quyền truy cập trang này");
      return;
    }
  }, [currentUser, userLoading, hasPermission]);

  // Load data from API
  useEffect(() => {
    if (hasPermission) {
      loadTopics();
    }
  }, [hasPermission]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApi.findAll();
      if (response.success) {
        setData(response.data);
      } else {
        toast.error("Không thể tải danh sách topics");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách topics");
      console.error("Error loading topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSorted = useMemo(() => {
    let filtered = data.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortKey) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "postCount":
          aVal = a._count?.posts || 0;
          bVal = b._count?.posts || 0;
          break;
        case "created_at":
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        default:
          aVal = a.created_at;
          bVal = b.created_at;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredSorted.length / DEFAULT_PAGE_SIZE);
  const paginatedTopics = filteredSorted.slice(
    page * DEFAULT_PAGE_SIZE,
    (page + 1) * DEFAULT_PAGE_SIZE
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return (
      <span className="inline-block w-4 h-4 ml-1 opacity-30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
          <path d="M7 14l5-5 5 5" />
        </svg>
      </span>
    );
    return sortOrder === "asc" ? (
      <span className="inline-block w-4 h-4 ml-1 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 14l5-5 5 5" />
        </svg>
      </span>
    ) : (
      <span className="inline-block w-4 h-4 ml-1 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
        </svg>
      </span>
    );
  };

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]
    );
  };

  const toggleSelectAll = () => {
    const currentSlugs = paginatedTopics.map((t) => t.slug);
    const allSelected = currentSlugs.every((slug) => selectedSlugs.includes(slug));

    if (allSelected) {
      setSelectedSlugs((prev) => prev.filter((slug) => !currentSlugs.includes(slug)));
    } else {
      setSelectedSlugs((prev) => [...new Set([...prev, ...currentSlugs])]);
    }
  };

  const handleDelete = (topic: Topic) => {
    setConfirmMessage(`Bạn có chắc muốn xoá topic "${topic.name}"?`);
    setOnConfirmAction(() => async () => {
      try {
        setDeleteLoading(topic.slug);
        const response = await topicApi.delete(topic.slug);
        if (response.success) {
          setData((prev) => prev.filter((t) => t.slug !== topic.slug));
          setSelectedSlugs((prev) => prev.filter((slug) => slug !== topic.slug));
          toast.success(MESSAGES.SUCCESS_DELETE_TOPIC || "Xóa topic thành công");
        }
      } catch (error) {
        toast.error("Lỗi khi xóa topic");
        console.error("Error deleting topic:", error);
      } finally {
        setDeleteLoading(null);
      }
    });
    setConfirmVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedSlugs.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một topic để xoá.");
      return;
    }

    setConfirmMessage(`Bạn có chắc muốn xoá ${selectedSlugs.length} topic đã chọn?`);
    setOnConfirmAction(() => async () => {
      try {
        const response = await topicApi.bulkDelete({ slugs: selectedSlugs });
        if (response.success) {
          setData((prev) => prev.filter((t) => !selectedSlugs.includes(t.slug)));
          setSelectedSlugs([]);
          toast.success(MESSAGES.SUCCESS_BULK_DELETE_TOPIC || "Xóa topics thành công");
        }
      } catch (error) {
        toast.error("Lỗi khi xóa topics");
        console.error("Error bulk deleting topics:", error);
      }
    });
    setConfirmVisible(true);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(0);
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!hasPermission) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Không có quyền truy cập</h3>
          <p className="text-red-600 mb-1">Bạn không có quyền truy cập trang này</p>
          <p className="text-sm text-red-500">Chỉ admin và ca_user mới có thể quản lý topics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Đang tải danh sách topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with enhanced styling */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên topic..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              {selectedSlugs.length > 0 && (
                <span className="font-medium text-blue-600">{selectedSlugs.length} đã chọn</span>
              )}
              {selectedSlugs.length === 0 && (
                <span>{filteredSorted.length} topics</span>
              )}
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedSlugs.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xoá đã chọn ({selectedSlugs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedTopics.length > 0 &&
                      paginatedTopics.every((t) => selectedSlugs.includes(t.slug))
                    }
                    onChange={toggleSelectAll}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-150 select-none"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Tên Topic
                    {getSortIcon("name")}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-150 select-none"
                  onClick={() => toggleSort("postCount")}
                >
                  <div className="flex items-center">
                    Số bài viết
                    {getSortIcon("postCount")}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-150 select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  <div className="flex items-center">
                    Ngày tạo
                    {getSortIcon("created_at")}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTopics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Không có topic nào</h3>
                        <p className="text-gray-500 mt-1">
                          {search ? `Không tìm thấy topic nào với từ khóa "${search}"` : "Chưa có topic nào được tạo"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTopics.map((topic, index) => (
                  <tr 
                    key={topic.id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      selectedSlugs.includes(topic.slug) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(topic.slug)}
                        onChange={() => toggleSelect(topic.slug)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{topic.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {topic._count?.posts || 0} bài
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(topic.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/topics/edit/${topic.slug}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(topic)}
                          disabled={deleteLoading === topic.slug}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === topic.slug ? (
                            <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-red-700 border-t-transparent"></div>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
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

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị {page * DEFAULT_PAGE_SIZE + 1} - {Math.min((page + 1) * DEFAULT_PAGE_SIZE, filteredSorted.length)} trong tổng số {filteredSorted.length} topics
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Đầu
                </button>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Trước
                </button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-150 ${
                          pageNum === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Sau
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Cuối
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
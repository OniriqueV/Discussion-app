"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/api/postApi";
import { getPosts, deletePost, updatePostStatus, togglePinPost } from "@/api/postApi";
import { DEFAULT_PAGE_SIZE, MESSAGES } from "@/config/constants";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import { useFilterSortPaginate, SortOrder } from "@/hooks/useFilterSortPaginate";

type SortField = "title" | "user.full_name" | "status" | "created_at";
interface PostTableProps {
  showDeletedOnly?: boolean;
  readOnly?: boolean;
  companyId?: number;
}

export default function PostTable({
  showDeletedOnly = false,
  readOnly = false,
  companyId,
}: PostTableProps) {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Use the filter/sort/paginate hook
  const {
  paginatedData: posts,
  totalPages,
  currentPage,
  setPage,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  filteredData
} = useFilterSortPaginate(allPosts, DEFAULT_PAGE_SIZE, {
  searchTerm,
  searchFields: ["title", "user.full_name"],
  initialSortField: "created_at",
  initialSortOrder: "desc"
});


  // Fetch all posts from API (without pagination since we handle it frontend)
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts({
        page: 1,
        limit: 1000, // Fetch more posts to handle frontend pagination
        include_deleted: showDeletedOnly ? true : undefined,
        company_id: companyId || undefined,
      });

      setAllPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Vui lòng đăng nhập để xem danh sách bài viết");
      router.push("/login");
      return;
    }
  }, [currentUser, userLoading, router]);

  // Load posts on component mount
  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchPosts();
    }
  }, [currentUser, userLoading, showDeletedOnly, companyId]);

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, setPage]);

  const handleSort = (field: string) => {
    const sortKey = field as keyof Post;
    if (sortField === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(sortKey);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    const sortKey = field as keyof Post;
    if (sortField !== sortKey) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentIds = posts.map((p) => p.id.toString());
    const allSelected = currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIds);
    }
  };

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDelete = async (id: number) => {
    showConfirm("Bạn có chắc muốn xoá bài viết này?", async () => {
      try {
        await deletePost(id);
        toast.success(MESSAGES.SUCCESS_DELETE_POST || "Xoá bài viết thành công");
        setSelectedIds((prev) => prev.filter((x) => x !== id.toString()));
        fetchPosts(); // Refresh the list
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Lỗi khi xoá bài viết");
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warn(MESSAGES.WARNING_SELECT_USERS || "Chọn bài viết để xoá");
      return;
    }
    showConfirm(`Xoá ${selectedIds.length} bài viết đã chọn?`, async () => {
      try {
        await Promise.all(selectedIds.map(id => deletePost(parseInt(id))));
        setSelectedIds([]);
        toast.success(MESSAGES.SUCCESS_BULK_DELETE_POST || "Xoá hàng loạt thành công");
        fetchPosts(); // Refresh the list
      } catch (error) {
        console.error("Error bulk deleting posts:", error);
        toast.error("Lỗi khi xoá hàng loạt");
      }
    });
  };

  const handleTogglePin = async (id: number) => {
    try {
      await togglePinPost(id);
      toast.success("Cập nhật trạng thái ghim thành công");
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Lỗi khi cập nhật trạng thái ghim");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updatePostStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Permission check functions
  const canEdit = (post: Post) => {
    // console.log('currentUser.id:', currentUser?.id, 'post.user_id:', post.user_id);
    return currentUser?.id === post.user_id;
  };

  const canDelete = (post: Post) => {
    return currentUser?.role === 'admin' || 
           (currentUser?.role === 'ca_user' && currentUser?.company_id === post.company_id);
  };

  const canPin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
  };

  const canChangeStatus = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'ca_user';
  };

  const handleAdd = () => router.push("/posts/add");
  const handleEdit = (id: number) => router.push(`/posts/edit/${id}`);
  const handleView = (id: number) => router.push(`/posts/detail/${id}`);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'not_resolved': 'Chưa giải quyết',
      'resolved': 'Đã giải quyết',
      'deleted_by_admin': 'Xóa bởi Admin',
      'deleted_by_company': 'Xóa bởi Công ty'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'not_resolved': 'bg-red-100 text-red-800',
      'resolved': 'bg-green-100 text-green-800',
      'deleted_by_admin': 'bg-gray-100 text-gray-800',
      'deleted_by_company': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get nested property value for sorting
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem danh sách bài viết</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Xin chào, {currentUser.full_name} ({currentUser.role})
          </p>
        </div>
        <div className="flex gap-2">
          {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
            <button
              onClick={() => router.push("/posts/deleted")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Bài viết đã xoá
            </button>
          )}
          <button
            onClick={() => router.push("/posts/mypost")}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Bài viết của tôi
          </button>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thêm bài viết
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Xoá đã chọn ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Hiển thị {posts.length} / {filteredData.length} bài viết
        {searchTerm && ` (từ ${allPosts.length} tổng cộng)`}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border-b text-left">
                {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
                  <input
                    type="checkbox"
                    checked={posts.length > 0 && posts.every((p) => selectedIds.includes(p.id.toString()))}
                    onChange={toggleSelectAll}
                  />
                )}
              </th>
              <th
                className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
                onClick={() => handleSort("title")}
              >
                Tiêu đề {getSortIcon("title")}
              </th>
              <th
                className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
                onClick={() => handleSort("user.full_name")}
              >
                Tác giả {getSortIcon("user.full_name")}
              </th>
              <th className="px-3 py-2 border-b text-left">Chủ đề</th>
              <th
                className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                Trạng thái {getSortIcon("status")}
              </th>
              <th className="px-3 py-2 border-b text-left">Tags</th>
              <th className="px-3 py-2 border-b text-left">Lượt xem</th>
              <th
                className="px-3 py-2 border-b cursor-pointer text-left hover:bg-gray-100"
                onClick={() => handleSort("created_at")}
              >
                Ngày tạo {getSortIcon("created_at")}
              </th>
              {!readOnly && (
                <th className="px-3 py-2 border-b">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={currentUser?.role === 'admin' || currentUser?.role === 'ca_user' ? 9 : 8} className="text-center py-6 text-gray-500">
                  {searchTerm ? "Không tìm thấy bài viết nào" : "Không có bài viết nào"}
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">
                    {(currentUser?.role === 'admin' || currentUser?.role === 'ca_user') && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(post.id.toString())}
                        onChange={() => toggleSelect(post.id.toString())}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <span className="text-blue-600 text-xs">📌</span>
                      )}
                      <span className="font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 border-b">
                    {post.user?.full_name || 'N/A'}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {post.topic?.name || 'N/A'}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                      {getStatusDisplay(post.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b">
                    {post.tags?.map(tag => tag.name).join(", ") || 'N/A'}
                  </td>
                  <td className="px-3 py-2 border-b">{post.views}</td>
                  <td className="px-3 py-2 border-b">
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(post.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Xem
                        </button>
                        {canEdit(post) && (
                          <button
                            onClick={() => handleEdit(post.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Sửa
                          </button>
                        )}
                        {canPin() && (
                          <button
                            onClick={() => handleTogglePin(post.id)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            {post.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                          </button>
                        )}
                        {canDelete(post) && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Xoá
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    pageNum === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
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
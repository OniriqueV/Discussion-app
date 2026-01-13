"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/api/postApi";
import { getPosts } from "@/api/postApi";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
import { Eye, MessageCircle, ThumbsUp, Calendar, User } from "lucide-react";

type SortField = "title" | "user.full_name" | "status" | "created_at";

export default function PublicPostList() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts({
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
        search: searchTerm || undefined,
        status: 'problem', // Only show active posts
      });
      
      setPosts(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalItems(response.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount and when dependencies change
  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchPosts();
      } else {
        setCurrentPage(1); // Reset to first page on search
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const handleView = (id: number) => router.push(`/posts/detail/${id}`);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'problem': 'Chưa giải quyết',
      'solve': 'Đã giải quyết',
      'reject_by_admin': 'Từ chối bởi Admin',
      'reject_by_company': 'Từ chối bởi Công ty'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'problem': 'bg-red-100 text-red-800',
      'solve': 'bg-green-100 text-green-800',
      'reject_by_admin': 'bg-gray-100 text-gray-800',
      'reject_by_company': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (userLoading || loading) {
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
          <h2 className="text-xl font-semibold">Danh sách bài viết</h2>
          <p className="text-sm text-gray-600">
            {currentUser ? `Xin chào, ${currentUser.full_name}` : 'Vui lòng đăng nhập để tương tác'}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          {currentUser && (
            <button
              onClick={() => router.push("/posts/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tạo bài viết
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Hiển thị {posts.length} / {totalItems} bài viết
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Không có bài viết nào</p>
            {currentUser && (
              <button
                onClick={() => router.push("/posts/add")}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Tạo bài viết đầu tiên
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.is_pinned && (
                      <span className="text-blue-600 text-sm">📌</span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                  </div>
                  <div className="text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.description }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.user?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count || 0} bình luận</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                  {getStatusDisplay(post.status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.tags?.map(tag => (
                    <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleView(post.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    pageNum === currentPage ? "bg-blue-600 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:bg-gray-100 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/api/postApi";
import { getPosts, deletePost } from "@/api/postApi";
import { DEFAULT_PAGE_SIZE } from "@/config/constants";
import ConfirmModal from "./ConfirmModal";
import { toast } from "react-toastify";
import { useCurrentUser } from "@/hooks/useAuthRedirect";

export default function MyPostList() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  // Fetch user's posts
  const fetchMyPosts = async (page: number = 1, append: boolean = false) => {
    if (!currentUser) return;

    try {
      setLoading(page === 1);
      
      // First, try to get all posts and filter client-side for simplicity
      // In a production app, you'd want a dedicated API endpoint for user's posts
      const response = await getPosts({
        page,
        limit: 50, // Increase limit to get more posts for filtering
      });
      
      const allPosts: Post[] = response.data || [];

    const myPosts = allPosts.filter((post: Post) =>
    post.user_id === currentUser.id ||
    (post.user && post.user.id === currentUser.id)
    );
      
      if (append) {
        // For append, add only new posts that aren't already in the list
        const existingIds = new Set(posts.map(p => p.id));
        const newPosts = myPosts.filter(post => !existingIds.has(post.id));
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(myPosts);
      }
      
      // Check if there are more posts to load based on the original response
      const totalPages = response.meta?.totalPages || 1;
      setHasMore(page < totalPages);
      
    } catch (error) {
      console.error("Error fetching my posts:", error);
      toast.error("Lỗi khi tải danh sách bài viết của bạn");
      if (!append) setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast.error("Vui lòng đăng nhập để xem bài viết của bạn");
      router.push("/login");
      return;
    }
  }, [currentUser, userLoading, router]);

  // Load posts on component mount
  useEffect(() => {
    if (!userLoading && currentUser) {
      fetchMyPosts(1);
    }
  }, [currentUser, userLoading]);

  // Load more posts (infinite scroll)
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMyPosts(nextPage, true);
    }
  };

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, currentPage]);

  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const handleDelete = async (id: number) => {
    showConfirm("Bạn có chắc muốn xoá bài viết này?", async () => {
      try {
        await deletePost(id);
        toast.success("Xoá bài viết thành công");
        // Remove the deleted post from the list
        setPosts(prev => prev.filter(post => post.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Lỗi khi xoá bài viết");
      }
    });
  };

  const handleView = (id: number) => router.push(`/posts/detail/${id}`);
  const handleEdit = (id: number) => router.push(`/posts/edit/${id}`);

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
      'not_resolved': 'bg-red-100 text-red-800 border-red-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'deleted_by_admin': 'bg-gray-100 text-gray-800 border-gray-200',
      'deleted_by_company': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem bài viết của bạn</p>
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

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải bài viết của bạn...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div>
    <button
      onClick={() => router.back()}
      className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md inline-flex items-center"
    >
      ← Quay lại
    </button>
  </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tổng số bài viết:</span> {posts.length}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Cuộn xuống để tải thêm bài viết
        </p>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Bạn chưa có bài viết nào</p>
          <button
            onClick={() => router.push("/posts/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo bài viết đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Post header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && (
                        <span className="text-blue-600 text-sm">📌</span>
                      )}
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      
                      {post.topic?.name && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {post.topic.name}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views} lượt xem
                      </span>
                    </div>

                    {/* Status and Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(post.status)}`}>
                        {getStatusDisplay(post.status)}
                      </span>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              #{tag.name}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content preview */}
                    {post.title && (
                      <div className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.title.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(post.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem
                  </button>
                  
                  <button
                    onClick={() => handleEdit(post.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Sửa
                  </button>
                  
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xoá
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  Cập nhật: {new Date(post.updated_at || post.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading more indicator */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang tải thêm...</span>
        </div>
      )}

      {/* No more posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Đã hiển thị tất cả bài viết của bạn</p>
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
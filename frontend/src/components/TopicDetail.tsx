"use client";
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  MessageCircle, 
  Tag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  FileText,
  Filter,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Pin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getPosts, Post, QueryPostParams } from '@/api/postApi';
import { topicApi, Topic } from '@/api/topic';
import { toast } from 'react-toastify';

interface TopicDetailProps {
  topicId: string;
}

interface FilterState {
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topicId }) => {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 12
  });

  const itemsPerPage = 12;

  // Load topic and posts
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        setLoading(true);
        
        // Load topic info
        const topicResponse = await topicApi.findBySlug(topicId);
        if (topicResponse.success) {
          setTopic(topicResponse.data);
          
          // Load posts for this topic
          const postsResponse = await getPosts({ 
            topic_id: parseInt(topicResponse.data.id),
            page: 1,
            limit: itemsPerPage,
            sort_by: filters.sortBy,
            sort_order: filters.sortOrder
          });
          
          if (postsResponse.data) {
            setPosts(postsResponse.data);
            setFilteredPosts(postsResponse.data);
            setPagination({
              total: postsResponse.total || 0,
              totalPages: postsResponse.totalPages || 1,
              currentPage: postsResponse.page || 1,
              limit: postsResponse.limit || itemsPerPage
            });
          }
        } else {
          toast.error("Không tìm thấy chủ đề");
        }
      } catch (error) {
        console.error("Error loading topic data:", error);
        toast.error("Lỗi khi tải dữ liệu chủ đề");
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };

    if (topicId) {
      loadTopicData();
    }
  }, [topicId, filters.sortBy, filters.sortOrder]);

  // Search and filter posts
  useEffect(() => {
    const searchAndFilterPosts = async () => {
      if (!topic) return;
      
      try {
        setPostsLoading(true);
        
        const params: QueryPostParams = {
          topic_id: parseInt(topic.id),
          page: 1,
          limit: itemsPerPage,
          sort_by: filters.sortBy,
          sort_order: filters.sortOrder
        };

        if (searchTerm.trim()) {
          params.search = searchTerm;
        }

        if (filters.status !== 'all') {
          params.status = filters.status;
        }

        const response = await getPosts(params);
        if (response.data) {
          setFilteredPosts(response.data);
          setPagination({
            total: response.total || 0,
            totalPages: response.totalPages || 1,
            currentPage: 1,
            limit: response.limit || itemsPerPage
          });
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error filtering posts:", error);
        setFilteredPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchAndFilterPosts, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters, topic]);

  // Handle pagination
  const handlePageChange = async (newPage: number) => {
    if (!topic) return;
    
    try {
      setPostsLoading(true);
      const params: QueryPostParams = { 
        topic_id: parseInt(topic.id),
        page: newPage, 
        limit: itemsPerPage,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await getPosts(params);
      if (response.data) {
        setFilteredPosts(response.data);
        setPagination({
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.page || newPage,
          limit: response.limit || itemsPerPage
        });
        setCurrentPage(newPage);
      }
    } catch (error) {
      console.error("Error loading page:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Calculate statistics
  const resolvedPosts = posts.filter(post => post.status === "solve").length;
  const unresolvedPosts = posts.filter(post => post.status === "problem").length;
  const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solve": return "text-green-600 bg-green-100";
      case "problem": return "text-red-600 bg-red-100";
      case "reject_by_admin_or_company_acc": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'problem': 'Chưa giải quyết',
      'solve': 'Đã giải quyết',
      'reject_by_admin_or_company_acc': 'Bị từ chối'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 rounded-2xl h-32 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chủ đề</h1>
            <p className="text-gray-600 mb-4">Chủ đề bạn tìm kiếm không tồn tại.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb and Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Chủ đề: {topic.name}</span>
          </nav>
        </div>

        {/* Topic Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{topic.name}</h1>
                <p className="text-blue-100 text-lg">
                  Khám phá tất cả bài viết trong chủ đề này
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  Được tạo vào {new Date(topic.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FileText className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng bài viết</dt>
                  <dd className="text-lg font-medium text-gray-900">{posts.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Đã giải quyết</dt>
                  <dd className="text-lg font-medium text-gray-900">{resolvedPosts}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Chờ xử lý</dt>
                  <dd className="text-lg font-medium text-gray-900">{unresolvedPosts}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng bình luận</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalComments}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="problem">Chưa giải quyết</option>
                <option value="solve">Đã giải quyết</option>
                <option value="reject_by_admin_or_company_acc">Bị từ chối</option>
              </select>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at-desc">Mới nhất</option>
                <option value="created_at-asc">Cũ nhất</option>
                <option value="views-desc">Lượt xem cao nhất</option>
                <option value="views-asc">Lượt xem thấp nhất</option>
                <option value="title-asc">Tiêu đề A-Z</option>
                <option value="title-desc">Tiêu đề Z-A</option>
              </select>
            </div>
          </div>

          {(searchTerm || filters.status !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-medium text-blue-600">{pagination.total}</span> kết quả
                {searchTerm && <span> cho "{searchTerm}"</span>}
                {filters.status !== 'all' && <span> với trạng thái "{getStatusDisplay(filters.status)}"</span>}
              </p>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Bài viết trong chủ đề: {topic.name}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Cập nhật liên tục</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Link key={post.id} href={`/posts/detail/${post.id}`} className="block">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        <div className="flex flex-col items-end space-y-1 ml-3">
                          {post.is_pinned && (
                            <Pin className="h-4 w-4 text-blue-600" />
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                            {getStatusDisplay(post.status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3" 
                         dangerouslySetInnerHTML={{ __html: post.description.substring(0, 120) + '...' }}>
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{post.user?.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments_count || 0}</span>
                          </div>
                        </div>
                        {post.points !== undefined && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{post.points} điểm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài viết</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Không có bài viết nào phù hợp với từ khóa tìm kiếm" 
                    : "Chưa có bài viết nào trong chủ đề này"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !postsLoading && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, pagination.total)}</span> của{' '}
                      <span className="font-medium">{pagination.total}</span> kết quả
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNumber === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;